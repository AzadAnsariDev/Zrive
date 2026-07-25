import { Router } from "express";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import { validateAddToCart } from "../validators/cart.validator.js";
import { addToCart } from "../controllers/cart.controller.js";

const cartRouter = Router()

cartRouter.post("/add/:productId/:variantId", authenticateUser, validateAddToCart, addToCart)

export default cartRouter