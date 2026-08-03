import mongoose, { mongo } from "mongoose";
import priceSchema from "./price.schema.js";

const orderItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "products",
      required: true,
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: priceSchema, required: true },
    images: [{ url: String }],
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "payments",
      required: true,
    },
    orderItems: {
      type: [orderItemSchema],
      required: true,
      validate: [(arr) => arr.length > 0, "Order must have at least one item"],
    },
    sellerAmount: {
      type: priceSchema,
      required: true,
    },
    orderStatus: {
      type: String,
      enum: [
        "pending_payment",
        "placed",
        "confirmed",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending_payment",
    },
    shippingAddress: {
      name: { type: String, required: true },
      line1: { type: String, required: true },
      line2: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      phone: { type: String, required: true },
      addressType: { type: String, enum: ["Home", "Work", "Other"] },
    },
    cancelledAt: Date,
    cancelInProgress: { type: Boolean, default: false },
    refund: {
      refundId: String,
      amount: Number,
      status: { type: String, enum: ["initiated", "processed", "failed"] },
      initiatedAt: Date,
    },
  },
  { timestamps: true },
);

const orderModel = mongoose.model("orders", orderSchema);

export default orderModel;
