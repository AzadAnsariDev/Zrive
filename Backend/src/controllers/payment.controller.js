import mongoose from "mongoose";
import { createOrder } from "../services/razorpay.service.js";
import { getCartDetails } from "./cart.controller.js";
import paymentModel from "../models/payment.model.js";
import { validatePaymentVerification }  from 'razorpay/dist/utils/razorpay-utils.js'
import config from "../config/config.js";

export const createOrderController = async (req, res) => {
  try {
    const filter = req.user
      ? { user: new mongoose.Types.ObjectId(req.user.id) }
      : { guestId: req.guestId };

    const cart = await getCartDetails(filter);
    if (!cart.items || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    
    const order = await createOrder({
        amount: cart.totalPrice,
        currency: cart.currency,
    });

    const payment = await paymentModel.create({
        user : req.user.id,
        price: {
            amount: cart.totalPrice,
            currency: cart.currency
        },
        razorpay :{
            orderId : order.id
        }
    })

    res.status(201).json({
      success: true,
      order,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
      error: err,
    });
  }
};

export const verifyOrder = async(req, res) =>{
    const {razorpay_order_id, razorpay_payment_id, razorpay_signature} = req.body

    const payment = await paymentModel.findOne({"razorpay.orderId" :razorpay_order_id, status: "pending"})

    if(!payment){
        return res.status(400).json({
            message : "Payment not found",
            success: false
        })
    }

    const isValid = validatePaymentVerification({
        order_id: razorpay_order_id,
        payment_id : razorpay_payment_id
    },
        razorpay_signature, 
        config.RAZORPAY_KEY_SECRET
    )

    if(!isValid){
        payment.status = "failed"

        await payment.save()

        return res.status(400).json({
            message: "Payment verification failed",
            success: false
        })
    }

    payment.status = "paid",
    payment.razorpay.payment_id = razorpay_payment_id,
    payment.razorpay.signature = razorpay_signature

    await payment.save()

    return res.status(201).json({
        message : "Payment verified successfully",
        success : true
    })
}