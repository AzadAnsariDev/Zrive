import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: { type: String, default: "general", index: true },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "orders",
      default: null,
    },
    url: { type: String, default: "/orders" },
    isRead: { type: Boolean, default: false, index: true },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
  },
  { timestamps: true }
);

const notificationModel = mongoose.model("notifications", notificationSchema);

export default notificationModel;