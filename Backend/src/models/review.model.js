import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "products",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "orders",
      required: true, // verified purchase ke liye zaroori
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId, // order.orderItems se aayega
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: { type: String, trim: true },
    comment: { type: String, trim: true },
    images: [{ url: { type: String, required: true } }],
    isVerifiedPurchase: { type: Boolean, default: true },
    helpfulCount: { type: Number, default: 0 },
    helpfulBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
    sellerReply: {
      text: { type: String },
      repliedAt: { type: Date },
    },
  },
  { timestamps: true }
);

// Ek order ke ek item pe sirf ek hi review — duplicate prevent
reviewSchema.index({ product: 1, user: 1, order: 1 }, { unique: true });

const reviewModel = mongoose.model("reviews", reviewSchema);
export default reviewModel;