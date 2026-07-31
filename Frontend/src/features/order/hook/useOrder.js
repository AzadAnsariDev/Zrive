import { createOrder, verifyOrder } from "../services/order.api"

const useOrder = ()=>{

    const handleCreateOrder = async (addressId)=>{
        const result = await createOrder(addressId)
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

export default useOrder