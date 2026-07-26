import { Router } from "express";
import { assignGuestId, authenticateOptionalUser, authenticateUser } from "../middlewares/auth.middleware.js";
import { validateAddToCart } from "../validators/cart.validator.js";
import { addToCart, getCart } from "../controllers/cart.controller.js";

const cartRouter = Router()

cartRouter.use(authenticateOptionalUser, assignGuestId)

cartRouter.post("/add/:productId/:variantId", validateAddToCart, addToCart)

cartRouter.get("/getCart", getCart)



export default cartRouter