import {
    assignAWBForDelivery,
    schedulePickupForDelivery,
    generateLabelForDelivery,
    trackDelivery,
    cancelDeliveryForDelivery,
} from "../services/delivery.service.js"
import deliveryModel from "../models/delivery.model.js"
import { createDeliveryForOrder } from "../services/delivery.service.js"
import orderModel from "../models/order.model.js"
import sellerModel from "../models/seller.model.js"

const isDeliveryOwner = async (delivery, userId) => {
    if (!delivery?.seller || !userId) return false
    const seller = await sellerModel.findOne({ _id: delivery.seller, userId }).select("_id")
    return Boolean(seller)
}

export const getAllDeliveries = async (req, res) => {
    const deliveries = await deliveryModel
        .find({})
        .populate("order", "orderItems shippingAddress")
        .populate("seller", "email username")
        .sort({ createdAt: -1 })

    res.status(200).json({
        success: true,
        message: "Deliveries fetched successfully",
        count: deliveries.length,
        deliveries,
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

        if (!(await isDeliveryOwner(delivery, req.user.id))) {
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

        if (!(await isDeliveryOwner(delivery, req.user.id))) {
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

        if (!(await isDeliveryOwner(delivery, req.user.id))) {
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

        if (!(await isDeliveryOwner(delivery, req.user.id))) {
            return res.status(403).json({ success: false, message: "Not authorized" })
        }

        const trackingData = await trackDelivery(req.params.deliveryId)
        res.status(200).json({ success: true, delivery: trackingData })
    } catch (error) {
        res.status(502).json({ success: false, message: error.message })
    }
}

export const getDeliveryByOrderController = async (req, res) => {
    const delivery = await deliveryModel.findOne({ order: req.params.orderId })

    if (!delivery) {
        return res.status(404).json({ success: false, message: "Delivery not found for this order" })
    }

    if (!(await isDeliveryOwner(delivery, req.user.id))) {
        return res.status(403).json({ success: false, message: "Not authorized" })
    }

    res.status(200).json({ success: true, delivery })
}

export const cancelDeliveryController = async (req, res) => {
    try {
        const delivery = await deliveryModel.findById(req.params.deliveryId)
        if (!delivery) return res.status(404).json({ success: false, message: "Delivery not found" })
        if (!(await isDeliveryOwner(delivery, req.user.id))) {
            return res.status(403).json({ success: false, message: "Not authorized" })
        }
        const updatedDelivery = await cancelDeliveryForDelivery(req.params.deliveryId)
        res.status(200).json({ success: true, message: "Delivery cancelled", delivery: updatedDelivery })
    } catch (error) {
        res.status(502).json({ success: false, message: error.message })
    }
}


export const getDeliveryByOrderForBuyerController = async (req, res) => {
    const order = await orderModel.findById(req.params.orderId)

    if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" })
    }

    if (order.user.toString() !== req.user.id.toString()) {
        return res.status(403).json({ success: false, message: "Not authorized" })
    }

    const delivery = await deliveryModel.findOne({ order: req.params.orderId })

    if (!delivery) {
        return res.status(404).json({ success: false, message: "Delivery not found for this order" })
    }

    res.status(200).json({ success: true, delivery })
}

export const trackDeliveryForBuyerController = async (req, res) => {
    try {
        const delivery = await deliveryModel.findById(req.params.deliveryId)

        if (!delivery) {
            return res.status(404).json({ success: false, message: "Delivery not found" })
        }

        const order = await orderModel.findById(delivery.order)

        if (!order || order.user.toString() !== req.user.id.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized" })
        }

        const trackingData = await trackDelivery(req.params.deliveryId)
        res.status(200).json({ success: true, delivery: trackingData })
    } catch (error) {
        res.status(502).json({ success: false, message: error.message })
    }
}