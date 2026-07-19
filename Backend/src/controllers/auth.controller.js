import config from "../config/config.js"
import userModel from "../models/user.model.js"
import jwt from 'jsonwebtoken'


const sendTokenResponse = (user, res, statusCode, message)=>{
    const token = jwt.sign({
        id : user._id
    }, config.JWT_SECRET,{
        expiresIn : "7d"
    })

    res.cookie("token", token)

    res.status(statusCode).json({
        message, 
        success : true,
        user: {
            email : user.email,
            contact : user.contact,
            username : user.username,
            role : user.role
        }
    })
}

export const register = async (req, res)=>{
    const {email, contact, username, password, isSeller } = req.body

    const existingUser = await userModel.findOne({
        $or :[
            {contact}, {email}, {username}
        ]
    })

    if(existingUser){
        return res.status(400).json({
            message : "Email already exists",
            success : false
        })
    }

    const user = await userModel.create({
        email,
        contact,
        username,
        password,
        isSeller
    })

    if(user.isSeller){
        user.role = "seller"
        await user.save()
    }

    await sendTokenResponse(user, res, 201, "User registered successfully")
} 

export const login = async (req, res)=>{

    const { identifier, password } = req.body

    const isEmail = identifier.includes("@")
    
    const user = await userModel.findOne(
        isEmail
        ?   {email : identifier}
        :   {contact : identifier},
    ).select("+password")

    if(!user){
        return res.status(400).json({
            message : "Invalid Credentials, Please try again",
            success : false
        })
    }

    const isMatch = await user.comparePassword(password)

    if(!isMatch){
        return res.status(401).json({
            message : "Invalid Credentials, Please try again",
            success : false
        })
    }

    await sendTokenResponse(user, res, 200, "User loggedIn successfully")

}

export const googleCallback = async (req, res)=>{
   
    const {id, displayName, emails, photos} = req.user
    const email = emails[0].value
    const photo = photos[0].value

    let user = await userModel.findOne({
        email
    })

    if(!user){
        user = await userModel.create({
            email,
            googleId: id,
            username : displayName
        })
    }

    const token = jwt.sign({
        id: user._id
    },config.JWT_SECRET)

    res.cookie("token", token)

    res.redirect("http://localhost:5173/")
}