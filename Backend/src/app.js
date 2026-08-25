import express from 'express'
import authRouter from './routes/auth.route.js'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import passport from 'passport'
import config from '../src/config/config.js'
import {Strategy as GoogleStrategy} from 'passport-google-oauth20'
import productRouter from './routes/product.route.js'
import cartRouter from './routes/cart.route.js'
import addressRouter from './routes/address.route.js'
import orderRouter from './routes/order.route.js'
import sellerRouter from './routes/seller.route.js'
import adminRouter from './routes/admin.route.js'
import testRouter from './routes/test.route.js'
import deliveryRouter from './routes/delivery.route.js'
import wishlistRouter from './routes/wishlist.route.js'
import reviewRouter from './routes/review.route.js'
import notificationRouter from './routes/notification.route.js'

const app = express()

app.use(
  "/api/order/webhook",
  express.raw({ type: "application/json" })
);
app.use((req, res, next) => {
  if (req.originalUrl === "/api/order/webhook") {
    return next(); // Raw body is required for Razorpay webhook signature verification
  }
  express.json()(req, res, next);
});

app.use(cookieParser())

app.use(passport.initialize())
 
passport.use(new GoogleStrategy({
    clientID : config.GOOGLE_CLIENT_ID,
    clientSecret : config.GOOGLE_CLIENT_SECRET,
    callbackURL : "/api/auth/google/callback"
},(_, __, profile, done) =>{
    return done(null, profile)
}))

app.use("/api/test", testRouter)
app.use("/api/auth", authRouter)
app.use("/api/product", productRouter)
app.use("/api/cart", cartRouter)
app.use("/api/order", orderRouter)
app.use("/api/address", addressRouter)
app.use("/api/seller", sellerRouter)
app.use("/api/admin", adminRouter)
app.use("/api/delivery", deliveryRouter)
app.use("/api/wishlist", wishlistRouter)
app.use("/api/review", reviewRouter);
app.use("/api/notification", notificationRouter)


export default app