import config from "../config/config.js"
import { stockOfVariant } from "../dao/product.dao.js"
import cartModel from "../models/cart.model.js"
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
    const {email, contact, username, password } = req.body

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
        password
        // role intentionally not accepted from client — always defaults to
        // "buyer" via the schema. Becoming a seller happens only through the
        // seller onboarding flow (createBasicSellerApplication), never at signup.
    })

    await mergeGuestCart(req, res, user._id)

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
    
    await mergeGuestCart(req, res, user._id)

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

    await mergeGuestCart(req, res, user._id)

    const token = jwt.sign({
        id: user._id
    },config.JWT_SECRET)

    res.cookie("token", token)

    res.redirect("http://localhost:5173/")
}

export const getMe = async (req, res)=>{
    const userId = req.user.id

    const user = await userModel.findById(userId)

    if(!user){
        return res.status(401).json({
            message : "Unauthorized Access"
        })
    }

    res.status(200).json({
        message : "User fetched successfully",
        success: true,
        user
    })
}

export const mergeGuestCart = async (req, res, userId)=>{
    const guestId = req.cookies.guestId
    if(!guestId) return

    const guestCart = await cartModel.findOne({guestId})

    if(!guestCart || guestCart.items.length === 0 ) return

    let userCart = await cartModel.findOne({user : userId})

    if(!userCart){
        guestCart.user = userId
        guestCart.guestId = undefined
        await guestCart.save()  
    }else{
        for(const guestItem of guestCart.items){
            let stock = await stockOfVariant(guestItem.product, guestItem.variant)
            const existing = userCart.items.find(i => i.product.equals(guestItem.product) && i.variant.equals(guestItem.variant))
            if(existing){
                existing.quantity = Math.min(
                    existing.quantity + guestItem.quantity,
                    stock
                )
            }else{
                userCart.items.push({
                    product: guestItem.product,
                    variant: guestItem.variant,
                    quantity : Math.min(guestItem.quantity, stock),
                    price: guestItem.price
                });
            }
        }
        await userCart.save()
        await guestCart.deleteOne()
    }
    res.clearCookie("guestId")
}

export const updateProfile = async (req, res) => {
    const userId = req.user.id
    const { fullName, phone, gender, dob, preferences } = req.body

    const updates = {}
    if (fullName !== undefined) updates.username = fullName
    if (phone !== undefined) updates.contact = phone
    if (gender !== undefined) updates.gender = gender
    if (dob !== undefined) updates.dob = dob
    if (preferences !== undefined) updates.preferences = preferences

    const user = await userModel.findByIdAndUpdate(
        userId,
        { $set: updates },
        { new: true, runValidators: true }
    )

    if (!user) {
        return res.status(404).json({
            message: "User not found",
            success: false
        })
    }

    res.status(200).json({
        message: "Profile updated successfully",
        success: true,
        user
    })
}

export const changePassword = async (req, res) => {
    const userId = req.user.id
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
        return res.status(400).json({
            message: "Current and new password are required",
            success: false
        })
    }

    if (newPassword.length < 8) {
        return res.status(400).json({
            message: "New password should be at least 8 characters",
            success: false
        })
    }

    const user = await userModel.findById(userId).select("+password")

    if (!user) {
        return res.status(404).json({
            message: "User not found",
            success: false
        })
    }

    const isMatch = await user.comparePassword(currentPassword)

    if (!isMatch) {
        return res.status(401).json({
            message: "Current password is incorrect",
            success: false
        })
    }

    user.password = newPassword
    await user.save()

    res.status(200).json({
        message: "Password updated successfully",
        success: true
    })
}

export const logout = async (req, res) => {
    res.clearCookie("token")

    res.status(200).json({
        message: "Logged out successfully",
        success: true
    })
}