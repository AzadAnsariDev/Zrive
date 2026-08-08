import mongoose from "mongoose"
import adminModel from "../models/admin.model.js"
import config from "../config/config.js"

const resetPassword = async () => {
    await mongoose.connect(config.MONGO_URI)

    const newPassword = process.argv[2]

    if (!newPassword) {
        console.log("Usage: node scripts/resetAdminPassword.js <newPassword>")
        process.exit(1)
    }

    const admin = await adminModel.findOne({ email: config.ADMIN_EMAIL }).select("+password")

    if (!admin) {
        console.log("Admin not found")
        process.exit(1)
    }

    admin.password = newPassword  
    await admin.save()

    console.log("Admin password reset successfully")
    process.exit(0)
}

resetPassword()