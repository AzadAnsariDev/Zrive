import orderModel from "../models/order.model.js"
import productModel from "../models/product.model.js"
import sellerModel from "../models/seller.model.js"
import userModel from "../models/user.model.js"
import deliveryModel from "../models/delivery.model.js"
import { createShiprocketOrder, buildShiprocketOrderPayload, cancelShiprocketOrder } from "./shiprocket.service.js"
import {
    assignAWB,
    requestPickup,
    generateLabel,
    generateInvoice,
    trackShipmentByAWB,
    checkCourierServiceability
} from "./shiprocket.service.js"

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
        weight: totalWeight,
        dimensions: maxDimensions
    })

    return delivery
}


const MIN_RATING = 4
const MAX_DELIVERY_COST = 100

const getTopCandidates = (couriers = []) => {
    return couriers
        .filter((c) => Number(c.rating) >= MIN_RATING)
        .sort((a, b) => a.rate - b.rate)
        .slice(0, 3)
}

export const assignAWBForDelivery = async (deliveryId) => {
    const delivery = await deliveryModel.findById(deliveryId)
    if (!delivery) throw new Error("Delivery not found")

    const order = await orderModel.findById(delivery.order)
    if (!order) throw new Error("Order not found for this delivery")

    const seller = await sellerModel.findOne({ userId: delivery.seller })
    if (!seller?.pickupAddress?.pincode) {
        throw new Error("Seller pickup pincode missing — cannot check serviceability")
    }

    const serviceability = await checkCourierServiceability({
        pickup_postcode: seller.pickupAddress.pincode,
        delivery_postcode: order.shippingAddress.pincode,
        weight: delivery.weight,
        cod: order.paymentMethod === "cod" ? 1 : 0,
    })

    const candidates = getTopCandidates(serviceability?.available_courier_companies)

    if (!candidates.length) {
        delivery.status = "failed"
        delivery.syncError = "No courier found with rating >= 4"
        await delivery.save()
        throw new Error(delivery.syncError)
    }

    let lastError = null

    for (const courier of candidates) {
        if (courier.rate > MAX_DELIVERY_COST) {
            // TODO: notify seller ("Contact admin — higher delivery cost than expected")
            // TODO: notify admin ("Delivery cost higher than expected in this order")
            lastError = `Courier ${courier.courier_name} cost ₹${courier.rate} exceeds ₹${MAX_DELIVERY_COST} limit`
            break
        }

        try {
            const result = await assignAWB(delivery.shipmentId, courier.courier_company_id)

            if (result.awb_assign_status === 0) {
                lastError = result.response?.data?.awb_assign_error || `${courier.courier_name} assign failed`
                continue
            }

            delivery.awbCode = result.response.data.awb_code
            delivery.courierName = result.response.data.courier_name
            delivery.courierCompanyId = result.response.data.courier_company_id
            delivery.status = "awb_assigned"
            delivery.statusHistory.push({
                status: "awb_assigned",
                note: `Courier: ${delivery.courierName} — ₹${courier.rate}, rating ${courier.rating}`,
            })
            delivery.syncError = null

            await delivery.save()
            return delivery
        } catch (error) {
            lastError = error.response?.data?.message || error.message
            continue
        }
    }

    delivery.status = "failed"
    delivery.syncError = lastError || "All courier attempts failed"
    await delivery.save()

    throw new Error(delivery.syncError)
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

const STATUS_MAP = {
    "Pickup Generated": "pickup_scheduled",
    "Picked Up": "picked_up",
    "In Transit": "in_transit",
    "Out For Delivery": "out_for_delivery",
    "Delivered": "delivered",
    "RTO Initiated": "rto",
    "Cancelled": "cancelled",
}

// ── Delivery status → Order status sync ────────────────────────────
// Delivery hi actual tracking source of truth hai — jab delivery ka status
// aage badhta hai (shipped/delivered/etc.), order.orderStatus ko bhi wahi
// reflect karna chahiye, taaki AllOrders.jsx ko frontend-side merge/map
// karne ki zaroorat na pade — order khud sahi status carry kare.
const DELIVERY_TO_ORDER_STATUS = {
    picked_up: "shipped",
    in_transit: "shipped",
    out_for_delivery: "shipped",
    delivered: "delivered",
    rto: "cancelled",
    cancelled: "cancelled",
    // pickup_scheduled / awb_assigned / order_created → order abhi "placed" hi rahega
}

const ORDER_STATUS_PRIORITY = {
    pending_payment: 0,
    failed: 0,
    cancelled: 0,
    placed: 1,
    confirmed: 1,
    packed: 1,
    partially_cancelled: 1,
    shipped: 2,
    delivered: 3,
}

const syncOrderStatusFromDelivery = async (delivery) => {
    const targetStatus = DELIVERY_TO_ORDER_STATUS[delivery.status]
    if (!targetStatus) return

    const order = await orderModel.findById(delivery.order)
    if (!order) return

    const currentPriority = ORDER_STATUS_PRIORITY[order.orderStatus] ?? 0
    const targetPriority = ORDER_STATUS_PRIORITY[targetStatus]

    // forward-only guard — late/out-of-order tracking event se order kabhi peeche na jaaye
    if (targetPriority <= currentPriority) return

    order.orderStatus = targetStatus
    await order.save()
}

export const trackDelivery = async (deliveryId) => {
    const delivery = await deliveryModel.findById(deliveryId)

    if (!delivery || !delivery.awbCode) {
        throw new Error("AWB not assigned yet — cannot track")
    }

    const trackingData = await trackShipmentByAWB(delivery.awbCode)
    console.log(trackingData)

    const activities = trackingData?.tracking_data?.shipment_track_activities || []
    const chronological = [...activities].reverse()

    let historyChanged = false

    for (const activity of chronological) {
        const alreadyExists = delivery.statusHistory.some(
            (h) => h.note === activity.activity && h.timestamp?.toISOString() === new Date(activity.date).toISOString()
        )
        if (alreadyExists) continue

        delivery.statusHistory.push({
            status: STATUS_MAP[activity.status] || delivery.status, // internal enum
            note: activity.activity,        // real Shiprocket text — "Shipment In Transit"
            location: activity.location,    // real location
            timestamp: new Date(activity.date),
        })
        historyChanged = true
    }

    // delivery.status ko sirf latest/current status pe update karo
    const latestStatus = trackingData?.tracking_data?.shipment_track?.[0]?.current_status
    const mappedCurrent = latestStatus && STATUS_MAP[latestStatus]
    if (mappedCurrent && delivery.status !== mappedCurrent) {
        delivery.status = mappedCurrent
        historyChanged = true
    }

    const rawEdd = trackingData?.tracking_data?.etd
    if (rawEdd) {
        const eddDate = new Date(rawEdd.replace(" ", "T"))
        if (!isNaN(eddDate.getTime()) && (!delivery.edd || delivery.edd.getTime() !== eddDate.getTime())) {
            delivery.edd = eddDate
            historyChanged = true
        }
    }

    if (historyChanged) {
        await delivery.save()
    }

    // order ko bhi sync karo — is call ke baad order.orderStatus khud sahi ho jayega,
    // frontend ko koi alag mapping/merge logic maintain nahi karni padegi
    await syncOrderStatusFromDelivery(delivery)

    return delivery
}

const NON_CANCELLABLE_STATUSES = ["picked_up", "in_transit", "delivered", "cancelled"]

export const cancelDeliveryForDelivery = async (deliveryId) => {
    const delivery = await deliveryModel.findById(deliveryId)
    if (!delivery) throw new Error("Delivery not found")

    if (NON_CANCELLABLE_STATUSES.includes(delivery.status)) {
        throw new Error(`Cannot cancel — shipment is already '${delivery.status.replace(/_/g, " ")}'`)
    }
    if (!delivery.shiprocketOrderId) {
        throw new Error("No Shiprocket order to cancel")
    }

    await cancelShiprocketOrder(delivery.shiprocketOrderId)

    delivery.status = "cancelled"
    delivery.statusHistory.push({ status: "cancelled", note: "Cancelled by seller before pickup" })
    await delivery.save()

    return delivery
}