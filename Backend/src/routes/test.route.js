import express from "express"
import { getShiprocketToken } from "../services/shiprocket.service.js"

const testRouter = express.Router()

testRouter.get("/shiprocket", async (req, res) => {
    try {
        const token = await getShiprocketToken()
        res.status(200).json({
            success: true,
            message: "Shiprocket token fetched successfully",
            tokenPreview: token.substring(0, 20) + "..." // Truncate token preview for response
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
})

export default testRouter