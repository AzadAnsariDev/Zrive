import { createRefund } from "../services/razorpay.service.js";
import { applyStrike } from "./sellerPenalty.service.js";

/**
 * Core reject/auto-timeout logic — refund + order cancel + strike
 * Order aur payment already session ke saath fetched hone chahiye (populate("payment"))
 * Caller transaction start/commit/abort handle karega
 */
export const processOrderRejection = async ({
  order,
  reason,
  weight,
  session,
  note = undefined,
}) => {
  const payment = order.payment;
  const refundAmount = order.sellerAmount.amount;

  const refund = await createRefund({
    paymentId: payment.razorpay.payment_id,
    amount: refundAmount * 100,
    notes: { orderId: order._id.toString() },
  });

  order.orderStatus = "cancelled";
  order.confirmationStatus = "rejected";
  order.cancelledAt = new Date();
  order.cancelReason = reason;
  if (note) order.rejectionNote = note;
  order.refund = {
    refundId: refund.id,
    amount: refundAmount,
    status: "initiated",
    initiatedAt: new Date(),
  };
  await order.save({ session });

  payment.refunds.push({
    orderId: order._id,
    refundId: refund.id,
    amount: refundAmount,
    status: "initiated",
  });
  payment.refundedAmount = (payment.refundedAmount || 0) + refundAmount;
  payment.status =
    payment.refundedAmount >= payment.price.amount
      ? "refunded"
      : "partially_refunded";
  await payment.save({ session });

  await applyStrike({ sellerId: order.seller, weight, session });

  return order;
};