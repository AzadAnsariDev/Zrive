import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "products", required: true },
    variantId: { type: mongoose.Schema.Types.ObjectId, required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "orders" },

    type: {
      type: String,
      enum: ["deduction", "restoration", "manual_update", "initial_stock"],
      required: true,
    },
    quantityChange: { type: Number, required: true },
    previousStock: { type: Number, required: true },
    newStock: { type: Number, required: true },

    reason: {
      type: String,
      enum: [
        "order_confirmed",
        "order_cancelled",
        "order_rejected",
        "order_expired",
        "seller_manual_edit",
        "initial_creation",
      ],
      required: true,
    },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  },
  { timestamps: true },
);

const inventoryModel = mongoose.model("inventory", inventorySchema);
export default inventoryModel;