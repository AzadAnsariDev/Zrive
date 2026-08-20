import sellerModel from "../models/seller.model.js"
import { uploadFiles } from "../services/storage.service.js"
import userModel from "../models/user.model.js"

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

export const updateSellerProfile = async (req, res) => {
    try {
        const userId = req.user.id
        const { brandName, businessEmail, businessPhone, description, category, pickupAddress, payout } = req.body

        const seller = await sellerModel.findOne({ userId })
        if (!seller) {
            return res.status(404).json({
                message: "Seller profile not found",
                success: false
            })
        }

        if (brandName) seller.brandName = brandName.trim()
        if (businessEmail) seller.businessEmail = businessEmail.trim()
        if (businessPhone) seller.businessPhone = businessPhone.trim()
        if (description !== undefined) seller.description = description.trim()
        if (category) seller.category = category.trim()

        if (pickupAddress) {
            seller.pickupAddress = {
                ...seller.pickupAddress?.toObject?.() || {},
                ...pickupAddress
            }
        }

        if (payout) {
            seller.payout = {
                ...seller.payout?.toObject?.() || {},
                ...payout,
                verified: Boolean(payout.upiId)
            }
        }

        await seller.save()

        res.status(200).json({
            message: "Seller profile updated successfully",
            success: true,
            seller
        })
    } catch (err) {
        res.status(400).json({
            message: err.message,
            success: false
        })
    }
}

export const subscribeSellerPlan = async (req, res) => {
    try {
        const userId = req.user.id
        const { planKey } = req.body

        const PLANS = {
            starter: { name: "Starter Boost", price: 199, days: 3, boostMultiplier: 1.5 },
            growth: { name: "Growth Accelerate", price: 299, days: 7, boostMultiplier: 2.5 },
            elite: { name: "Elite Spotlight", price: 399, days: 15, boostMultiplier: 4.0 },
        }

        const selected = PLANS[planKey] || PLANS.growth

        const seller = await sellerModel.findOne({ userId })
        if (!seller) {
            return res.status(404).json({
                message: "Seller profile not found",
                success: false
            })
        }

        const now = new Date()
        const currentActiveTill = seller.plan?.activeTill && new Date(seller.plan.activeTill) > now
            ? new Date(seller.plan.activeTill)
            : now

        const newActiveTill = new Date(currentActiveTill.getTime() + selected.days * 24 * 60 * 60 * 1000)

        seller.plan = {
            name: selected.name,
            price: selected.price,
            days: selected.days,
            activeTill: newActiveTill,
            boostMultiplier: selected.boostMultiplier,
            status: "active"
        }

        await seller.save()

        res.status(200).json({
            message: `Successfully subscribed to ${selected.name} (${selected.days} Days Boost)!`,
            success: true,
            plan: seller.plan
        })
    } catch (err) {
        res.status(400).json({
            message: err.message,
            success: false
        })
    }
}

export const getSellerPayouts = async (req, res) => {
    try {
        const userId = req.user.id
        const seller = await sellerModel.findOne({ userId })

        if (!seller) {
            return res.status(404).json({
                message: "Seller profile not found",
                success: false
            })
        }

        // Calculate next 10-day payout date
        const now = new Date()
        const dayOfMonth = now.getDate()
        let nextPayoutDate = new Date(now)

        if (dayOfMonth <= 10) {
            nextPayoutDate.setDate(10)
        } else if (dayOfMonth <= 20) {
            nextPayoutDate.setDate(20)
        } else {
            // End of month / 1st of next month
            nextPayoutDate.setMonth(now.getMonth() + 1, 1)
        }
        nextPayoutDate.setHours(18, 0, 0, 0)

        const daysRemaining = Math.max(0, Math.ceil((nextPayoutDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))

        res.status(200).json({
            message: "Payout summary fetched successfully",
            success: true,
            payoutInfo: {
                cycleIntervalDays: 10,
                nextPayoutDate: nextPayoutDate.toISOString(),
                daysRemaining,
                upiId: seller.payout?.upiId || "",
                upiMobile: seller.payout?.upiMobile || seller.businessPhone || "",
                verified: seller.payout?.verified || false
            }
        })
    } catch (err) {
        res.status(500).json({
            message: err.message,
            success: false
        })
    }
}
