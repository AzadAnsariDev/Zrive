import mongoose from "mongoose";
import { createRazorpayOrder } from "../services/razorpay.service.js";
import { getCartDetails } from "./cart.controller.js";
import paymentModel from "../models/payment.model.js";
import { validatePaymentVerification } from 'razorpay/dist/utils/razorpay-utils.js'
import config from "../config/config.js";
import addressModel from "../models/address.model.js";
import orderModel from "../models/order.model.js";

export const createOrderController = async (req, res) => {
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

  const payment = await paymentModel.findOne({ "razorpay.orderId": razorpay_order_id, status: "pending" })

  if (!payment) {
    return res.status(400).json({
      message: "Payment not found",
      success: false
    })
  }

  const isValid = validatePaymentVerification({
    order_id: razorpay_order_id,
    payment_id: razorpay_payment_id
  },
    razorpay_signature,
    config.RAZORPAY_KEY_SECRET
  )

  if (!isValid) {
    payment.status = "failed"

    await payment.save()

    await orderModel.updateMany(
      { payment: payment._id },
      { $set: { orderStatus: "cancelled" } }
    );

    return res.status(400).json({
      message: "Payment verification failed",
      success: false
    })
  }

  payment.status = "paid",
    payment.razorpay.payment_id = razorpay_payment_id,
    payment.razorpay.signature = razorpay_signature

  await payment.save()

  await orderModel.updateMany(
    { payment: payment._id },
    { $set: { orderStatus: "placed" } }
  );

  return res.status(201).json({
    message: "Payment verified successfully",
    success: true
  })
}