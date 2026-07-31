import axios from 'axios'

const paymentAPiInstance = axios.create({
    baseURL : "/api/payment",
    withCredentials: true
})

export const createOrder = async (addressId)=>{
    const response = await paymentAPiInstance.post("/create/order", {addressId})
    return response.data
}

export const verifyOrder = async ({razorpay_order_id, razorpay_payment_id, razorpay_signature})=>{
    const response = await paymentAPiInstance.post("/verify/order",
        {razorpay_order_id, razorpay_payment_id, razorpay_signature}
    )
    return response.data
}