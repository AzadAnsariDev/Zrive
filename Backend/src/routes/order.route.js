import { Router } from "express";
import { createOrder, verifyOrder, webhook } from "../controllers/order.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";

const orderRouter = Router()

orderRouter.post("/create/order", authenticateUser, createOrder)

orderRouter.post("/verify/order", authenticateUser, verifyOrder)

orderRouter.post("/webhook", webhook);

export default orderRouter