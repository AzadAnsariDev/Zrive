import sellerModel from "../models/seller.model.js"
import { uploadFiles } from "../services/storage.service.js"

export const createBasicSellerApplication = async (req, res) => {
    const userId = req.user.id
    const { brandName, businessEmail, businessPhone } = req.body

    const existingSeller = await sellerModel.findOne({ userId })

    if (existingSeller) {
        return res.status(400).json({
            message: "Seller application already exists",
            success: false
        })
    }

    const seller = await sellerModel.create({
        userId,
        brandName,
        businessEmail,
        businessPhone
    })

    await userModel.findByIdAndUpdate(userId, { role: "basic_seller" })

    res.status(201).json({
        message: "Seller application started successfully",
        success: true,
        seller
    })
}

export const submitVerificationDetails = async (req, res) => {
    const userId = req.user.id
    const seller = await sellerModel.findOne({ userId })

    if (!seller) {
        return res.status(404).json({
            message: "Seller application not found. Please complete basic details first",
            success: false
        })
    }

    if (!["basic", "rejected"].includes(seller.applicationStatus)) {
        return res.status(400).json({
            message: "Verification already submitted or approved",
            success: false
        })
    }

    if (!req.file) {
        return res.status(400).json({
            message: "PAN photo is required",
            success: false 
        })
    }

    const uploadResult = await uploadFiles({
        buffer: req.file.buffer,
        fileName: `pan_${userId}_${Date.now()}`,
        folderName: "Zrive/SellerKYC"
    })

    seller.pickupAddress = req.parsedPickupAddress
    seller.kyc = {
        panNumber: req.parsedKyc.panNumber,
        panPhotoUrl: uploadResult.url
    }
    seller.payout = req.parsedPayout
    seller.applicationStatus = "pending_verification"
    seller.rejectionReason = undefined

    await seller.save()

    res.status(200).json({
        message: "Verification details submitted. Review takes 24-36 hours, we'll notify you.",
        success: true,
        seller
    })
}

export const getMySellerApplication = async (req, res) => {
    const userId = req.user.id

    const seller = await sellerModel.findOne({ userId })

    if (!seller) {
        return res.status(200).json({
            message: "No seller application found",
            success: true,
            seller: null
        })
    }

    res.status(200).json({
        message: "Seller application fetched successfully",
        success: true,
        seller
    })
}
