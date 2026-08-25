import orderModel from "../models/order.model.js";
import { createRefund } from "../services/razorpay.service.js";
import { applyStrike } from "./sellerPenalty.service.js";
// Phase 1: Database state changes inside transaction. External API calls (Razorpay) are intentionally deferred to Phase 2.
export const prepareOrderRejection = async ({
  order,
  reason,
  weight,
  session,
  note = undefined,
}) => {
  const refundAmount = order.sellerAmount.amount;

  order.orderStatus = "cancelled";
  order.confirmationStatus = "rejected";
  order.cancelledAt = new Date();
  order.cancelReason = reason;
  if (note) order.rejectionNote = note;

  order.refund = {
    amount: refundAmount,
    status: "pending",
  };

  await order.save({ session });

  await applyStrike({ sellerId: order.seller, weight, session });

  return order;
};

// Phase 2: Post-commit Razorpay refund execution. Idempotent to safely support cron retries.
const MAX_REFUND_RETRIES = 5;

export const processRefund = async (orderId) => {
  const order = await orderModel.findById(orderId).populate("payment");
  if (!order) throw new Error("Order not found");

  if (order.refund?.status === "processed") {
    return order;
  }

  if (order.refund?.status === "permanently_failed") {
    throw new Error("Refund permanently failed — needs manual review");
  }

  const payment = order.payment;
  const refundAmount = order.refund?.amount ?? order.sellerAmount.amount;

  order.refund.status = "initiated";
  order.refund.initiatedAt = new Date();
  order.refund.retryCount = (order.refund.retryCount || 0) + 1;
  await order.save();

  try {
    const refund = await createRefund({
      paymentId: payment.razorpay.payment_id,
      amount: refundAmount * 100,
      notes: { orderId: order._id.toString() },
    });

    order.refund.refundId = refund.id;
    order.refund.status = "processed";
    order.refund.completedAt = new Date();
    await order.save();

    payment.refunds.push({
      orderId: order._id,
      refundId: refund.id,
      amount: refundAmount,
      status: "processed",
    });
    payment.refundedAmount = (payment.refundedAmount || 0) + refundAmount;
    payment.status =
      payment.refundedAmount >= payment.price.amount ? "refunded" : "partially_refunded";
    await payment.save();

    return order;
  } catch (err) {
    if (err?.error?.description?.includes("fully refunded")) {
      order.refund.status = "processed";
      order.refund.completedAt = new Date();
      await order.save();
      return order;
    }

    order.refund.status =
      order.refund.retryCount >= MAX_REFUND_RETRIES ? "permanently_failed" : "failed";
    order.refund.failureReason = err?.error?.description || err.message || "Unknown error";
    await order.save();
    throw err;
  }
};