import dotenv from "dotenv";
dotenv.config()

const required_key = [
    "MONGO_URI",
    "PORT",
    "JWT_SECRET",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "IMAGEKIT_PRIVATE_KEY",
    "RAZORPAY_KEY_ID",
    "RAZORPAY_KEY_SECRET",
    "RAZORPAY_WEBHOOK_SECRET",
    "ADMIN_EMAIL",              
    "ADMIN_SEED_PASSWORD",
    "ADMIN_JWT_SECRET",
    "SHIPROCKET_EMAIL",         
    "SHIPROCKET_PASSWORD"       
]

required_key.forEach((key) => {
    if (!process.env[key]) {
        throw new Error(`${key} is missing in .env`)
    }
})

const config = {
    MONGO_URI: process.env.MONGO_URI,
    PORT: process.env.PORT,
    JWT_SECRET: process.env.JWT_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY,
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
    RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_SEED_PASSWORD: process.env.ADMIN_SEED_PASSWORD,
    ADMIN_JWT_SECRET: process.env.ADMIN_JWT_SECRET,
    SHIPROCKET_EMAIL: process.env.SHIPROCKET_EMAIL,
    SHIPROCKET_PASSWORD: process.env.SHIPROCKET_PASSWORD
}

export default config