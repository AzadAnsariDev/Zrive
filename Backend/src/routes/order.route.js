import { Router } from "express";
import { cancelOrder, createOrder, getOrderById, getOrders, verifyOrder, webhook } from "../controllers/order.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";

const orderRouter = Router()

orderRouter.post("/create/order", authenticateUser, createOrder)

orderRouter.post("/verify/order", authenticateUser, verifyOrder)

orderRouter.post("/webhook", webhook);

orderRouter.get("/getOrders", authenticateUser, getOrders)

orderRouter.get("/:orderId", authenticateUser, getOrderById)

orderRouter.patch("/:orderId/cancel", authenticateUser, cancelOrder)

export default orderRouter