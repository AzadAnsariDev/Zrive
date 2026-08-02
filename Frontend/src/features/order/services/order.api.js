import axios from 'axios'

const orderApiInstance = axios.create({
    baseURL : "/api/order",
    withCredentials: true
})

export const createOrder = async (addressId)=>{
    const response = await orderApiInstance.post("/create/order", {addressId})
    return response.data
}

export const verifyOrder = async ({razorpay_order_id, razorpay_payment_id, razorpay_signature})=>{
    const response = await orderApiInstance.post("/verify/order",
        {razorpay_order_id, razorpay_payment_id, razorpay_signature}
    )
    return response.data
}

export const getOrders = async()=>{
    const response = await orderApiInstance.get("/getOrders")
    return response.data
}
export const getOrderById = async(orderId)=>{
    const response = await orderApiInstance.get(`/${orderId}`)
    return response.data
}