import Razorpay from 'razorpay'
import config from '../config/config.js'

const razorpay = new Razorpay({
    key_id: config.RAZORPAY_KEY_ID,
    key_secret: config.RAZORPAY_KEY_SECRET
})

export const createRazorpayOrder = async ({amount, currency= "INR"})=>{
    const options = {
        amount : amount * 100,
        currency
    }
 
    const order = await razorpay.orders.create(options)

    return order

}

export const createRefund = async ({ paymentId, amount, notes = {} }) => {
  return await razorpay.payments.refund(paymentId, {
    amount,
    notes,
  });
};