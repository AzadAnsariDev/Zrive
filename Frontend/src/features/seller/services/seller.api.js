import axios from 'axios'

const sellerApiInstance = axios.create({
    baseURL: "/api",
    withCredentials: true
})

export const acceptOrder = async (orderId)=>{
    const response = await sellerApiInstance.post(`/order/${orderId}/accept`)
    return response.data
}

export const rejectOrder = async (orderId, reason, note)=>{
    const response = await sellerApiInstance.post(`/order/${orderId}/reject`, {
        reason, note
    })
    return response.data
}

export const getSellerOrders = async ()=>{
    const response = await sellerApiInstance.get(`/order/getSellerOrders`)
    return response.data
}

export const createBasicSellerApplication = async ({ brandName, businessEmail, businessPhone })=>{
    const response = await sellerApiInstance.post(`/seller/onboard`, {
        brandName, businessEmail, businessPhone
    })
    return response.data
}

export const submitVerificationDetails = async ({ panNumber, panPhoto, pickupAddress, payout })=>{
    const formData = new FormData()

    formData.append("kyc", JSON.stringify({ panNumber }))
    formData.append("pickupAddress", JSON.stringify(pickupAddress))
    formData.append("payout", JSON.stringify(payout))
    formData.append("panPhoto", panPhoto) 

    const response = await sellerApiInstance.post(`/seller/verify`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
    })
    return response.data
}

export const getMySellerApplication = async ()=>{
    const response = await sellerApiInstance.get(`/seller/sellerApplication`)
    return response.data
}