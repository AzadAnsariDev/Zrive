import express from 'express'
import authRouter from './routes/auth.route.js'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import passport from 'passport'
import config from '../src/config/config.js'
import {Strategy as GoogleStrategy} from 'passport-google-oauth20'
import productRouter from './routes/product.route.js'

const app = express()
app.use(express.json())
// app.use(cors({
//     origin : "http://localhost:5173",
//     credentials : true
// }))
app.use(cookieParser())

app.use(passport.initialize())
 
passport.use(new GoogleStrategy({
    clientID : config.GOOGLE_CLIENT_ID,
    clientSecret : config.GOOGLE_CLIENT_SECRET,
    callbackURL : "/api/auth/google/callback"
},(_, __, profile, done) =>{
    return done(null, profile)
}))


//Auth Router
app.use("/api/auth", authRouter)

//product Router
app.use("/api/product", productRouter)

export default app