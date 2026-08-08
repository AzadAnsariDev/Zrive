import {
    assignAWBForDelivery,
    schedulePickupForDelivery,
    generateLabelForDelivery,
    trackDelivery,
} from "../services/delivery.service.js"
import deliveryModel from "../models/delivery.model.js"
import { createDeliveryForOrder } from "../services/delivery.service.js"

export const getFailedDeliveries = async (req, res) => {
    const failedDeliveries = await deliveryModel
        .find({ status: "failed" })
        .populate("order", "orderItems shippingAddress")
        .populate("seller", "email username")
        .sort({ createdAt: -1 })

    res.status(200).json({
        success: true,
        message: "Failed deliveries fetched successfully",
        count: failedDeliveries.length,
        deliveries: failedDeliveries,
    })
}

export const retryDeliverySync = async (req, res) => {
    const { deliveryId } = req.params

    const delivery = await deliveryModel.findById(deliveryId)

    if (!delivery) {
        return res.status(404).json({ success: false, message: "Delivery record not found" })
    }

    if (delivery.status !== "failed") {
        return res.status(400).json({
            success: false,
            message: `Cannot retry — current status is '${delivery.status}', not 'failed'`,
        })
    }

    try {
        // purana failed record delete karo, naya successful record banega createDeliveryForOrder se
        await deliveryModel.findByIdAndDelete(deliveryId)

        const newDelivery = await createDeliveryForOrder(delivery.order)

        res.status(200).json({
            success: true,
            message: "Retry successful — shipment created",
            delivery: newDelivery,
        })
    } catch (error) {
        res.status(502).json({
            success: false,
            message: "Retry failed again",
            error: error.response?.data?.message || error.message,
        })
    }
}

export const assignAWBController = async (req, res) => {
    try {
        const delivery = await deliveryModel.findById(req.params.deliveryId)

        if (!delivery) {
            return res.status(404).json({ success: false, message: "Delivery not found" })
        }

        if (delivery.seller.toString() !== req.user.id.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized" })
        }

        const updatedDelivery = await assignAWBForDelivery(req.params.deliveryId)
        res.status(200).json({ success: true, message: "AWB assigned", delivery: updatedDelivery })
    } catch (error) {
        res.status(502).json({ success: false, message: error.message })
    }
}

export const schedulePickupController = async (req, res) => {
    try {
        const delivery = await deliveryModel.findById(req.params.deliveryId)

        if (!delivery) {
            return res.status(404).json({ success: false, message: "Delivery not found" })
        }

        if (delivery.seller.toString() !== req.user.id.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized" })
        }

        const updatedDelivery = await schedulePickupForDelivery(req.params.deliveryId)
        res.status(200).json({ success: true, message: "Pickup scheduled", delivery: updatedDelivery })
    } catch (error) {
        res.status(502).json({ success: false, message: error.message })
    }
}

export const generateLabelController = async (req, res) => {
    try {
        const delivery = await deliveryModel.findById(req.params.deliveryId)

        if (!delivery) {
            return res.status(404).json({ success: false, message: "Delivery not found" })
        }

        if (delivery.seller.toString() !== req.user.id.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized" })
        }

        const updatedDelivery = await generateLabelForDelivery(req.params.deliveryId)
        res.status(200).json({ success: true, message: "Label & invoice generated", delivery: updatedDelivery })
    } catch (error) {
        res.status(502).json({ success: false, message: error.message })
    }
}

export const trackDeliveryController = async (req, res) => {
    try {
        const delivery = await deliveryModel.findById(req.params.deliveryId)

        if (!delivery) {
            return res.status(404).json({ success: false, message: "Delivery not found" })
        }

        if (delivery.seller.toString() !== req.user.id.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized" })
        }

        const trackingData = await trackDelivery(req.params.deliveryId)
        res.status(200).json({ success: true, tracking: trackingData })
    } catch (error) {
        res.status(502).json({ success: false, message: error.message })
    }
}