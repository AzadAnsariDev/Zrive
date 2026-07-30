import mongoose from "mongoose";
import priceSchema from "./price.schema.js";

const paymentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref : "users",
        required: true
    },
    price: {
        type: priceSchema,
        required : true
    },
    status :{
        type: String,
        enum : ["pending" , "paid", "failed" ],
        default: "pending"
    },
    razorpay:{
        orderId : {type : String, required: true},
        payment_id: String,
        signature: String 
    }
})

const paymentModel = mongoose.model("payments", paymentSchema)

export default paymentModel