import mongoose from "mongoose"
import adminModel from "../models/admin.model.js"
import config from "../config/config.js"

const seedAdmin = async () => {
    await mongoose.connect(config.MONGO_URI)

    const existingAdmin = await adminModel.findOne({ email: config.ADMIN_EMAIL })

    if (existingAdmin) {
        console.log("Admin already exists. Aborting.")
        process.exit(0)
    }

    await adminModel.create({
        email: config.ADMIN_EMAIL,
        password: config.ADMIN_SEED_PASSWORD,  // pre-save hook khud hash kar dega
    })

    console.log("Admin created successfully")
    process.exit(0)
}

seedAdmin()