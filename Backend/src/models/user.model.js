import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    contact: { type: String, required: false, unique: true, sparse: true },
    username: { type: String, required: true },
    password: {
        type: String,
        required: function () { return !this.googleId; },
        select: false
    },
    role: { type: String, enum: ["seller", "buyer", "basic_seller"], default: "buyer" },
    googleId: { type: String },
    gender: { type: String, enum: ["Male", "Female", "Prefer not to say"] },
    dob: { type: Date },
    preferences: {
        newsletter: { type: Boolean, default: true },
        orderUpdatesSms: { type: Boolean, default: true },
        size: { type: String, default: "M" }
    },

    strikeCount: { type: Number, default: 0 },       // reject=+1, timeout=+1.5
    isBanned: { type: Boolean, default: false },
    banExpiresAt: { type: Date },                     // Auto unban after 7 days
}, {
    timestamps: true
})

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10)
})

userSchema.methods.comparePassword = async function (password) {
    const isMatch = await bcrypt.compare(password, this.password)
    return isMatch
}

const userModel = mongoose.model("users", userSchema)
export default userModel