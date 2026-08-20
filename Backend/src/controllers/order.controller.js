import mongoose from "mongoose";
import {
  createRazorpayOrder,
  createRefund,
} from "../services/razorpay.service.js";
import { getCartDetails } from "./cart.controller.js";
import paymentModel from "../models/payment.model.js";
import { validatePaymentVerification } from "razorpay/dist/utils/razorpay-utils.js";
import config from "../config/config.js";
import addressModel from "../models/address.model.js";
import orderModel from "../models/order.model.js";
import cartModel from "../models/cart.model.js";
import sellerModel from "../models/seller.model.js";
import crypto from "crypto";
import { prepareOrderRejection, processRefund } from "../services/orderRejection.service.js";
import { deductStock, restoreStock } from "../services/inventory.service.js";
import { createDeliveryForOrder, assignAWBForDelivery, generateLabelForDelivery } from "../services/delivery.service.js";
import { notifyOrderPlaced, notifyOrderRejected, notifyOrderCancelled } from "../services/order-notification.service.js";

export const createOrder = async (req, res) => {
  try {
    const { addressId } = req.body;

    if (!addressId) {
      return res
        .status(400)
        .json({ success: false, message: "Address is required" });
    }

    const address = await addressModel.findOne({
      _id: addressId,
      user: req.user.id,
    });

    if (!address) {
      return res
        .status(404)
        .json({ success: false, message: "Address not found" });
    }

    const shippingAddressSnapshot = {
      name: address.fullName,
      line1: address.addressLine1,
      line2: address.addressLine2,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      phone: address.phone,
      addressType: address.addressType,
    };

    const filter = req.user
      ? { user: new mongoose.Types.ObjectId(req.user.id) }
      : { guestId: req.guestId };

    const cart = await getCartDetails(filter);
    if (!cart.items || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    const razorpayOrder = await createRazorpayOrder({
      amount: cart.totalPrice,
      currency: cart.currency,
    });

    const payment = await paymentModel.create({
      user: req.user.id,
      price: {
        amount: cart.totalPrice,
        currency: cart.currency,
      },
      razorpay: {
        orderId: razorpayOrder.id,
      },
    });

    const sellerGroups = {};
    for (const item of cart.items) {
      const sellerId = item.product.seller?.toString();
      if (!sellerId) continue;

      if (!sellerGroups[sellerId]) sellerGroups[sellerId] = [];
      sellerGroups[sellerId].push(item);
    }

    const createdOrders = [];
    for (const sellerId of Object.keys(sellerGroups)) {
      const items = sellerGroups[sellerId];

      const orderItems = items.map((item) => ({
        title: item.product.title,
        productId: item.product._id,
        variantId: item.variant,
        quantity: item.quantity,
        price: { amount: item.unitPrice, currency: item.currency },
        images: item.product.variants.images,
      }));

      const sellerAmount = items.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0,
      );

      const order = await orderModel.create({
        user: req.user.id,
        seller: sellerId,
        orderItems,
        payment: payment._id,
        sellerAmount: { amount: sellerAmount, currency: cart.currency },
        shippingAddress: shippingAddressSnapshot,
        orderStatus: "pending_payment",
      });

      createdOrders.push(order);
    }

    res.status(201).json({
      success: true,
      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },
      paymentId: payment._id,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
      error: err,
    });
  }
};

export const verifyOrder = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  const payment = await paymentModel.findOne({
    "razorpay.orderId": razorpay_order_id,
  });

  if (!payment) {
    return res
      .status(404)
      .json({ message: "Payment record not found", success: false });
  }

  if (payment.status === "paid") {

    if (!payment.razorpay.payment_id) {
      payment.razorpay.payment_id = razorpay_payment_id;
    }

    if (!payment.razorpay.signature) {
      payment.razorpay.signature = razorpay_signature;
    }

    await payment.save();

    return res.status(200).json({
      success: true,
      message: "Payment already processed"
    });
  }
  const isValid = validatePaymentVerification(
    {
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
    },
    razorpay_signature,
    config.RAZORPAY_KEY_SECRET,
  );

  if (!isValid) {
    return res.status(400).json({
      message: "Invalid payment verification data provided",
      success: false,
    });
  }

  console.log("Setted all paymwnt");
  // Success path logic remains clean
  payment.status = "paid";
  payment.razorpay.payment_id = razorpay_payment_id;
  payment.razorpay.signature = razorpay_signature;
  await payment.save();

  await orderModel.updateMany(
    { payment: payment._id },
    {
      $set: {
        orderStatus: "placed",
        confirmationDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
      }
    },
  );

  await cartModel.findOneAndUpdate(
    { user: req.user.id },
    { $set: { items: [] } },
  );

  // Send notifications to buyer & seller (non-blocking)
  const orders = await orderModel.find({ payment: payment._id });
  for (const order of orders) {
    await notifyOrderPlaced(order);
  }

  return res.status(200).json({
    message: "Payment verified successfully",
    success: true,
  });
};

export const webhook = async (req, res) => {
  console.log("Webhook Hit");
  try {
    const webhookSignature = req.headers["x-razorpay-signature"];

    const expectedSignature = crypto
      .createHmac("sha256", config.RAZORPAY_WEBHOOK_SECRET)
      .update(req.body)
      .digest("hex");

    if (expectedSignature !== webhookSignature) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid webhook signature" });
    }

    const payload = JSON.parse(req.body.toString());
    const event = payload.event;

    // ── Refund events — alag branch, kyunki payload me order_id nahi
    // payment_id hota hai, aur payment.status yahan "pending" nahi hoga
    if (event === "refund.processed" || event === "refund.failed") {
      const refundEntity = payload.payload.refund.entity;
      const razorpayRefundId = refundEntity.id; // e.g. rfnd_xxxxx

      const payment = await paymentModel.findOne({
        "refunds.refundId": razorpayRefundId,
      });

      if (!payment) {
        console.log("Webhook: no payment found for refund", razorpayRefundId);
        return res.status(200).json({ success: true });
      }

      const refundSub = payment.refunds.find(
        (r) => r.refundId === razorpayRefundId,
      );
      if (!refundSub) return res.status(200).json({ success: true });

      const newStatus = event === "refund.processed" ? "processed" : "failed";
      refundSub.status = newStatus;

      if (newStatus === "processed") {
        payment.refundedAmount =
          (payment.refundedAmount || 0) + refundSub.amount;
        payment.status =
          payment.refundedAmount >= payment.price.amount
            ? "refunded"
            : "partially_refunded";
      }

      await payment.save();

      await orderModel.updateMany(
        { payment: payment._id, "refund.refundId": razorpayRefundId },
        { $set: { "refund.status": newStatus } },
      );

      return res.status(200).json({ success: true });
    }

    // ── Payment events (existing logic) ──────────────────────
    const razorpayOrderId = payload.payload.payment.entity.order_id;

    const payment = await paymentModel.findOne({
      "razorpay.orderId": razorpayOrderId,
    });
    console.log(payment);
    if (!payment || payment.status !== "pending") {
      return res.status(200).json({ success: true });
    }

    if (event === "payment.captured") {
      payment.status = "paid";
      payment.razorpay.payment_id = payload.payload.payment.entity.id;
      await payment.save();

      await orderModel.updateMany(
        { payment: payment._id },
        {
          $set: {
            orderStatus: "placed",
            confirmationDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
        },
      );

      const orders = await orderModel.find({ payment: payment._id });

      await cartModel.findOneAndUpdate(
        { user: orders[0].user },
        { $set: { items: [] } },
      );

      // Send notifications to buyers & sellers (non-blocking)
      for (const order of orders) {
        await notifyOrderPlaced(order);
      }
    } else if (event === "payment.failed") {
      payment.status = "failed";
      await payment.save();

      await orderModel.updateMany(
        { payment: payment._id },
        { $set: { orderStatus: "cancelled" } },
      );
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getOrders = async (req, res) => {
  const orders = await orderModel
    .find({ user: req.user.id, orderStatus: { $ne: "pending_payment" } })
    .sort({ createdAt: -1 });

  res.status(200).json({
    message: orders.length ? "Orders fetched successfully" : "No orders found",
    success: true,
    orders,
  });
};

export const getOrderById = async (req, res) => {
  const { orderId } = req.params;

  const order = await orderModel.findOne({ _id: orderId, user: req.user.id });

  if (!order) {
    return res.status(200).json({
      message: "No order found",
      success: false,
    });
  }

  res.status(200).json({
    message: "Order fetched successfully",
    success: true,
    order,
  });
};

export const cancelOrder = async (req, res) => {
  const { orderId } = req.params;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Lock order to prevent duplicate cancellation requests
    const order = await orderModel
      .findOneAndUpdate(
        {
          _id: orderId,
          orderStatus: { $in: ["placed", "confirmed"] },
          cancelInProgress: { $ne: true },
        },
        {
          $set: { cancelInProgress: true },
        },
        {
          new: true,
          session,
        }
      )
      .populate("payment");

    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Order not found or cannot be cancelled.",
      });
    }

    if (order.user.toString() !== req.user.id.toString()) {
      await session.abortTransaction();
      return res.status(403).json({
        success: false,
        message: "Not authorized.",
      });
    }

    if (!order.payment) {
      throw new Error("Payment record not found.");
    }

    const wasConfirmed = order.orderStatus === "confirmed";

    // Restore inventory only if stock was deducted earlier
    if (wasConfirmed) {
      for (const item of order.orderItems) {
        await restoreStock({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          orderId: order._id,
          reason: "order_cancelled",
          performedBy: req.user.id,
          session,
        });
      }
    }

    const payment = order.payment;
    const refundAmount = order.sellerAmount.amount;

    // Initiate Razorpay refund
    const refund = await createRefund({
      paymentId: payment.razorpay.payment_id,
      amount: refundAmount * 100,
      notes: {
        orderId: order._id.toString(),
      },
    });

    // Update order
    order.orderStatus = "cancelled";
    order.cancelledAt = new Date();
    order.cancelReason = "buyer_cancelled";
    order.cancelInProgress = false;

    order.refund = {
      refundId: refund.id,
      amount: refundAmount,
      status: "initiated",
      initiatedAt: new Date(),
    };

    await order.save({ session });

    // Update payment
    payment.refunds.push({
      orderId: order._id,
      refundId: refund.id,
      amount: refundAmount,
      status: "initiated",
    });

    payment.refundedAmount =
      (payment.refundedAmount || 0) + refundAmount;

    payment.status =
      payment.refundedAmount >= payment.price.amount
        ? "refunded"
        : "partially_refunded";

    await payment.save({ session });

    await session.commitTransaction();

    // Send cancellation notifications (non-blocking)
    await notifyOrderCancelled(order);

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully.",
      order,
    });
  } catch (err) {
    await session.abortTransaction();

    console.error("Cancel Order Error:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to cancel order.",
    });
  } finally {
    session.endSession();
  }
};

export const acceptOrder = async (req, res) => {
  const { orderId } = req.params;
  const session = await mongoose.startSession();
  session.startTransaction();
  let order;

  try {
    order = await orderModel.findOne({
      _id: orderId,
      orderStatus: "placed",
      confirmationStatus: "pending",
    }).session(session);

    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Order not found or already actioned" });
    }

    const sellerProfile = await sellerModel.findOne({ _id: order.seller, userId: req.user.id }).session(session);
    if (!sellerProfile) {
      await session.abortTransaction();
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    for (const item of order.orderItems) {
      await deductStock({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        orderId: order._id,
        performedBy: req.user.id,
        session,
      });
    }

    order.orderStatus = "confirmed";
    order.confirmationStatus = "accepted";
    await order.save({ session });

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    console.error(err);

    const isStockError = err.message?.includes("Insufficient stock");
    return res.status(isStockError ? 400 : 500).json({
      success: false,
      message: isStockError ? "Not enough stock to confirm this order" : "Could not accept order",
    });
  } finally {
    session.endSession();
  }

  try {
    const delivery = await createDeliveryForOrder(order._id)

    await assignAWBForDelivery(delivery._id)

    return res.status(200).json({
      success: true,
      message: "Order accepted and delivery created successfully",
    });

  } catch (error) {
    return res.status(200).json({
      message: "Order accepted, but Shiprocket sync failed — will retry",
      success: true,
      shiprocketError: error.message,
    })
  }
};

export const rejectOrder = async (req, res) => {
  const { orderId } = req.params;
  const { reason, note } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  let order;
  try {
    order = await orderModel
      .findOne({
        _id: orderId,
        orderStatus: "placed",
        confirmationStatus: "pending",
      })
      .populate("payment")
      .session(session);

    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Order not found or already actioned" });
    }

    const sellerProfile = await sellerModel.findOne({ _id: order.seller, userId: req.user.id }).session(session);
    if (!sellerProfile) {
      await session.abortTransaction();
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    await prepareOrderRejection({
      order,
      reason: reason || "out_of_stock",
      weight: 1,
      note,
      session,
    });

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    console.error(err);
    return res.status(500).json({ success: false, message: "Could not reject order" });
  } finally {
    session.endSession();
  }

  try {
    order = await processRefund(order._id);
  } catch (err) {
    console.error("Refund failed, will need retry:", err.message);
  }

  // Send rejection notification to buyer (non-blocking)
  await notifyOrderRejected(order);

  return res.status(200).json({
    success: true,
    message: "Order rejected" + (order.refund?.status === "processed" ? ", refund processed" : ", refund pending"),
    order,
  });
};

export const getSellerOrders = async (req, res) => {
  try {
    const sellerProfile = await sellerModel.findOne({ userId: req.user.id })
    if (!sellerProfile) {
      return res.status(404).json({ success: false, message: "Seller profile not found" })
    }

    const sellerId = sellerProfile._id

    const orders = await orderModel.find({
      seller: sellerId,
    }).sort({ createdAt: -1 })

    res.status(200).json({
      message: "Seller orders fetched successfully",
      success: true,
      orders,
    })
  } catch (err) {
    res.status(500).json({
      message: err.message,
      success: false,
    })
  }
}

export const getSellerOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const sellerProfile = await sellerModel.findOne({ userId: req.user.id })
    if (!sellerProfile) {
      return res.status(404).json({ success: false, message: "Seller profile not found" })
    }

    const sellerId = sellerProfile._id;

    const order = await orderModel
      .findOne({
        _id: orderId,
        seller: sellerId,
      })
      .populate("user", "name email phone")
      .populate("orderItems.productId");

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Order fetched successfully",
      success: true,
      order,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
      success: false,
    });
  }
};

