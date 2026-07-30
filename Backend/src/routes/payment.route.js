import { Router } from "express";
import { createOrderController, verifyOrder } from "../controllers/payment.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";

const paymentRouter = Router()

paymentRouter.post("/create/order", authenticateUser, createOrderController)

paymentRouter.post("/verify/order", authenticateUser, verifyOrder)

export default paymentRouter