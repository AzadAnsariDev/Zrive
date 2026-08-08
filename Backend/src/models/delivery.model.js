import mongoose from "mongoose";

const deliverySchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "orders",
      required: true,
      unique: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },

    shiprocketOrderId: { type: String },
    shipmentId: { type: String },

    awbCode: { type: String, default: null },
    courierName: { type: String, default: null },
    courierCompanyId: { type: String, default: null },

    status: {
      type: String,
      enum: [
        "order_created",      // shiprocket pe order create hua
        "awb_assigned",       // courier assign hua
        "pickup_scheduled",   // pickup request bhej di
        "picked_up",
        "in_transit",
        "delivered",
        "cancelled",
        "failed",
      ],
      default: "order_created",
    },
    pickupScheduledDate: Date,
    statusHistory: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: String,
      },
    ],

    labelUrl: { type: String, default: null },
    invoiceUrl: { type: String, default: null },

    syncError: { type: String, default: null },
  },
  { timestamps: true }
);

const deliveryModel = mongoose.model("deliveries", deliverySchema);
export default deliveryModel;