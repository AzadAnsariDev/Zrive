import config from "../config/config.js"
import adminModel from "../models/admin.model.js"
import jwt from 'jsonwebtoken'
import sellerModel from "../models/seller.model.js"
import userModel from "../models/user.model.js"
import { addPickupLocation } from "../services/shiprocket.service.js"

export const adminLogin = async (req, res) => {
    const { email, password } = req.body

    const admin = await adminModel.findOne({ email }).select("+password +email")

    if (!admin) {
        return res.status(401).json({
            message: "Invalid Credentials",
            success: false
        })
    }

    const isMatch = await admin.comparePassword(password)

    if (!isMatch) {
        return res.status(401).json({
            message: "Invalid Credentials",
            success: false
        })
    }

    const token = jwt.sign(
        { id: admin._id },
        config.ADMIN_JWT_SECRET,
        { expiresIn: "7d" }
    )

    res.cookie("adminToken", token, {
        httpOnly: true,
    })

    res.status(200).json({
        message: "Admin logged in successfully",
        success: true,
        admin: { email: admin.email }
    })
}

export const adminLogout = async (req, res) => {
    const token = req.cookies.adminToken

    await adminModel.findByIdAndUpdate(req.admin.id, {
        $push: { blacklistedTokens: token }
    })

    res.clearCookie("adminToken")
    res.status(200).json({ message: "Admin logged out successfully", success: true })
}

export const getAllSellerApplications = async (req, res) => {
    const applications = await sellerModel
        .find({})
        .select("brandName businessEmail applicationStatus rejectionReason createdAt")
        .populate("userId", "username")

    res.status(200).json({
        message: "Seller applications fetched successfully",
        success: true,
        applications
    })
}

export const getSellerApplicationDetail = async (req, res) => {
    const { sellerId } = req.params

    const seller = await sellerModel.findById(sellerId).populate("userId", "email username contact")

    if (!seller) {
        return res.status(404).json({ message: "Seller application not found", success: false })
    }

    res.status(200).json({
        message: "Seller application fetched successfully",
        success: true,
        seller
    })
}

export const approveSellerApplication = async (req, res) => {
    const { sellerId } = req.params

    const seller = await sellerModel.findById(sellerId)

    if (!seller) {
        return res.status(404).json({ message: "Seller application not found", success: false })
    }

    try {
        const { pickupId, pickupNickname } = await addPickupLocation(seller)

        seller.shiprocket.pickupId = pickupId
        seller.shiprocket.pickupNickname = pickupNickname
        seller.shiprocket.verificationStatus = "verified"
        seller.shiprocket.syncError = null
    } catch (error) {
        seller.shiprocket.verificationStatus = "failed"
        seller.shiprocket.syncError = error.response?.data?.message || error.message
        seller.shiprocket.retryCount += 1

        await seller.save()

        return res.status(502).json({
            message: "Seller approved locally failed — Shiprocket pickup sync failed",
            success: false,
            error: seller.shiprocket.syncError
        })
    }

    seller.applicationStatus = "approved"
    await seller.save()

    await userModel.findByIdAndUpdate(seller.userId, { role: "seller" })

    res.status(200).json({
        message: "Seller approved successfully",
        success: true,
        seller
    })
}

export const rejectSellerApplication = async (req, res) => {
    const { sellerId } = req.params
    const { reason } = req.body

    const seller = await sellerModel.findById(sellerId)

    if (!seller) {
        return res.status(404).json({ message: "Seller application not found", success: false })
    }

    if (seller.applicationStatus !== "pending_verification") {
        return res.status(400).json({ message: "This application is not pending verification", success: false })
    }

    seller.applicationStatus = "rejected"
    seller.rejectionReason = reason || "Not specified"
    await seller.save()

    res.status(200).json({
        message: "Seller application rejected",
        success: true,
        seller
    })
}

export const getAdminProfile = async (req, res) => {
  try {
    return res.status(200).json({
      admin: {
        id: req.admin._id,
        email: req.admin.email,
      },
    })
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch admin profile' })
  }
}

