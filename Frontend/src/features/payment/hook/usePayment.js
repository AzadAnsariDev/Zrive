import { createOrder, verifyOrder } from "../services/payment.api"

const usePayment = ()=>{

    const handleCreateOrder = async ()=>{
        const result = await createOrder()
        return result.order
    }
    const handleVerifyOrder = async ({razorpay_order_id, razorpay_payment_id, razorpay_signature})=>{
        const result = await verifyOrder({razorpay_order_id, razorpay_payment_id, razorpay_signature})
        return result.success
    }

    return{
        handleCreateOrder, 
        handleVerifyOrder
    }
}

export default usePayment