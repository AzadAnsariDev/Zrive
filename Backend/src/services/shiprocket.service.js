import axios from "axios"
import config from "../config/config.js"

const SHIPROCKET_BASE_URL = "https://apiv2.shiprocket.in/v1/external"

let cachedToken = null
let tokenExpiryTime = null

const loginToShiprocket = async () => {
    const response = await axios.post(`${SHIPROCKET_BASE_URL}/auth/login`, {
        email: config.SHIPROCKET_EMAIL,
        password: config.SHIPROCKET_PASSWORD
    })

    const token = response.data.token
    console.log(token) 

    if (!token) {
        throw new Error("Shiprocket login failed: token not received")
    }

    cachedToken = token
    // Shiprocket token ~10 din valid hota hai, hum 9 din maan ke safe rakhte hain
    tokenExpiryTime = Date.now() + 9 * 24 * 60 * 60 * 1000

    return token
}

export const getShiprocketToken = async () => {
    const isTokenValid = cachedToken && tokenExpiryTime && Date.now() < tokenExpiryTime

    if (isTokenValid) {
        return cachedToken
    }

    return await loginToShiprocket()
}

export const addPickupLocation = async (seller) => {
    const token = await getShiprocketToken()

    // unique nickname — sellerId is used 
    const pickupNickname = `SR_${seller._id.toString()}`

    const payload = {
        pickup_location: pickupNickname,
        name: seller.brandName,
        email: seller.businessEmail,
        phone: seller.businessPhone,
        address: seller.pickupAddress.addressLine1,
        address_2: seller.pickupAddress.addressLine2 || "",
        city: seller.pickupAddress.city,
        state: seller.pickupAddress.state,
        country: seller.pickupAddress.country || "India",
        pin_code: seller.pickupAddress.pincode
    }

    const response = await axios.post(
        `${SHIPROCKET_BASE_URL}/settings/company/addpickup`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
    )

    return {
        pickupId: response.data.pickup_id,
        pickupNickname: response.data.address.pickup_code
    }
}

export const createShiprocketOrder = async (orderPayload) => {
    const token = await getShiprocketToken()

    const response = await axios.post(
        `${SHIPROCKET_BASE_URL}/orders/create/adhoc`,
        orderPayload,
        { headers: { Authorization: `Bearer ${token}` } }
    )

    return response.data
}

export const buildShiprocketOrderPayload = ({ order, seller, buyerEmail, items, weight, dimensions }) => {
    return {
        order_id: order._id.toString(),
        order_date: new Date().toISOString().slice(0, 16).replace("T", " "),
        pickup_location: seller.shiprocket.pickupNickname,

        billing_customer_name: order.shippingAddress.name,
        billing_last_name: "",
        billing_address: order.shippingAddress.line1,
        billing_address_2: order.shippingAddress.line2 || "",
        billing_city: order.shippingAddress.city,
        billing_pincode: order.shippingAddress.pincode,
        billing_state: order.shippingAddress.state,
        billing_country: "India",
        billing_email: buyerEmail,
        billing_phone: order.shippingAddress.phone,
        shipping_is_billing: true,

        order_items: items,

        payment_method: "Prepaid",   // abhi sirf Razorpay hai, COD future mein
        sub_total: order.sellerAmount.amount,

        length: dimensions.length,
        breadth: dimensions.width,
        height: dimensions.height,
        weight: weight,
    }
}

export const assignAWB = async (shipmentId) => {
    const token = await getShiprocketToken()

    const response = await axios.post(
        `${SHIPROCKET_BASE_URL}/courier/assign/awb`,
        { shipment_id: shipmentId },
        { headers: { Authorization: `Bearer ${token}` } }
    )

    return response.data
}

export const requestPickup = async (shipmentId) => {
    const token = await getShiprocketToken()

    const response = await axios.post(
        `${SHIPROCKET_BASE_URL}/courier/generate/pickup`,
        { shipment_id: [shipmentId] },   // multiple shipment can be given
        { headers: { Authorization: `Bearer ${token}` } }
    )

    return response.data
}

export const generateLabel = async (shipmentId) => {
    const token = await getShiprocketToken()

    const response = await axios.post(
        `${SHIPROCKET_BASE_URL}/courier/generate/label`,
        { shipment_id: [shipmentId] },
        { headers: { Authorization: `Bearer ${token}` } }
    )

    return response.data   // { label_created, label_url, ... }
}


export const generateInvoice = async (shiprocketOrderId) => {
    const token = await getShiprocketToken()

    const response = await axios.post(
        `${SHIPROCKET_BASE_URL}/orders/print/invoice`,
        { ids: [shiprocketOrderId] },
        { headers: { Authorization: `Bearer ${token}` } }
    )

    return response.data   // { is_invoice_created, invoice_url }
}

export const trackShipmentByAWB = async (awbCode) => {
    const token = await getShiprocketToken()

    const response = await axios.get(
        `${SHIPROCKET_BASE_URL}/courier/track/awb/${awbCode}`,
        { headers: { Authorization: `Bearer ${token}` } }
    )

    return response.data
}