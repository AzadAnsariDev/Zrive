import jwt from 'jsonwebtoken'
import config from '../config/config.js'
import userModel from '../models/user.model.js'
import { json } from 'express'

export const authenticateUser = (req, res, next)=>{
    const token = req.cookies.token

    if(!token){
        return res.status(400).json({
            message : "Please Login or Register first"
        })
    }

    try{
        const decoded = jwt.verify(token,config.JWT_SECRET)
        req.user = decoded
        next()
    }catch(err){
        console.log(err)
        return res.status(401).json({
            message: "Unauthorized Access"
        })
    }
}

export const authenticateSeller = async (req, res ,next)=>{

    const token = req.cookies.token

    if(!token){
        return res.status(401).json({
            message: "Unauthorized Access",
            success: false
        })
    }

    try{
        const decoded = jwt.verify(token, config.JWT_SECRET)
        const user = await userModel.findById(decoded.id)

        if(!user){
            return res.status(401).json({
                message: "Unauthorized Access",
                success: false
            })
        }

        if(user.role !== "seller"){
            return res.status(403).json({
                message: "Forbidden Access",
                success: false
            })
        }

        req.user = user

        next()
    }catch(err){
        console.log(err)
        return res.status(401).json({
            message: "Unauthorized Access",
            success: false
        })
    }
}