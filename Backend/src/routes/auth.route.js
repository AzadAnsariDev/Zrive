import {Router} from 'express'
import { changePassword, getMe, googleCallback, login, logout, register, updateProfile, subscribePush, unsubscribePush, testPushNotification } from '../controllers/auth.controller.js'
import { validateChangePassword, validateLogin, validateRegister, validateUpdateProfile, } from '../validators/auth.validator.js'
import passport from 'passport'
import { authenticateUser } from '../middlewares/auth.middleware.js'

const authRouter = Router()




authRouter.post("/register",validateRegister ,register)

authRouter.post("/login",validateLogin , login)

authRouter.get("/google", 
    passport.authenticate('google', {scope : ['profile', 'email']})
)
authRouter.put("/profile", authenticateUser, validateUpdateProfile, updateProfile)
authRouter.put("/password", authenticateUser, validateChangePassword, changePassword)
authRouter.post("/logout", authenticateUser, logout)

// Web Push subscription endpoints
authRouter.post("/push-subscription", authenticateUser, subscribePush)
authRouter.post("/push-subscription/unsubscribe", authenticateUser, unsubscribePush)
authRouter.post("/push-subscription/test", authenticateUser, testPushNotification)

authRouter.get("/google/callback", 
    passport.authenticate('google', {session : false, failureRedirect: "http://localhost:5173/login"}),
    googleCallback
)

authRouter.get("/get-me", authenticateUser, getMe)
export default authRouter