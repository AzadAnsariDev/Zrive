import mongoose from "mongoose";
import { createRazorpayOrder } from "../services/razorpay.service.js";
import { getCartDetails } from "./cart.controller.js";
import paymentModel from "../models/payment.model.js";
import { validatePaymentVerification } from 'razorpay/dist/utils/razorpay-utils.js'
import config from "../config/config.js";
import addressModel from "../models/address.model.js";
import orderModel from "../models/order.model.js";
import cartModel from "../models/cart.model.js";
import crypto from 'crypto'

export const createOrder = async (req, res) => {
  try {
    const { addressId } = req.body

    if (!addressId) {
      return res.status(400).json({ success: false, message: "Address is required" });
    }

    const address = await addressModel.findOne({ _id: addressId, user: req.user.id })

    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
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
        currency: cart.currency
      },
      razorpay: {
        orderId: razorpayOrder.id
      }
    })

    const sellerGroups = {};
    for (const item of cart.items) {
      const sellerId = item.product.seller.toString();
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
        0
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
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

  const payment = await paymentModel.findOne({ "razorpay.orderId": razorpay_order_id })

  if (!payment) {
    return res.status(404).json({ message: "Payment record not found", success: false })
  }

  if (payment.status === "paid") {
    return res.status(200).json({ message: "Payment already processed", success: true })
  }

  const isValid = validatePaymentVerification({
    order_id: razorpay_order_id,
    payment_id: razorpay_payment_id
  },
    razorpay_signature,
    config.RAZORPAY_KEY_SECRET
  )

  if (!isValid) {
    return res.status(400).json({
      message: "Invalid payment verification data provided",
      success: false
    })
  }

  // Success path logic remains clean
  payment.status = "paid"
  payment.razorpay.payment_id = razorpay_payment_id
  payment.razorpay.signature = razorpay_signature
  await payment.save()

  await orderModel.updateMany(
    { payment: payment._id },
    { $set: { orderStatus: "placed" } }
  );

  await cartModel.findOneAndUpdate(
    { user: req.user.id },
    { $set: { items: [] } }
  );

  return res.status(200).json({
    message: "Payment verified successfully",
    success: true
  })
}

export const webhook = async (req, res) => {
  console.log("Webhook Hit");
  try {
    const webhookSignature = req.headers["x-razorpay-signature"];

    const expectedSignature = crypto
      .createHmac("sha256", config.RAZORPAY_WEBHOOK_SECRET)
      .update(req.body)
      .digest("hex");
    console.log("Webhook:", webhookSignature);
    console.log("Expected:", expectedSignature);

    if (expectedSignature !== webhookSignature) {
      return res.status(400).json({ success: false, message: "Invalid webhook signature" });
    }

    const payload = JSON.parse(req.body.toString());
    const event = payload.event;
    const razorpayOrderId = payload.payload.payment.entity.order_id;

    const payment = await paymentModel.findOne({ "razorpay.orderId": razorpayOrderId });
    console.log(payment);
    if (!payment || payment.status !== "pending") {
      return res.status(200).json({ success: true });
    }

    if (event === "payment.captured") {
      payment.status = "paid";
      await payment.save();

      await orderModel.updateMany(
        { payment: payment._id },
        { $set: { orderStatus: "placed" } }
      );

      await cartModel.findOneAndUpdate(
        { user: req.user.id },
        { $set: { items: [] } }
      );

    } else if (event === "payment.failed") {
      payment.status = "failed";
      await payment.save();

      await orderModel.updateMany(
        { payment: payment._id },
        { $set: { orderStatus: "cancelled" } }
      );
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getOrders = async (req, res) => {
  const orders = await orderModel.find({ user: req.user.id }).sort({ createdAt: -1 });

  res.status(200).json({
    message: orders.length ? "Orders fetched successfully" : "No orders found",
    success: true,
    orders
  });
};

export const getOrderById = async (req, res)=>{

  const { orderId } = req.params

  const order = await orderModel.findOne({_id: orderId, user: req.user.id})

  if(!order){
    return res.status(200).json({
      message : "No order found",
      success: false
    })
  }

  res.status(200).json({
    message: "Order fetched successfully",
    success: true,
    order
  })
}