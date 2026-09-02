import config from "../config/config.js"
import { stockOfVariant } from "../dao/product.dao.js"
import cartModel from "../models/cart.model.js"
import userModel from "../models/user.model.js"
import jwt from 'jsonwebtoken'
import { sendEmail } from "../services/email.service.js"
import { welcomeEmailTemplate } from "../templates/email.templates.js"
import { savePushSubscription, removePushSubscription, sendPushNotificationToUser } from "../services/push-notification.service.js"


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

    // Fire welcome email in background — never blocks the response
    sendEmail({
        to: user.email,
        subject: 'Welcome to ZRIVE - Your Shopping Journey Begins!',
        html: welcomeEmailTemplate(user)
    }).catch(() => {}) // silently ignore

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

    res.redirect("https://zrive.onrender.com/")
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
    if (fullName) updates.username = fullName
    if (phone) updates.contact = phone
    if (gender) updates.gender = gender
    if (dob) updates.dob = dob
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

export const subscribePush = async (req, res) => {
    try {
        const { subscription } = req.body;
        if (!subscription || !subscription.endpoint) {
            return res.status(400).json({ success: false, message: "Subscription data is required" });
        }

        const userAgent = req.headers["user-agent"] || "";
        const saved = await savePushSubscription(req.user.id, subscription, userAgent);

        return res.status(200).json({
            success: true,
            message: "Push subscription registered successfully",
            data: saved,
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

export const unsubscribePush = async (req, res) => {
    try {
        const { endpoint } = req.body;
        if (endpoint) {
            await removePushSubscription(endpoint);
        }
        return res.status(200).json({ success: true, message: "Unsubscribed successfully" });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

export const testPushNotification = async (req, res) => {
    try {
        // The auth JWT contains only the user id, so resolve the current role
        // from the database instead of relying on req.user.role.
        const user = await userModel.findById(req.user.id).select("role");
        const isSeller = user?.role === "seller" || user?.role === "basic_seller";
        const testPayload = {
            title: isSeller ? "🚨 NEW ORDER RECEIVED! (TEST)" : "🎉 ZRIVE Order Update (TEST)",
            body: isSeller
                ? "Order #TEST-8832 · ₹1,999 · Tap to view details"
                : "Your order is confirmed and being prepared!",
            tag: isSeller ? "zrive-seller-alarm" : "zrive-buyer-notification",
            url: isSeller ? "/seller/orders" : "/orders",
            isAlarm: isSeller,
            data: {
                orderId: "test-order-123",
                url: isSeller ? "/seller/orders" : "/orders",
            },
        };

        const sent = await sendPushNotificationToUser(req.user.id, testPayload);

        return res.status(200).json({
            success: true,
            message: sent
                ? "Test push notification dispatched successfully!"
                : "No active push subscription found for this user. Please enable notifications in the browser first.",
            sent,
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
