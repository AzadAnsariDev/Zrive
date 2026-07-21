import {Router} from 'express'
import { getMe, googleCallback, login, register } from '../controllers/auth.controller.js'
import { validateLogin, validateRegister, } from '../validators/auth.validator.js'
import passport from 'passport'
import { authenticateUser } from '../middlewares/auth.middleware.js'

const authRouter = Router()




authRouter.post("/register",validateRegister ,register)

authRouter.post("/login",validateLogin , login)

authRouter.get("/google", 
    passport.authenticate('google', {scope : ['profile', 'email']})
)

authRouter.get("/google/callback", 
    passport.authenticate('google', {session : false, failureRedirect: "http://localhost:5173/login"}),
    googleCallback
)

authRouter.get("/get-me", authenticateUser, getMe)
export default authRouter