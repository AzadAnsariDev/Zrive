import mongoose from "mongoose";
import priceSchema from "./price.schema.js";

const refundSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "orders" },
    refundId: String,
    amount: Number,
    status: String,
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }   // yahan set karo
);


const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  price: {
    type: priceSchema,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "paid", "failed", "partially_refunded", "refunded"],
    default: "pending",
  },
  razorpay: {
    orderId: { type: String, required: true },
    payment_id: String,
    signature: String,
  },
  refunds: [ refundSchema ],
  refundedAmount: { type: Number, default: 0 },
});

const paymentModel = mongoose.model("payments", paymentSchema);

export default paymentModel;
