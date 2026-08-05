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

