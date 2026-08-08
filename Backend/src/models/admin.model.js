import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const adminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      select: false,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    blacklistedTokens: [{ type: String }]
  },
  { timestamps: true }
)

adminSchema.pre("save", async function () {
    if (!this.isModified("password")) return
    this.password = await bcrypt.hash(this.password, 10)
})

adminSchema.methods.comparePassword = async function (password) {
    const isMatch = await bcrypt.compare(password, this.password)
    return isMatch
}

const adminModel = mongoose.model("admins", adminSchema)
export default adminModel