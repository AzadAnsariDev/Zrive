import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      unique: true,
    },
    brandName: { type: String, required: true },
    businessEmail: { type: String, required: true },
    businessPhone: { type: String, required: true },

    applicationStatus: {
      type: String,
      enum: ["basic", "pending_verification", "approved", "rejected"],
      default: "basic",
    },
    rejectionReason: String,

    pickupAddress: {
      addressLine1: String,
      addressLine2: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: "India" },
    },

    kyc: {
      panNumber: String,
      panPhotoUrl: String,
    },

    payout: {
      upiId: String,
      upiMobile: String,
      verified: { type: Boolean, default: false },
    },

    shiprocket: {
      pickupId: String,
      pickupNickname: String,
      verificationStatus: {
        type: String,
        enum: ["pending", "verified", "failed"],
        default: "pending",
      },
      syncError: String,
      retryCount: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

const sellerModel = mongoose.model("sellers", sellerSchema);
export default sellerModel;