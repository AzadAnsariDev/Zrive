import orderModel from "../models/order.model.js"
import productModel from "../models/product.model.js"
import sellerModel from "../models/seller.model.js"
import userModel from "../models/user.model.js"
import deliveryModel from "../models/delivery.model.js"
import { createShiprocketOrder, buildShiprocketOrderPayload } from "./shiprocket.service.js"

const resolveItemShippingData = async (orderItem) => {
    const product = await productModel.findById(orderItem.productId)

    if (!product) {
        throw new Error(`Product not found for item: ${orderItem.title}`)
    }

    const variant = product.variants.id(orderItem.variantId)

    const weight = variant?.weight ?? product.shippingDefaults.weight
    const dimensions = {
        length: variant?.dimensions?.length ?? product.shippingDefaults.dimensions.length,
        width: variant?.dimensions?.width ?? product.shippingDefaults.dimensions.width,
        height: variant?.dimensions?.height ?? product.shippingDefaults.dimensions.height,
    }

    return {
        sku: variant?.sku,
        weight,
        dimensions,
    }
}

export const createDeliveryForOrder = async (orderId) => {
    const order = await orderModel.findById(orderId)

    if (!order) {
        throw new Error("Order not found")
    }

    const seller = await sellerModel.findOne({ userId: order.seller })

    if (!seller || !seller.shiprocket?.pickupNickname) {
        throw new Error("Seller pickup location not synced with Shiprocket")
    }

    const buyer = await userModel.findById(order.user)

    let totalWeight = 0
    let maxDimensions = { length: 0, width: 0, height: 0 }
    const shiprocketItems = []

    for (const item of order.orderItems) {
        const { sku, weight, dimensions } = await resolveItemShippingData(item)

        totalWeight += weight * item.quantity

        maxDimensions.length = Math.max(maxDimensions.length, dimensions.length)
        maxDimensions.width = Math.max(maxDimensions.width, dimensions.width)
        maxDimensions.height = Math.max(maxDimensions.height, dimensions.height)

        shiprocketItems.push({
            name: item.title,
            sku: sku,
            units: item.quantity,
            selling_price: item.price.amount,
        })
    }

    const payload = buildShiprocketOrderPayload({
        order,
        seller,
        buyerEmail: buyer.email,
        items: shiprocketItems,
        weight: totalWeight,
        dimensions: maxDimensions,
    })

    let shiprocketResponse
    try {
        shiprocketResponse = await createShiprocketOrder(payload)
    } catch (error) {
        await deliveryModel.create({
            order: order._id,
            seller: order.seller,
            status: "failed",
            syncError: error.response?.data?.message || error.message,
        })
        throw error
    }

    const delivery = await deliveryModel.create({
        order: order._id,
        seller: order.seller,
        shiprocketOrderId: shiprocketResponse.order_id,
        shipmentId: shiprocketResponse.shipment_id,
        status: "order_created",
        statusHistory: [{ status: "order_created", note: "Shiprocket order created successfully" }],
    })

    return delivery
}

import {
    assignAWB,
    requestPickup,
    generateLabel,
    generateInvoice,
    trackShipmentByAWB,
} from "./shiprocket.service.js"


export const assignAWBForDelivery = async (deliveryId) => {
    const delivery = await deliveryModel.findById(deliveryId)

    if (!delivery) throw new Error("Delivery not found")

    const result = await assignAWB(delivery.shipmentId)

    if (result.awb_assign_status === 0) {
        delivery.syncError = result.response?.data?.awb_assign_error || "AWB assignment failed"
        await delivery.save()
        throw new Error(delivery.syncError)
    }

    delivery.awbCode = result.response.data.awb_code
    delivery.courierName = result.response.data.courier_name
    delivery.courierCompanyId = result.response.data.courier_company_id
    delivery.status = "awb_assigned"
    delivery.statusHistory.push({ status: "awb_assigned", note: `Courier: ${delivery.courierName}` })
    delivery.syncError = null

    await delivery.save()
    return delivery
}


export const schedulePickupForDelivery = async (deliveryId) => {
    const delivery = await deliveryModel.findById(deliveryId)

    if (!delivery) throw new Error("Delivery not found")
    if (delivery.status !== "awb_assigned") {
        throw new Error(`Cannot schedule pickup — current status is '${delivery.status}'`)
    }

    const result = await requestPickup(delivery.shipmentId)

    delivery.status = "pickup_scheduled"
    delivery.pickupScheduledDate = result?.response?.pickup_scheduled_date || null
    delivery.statusHistory.push({
        status: "pickup_scheduled",
        note: result.response?.pickup_scheduled_date || "Pickup requested",
    })

    await delivery.save()
    return delivery
}


export const generateLabelForDelivery = async (deliveryId) => {
    const delivery = await deliveryModel.findById(deliveryId)

    if (!delivery) throw new Error("Delivery not found")

    const labelResult = await generateLabel(delivery.shipmentId)
    delivery.labelUrl = labelResult.label_url

    const invoiceResult = await generateInvoice(delivery.shiprocketOrderId)
    delivery.invoiceUrl = invoiceResult.invoice_url

    await delivery.save()
    return delivery
}


export const trackDelivery = async (deliveryId) => {
    const delivery = await deliveryModel.findById(deliveryId)

    if (!delivery || !delivery.awbCode) {
        throw new Error("AWB not assigned yet — cannot track")
    }

    const trackingData = await trackShipmentByAWB(delivery.awbCode)
    return trackingData
}