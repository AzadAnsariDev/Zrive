import mongoose from "mongoose"

const addressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    fullName: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    phone: { type: String, required: true },
    addressType: { type: String, enum: ["Home", "Work", "Other"], default: "Home"},
    isDefault: { type: Boolean, default: false }
}, { timestamps: true });

const addressModel = mongoose.model("addresses", addressSchema);
export default addressModel;