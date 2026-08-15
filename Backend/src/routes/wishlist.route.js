import express from "express";
import { addToWishlist, removeFromWishlist, getWishlist } from "../controllers/wishlist.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js"

const wishlistRouter = express.Router();


wishlistRouter.post("/",authenticateUser,  addToWishlist);
wishlistRouter.delete("/:variantSku",authenticateUser, removeFromWishlist);
wishlistRouter.get("/",authenticateUser, getWishlist);

export default wishlistRouter;