import { Router } from "express";
import { createOrder, verifyOrder } from "../controllers/order.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";

const orderRouter = Router()

orderRouter.post("/create/order", authenticateUser, createOrder)

orderRouter.post("/verify/order", authenticateUser, verifyOrder)

export default orderRouter