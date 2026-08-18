import { Router } from "express";
import { acceptOrder, cancelOrder, createOrder, getOrderById, getOrders, getSellerOrders, getSellerOrderById, rejectOrder, verifyOrder, webhook } from "../controllers/order.controller.js";
import { authenticateSeller, authenticateUser } from "../middlewares/auth.middleware.js";

const orderRouter = Router()

orderRouter.post("/create/order", authenticateUser, createOrder)

orderRouter.post("/verify/order", authenticateUser, verifyOrder)

orderRouter.post("/webhook", webhook);

orderRouter.get("/getOrders", authenticateUser, getOrders)

orderRouter.get("/getSellerOrders", authenticateSeller, getSellerOrders)

orderRouter.get("/seller/:orderId", authenticateSeller, getSellerOrderById)

orderRouter.get("/:orderId", authenticateUser, getOrderById)

orderRouter.patch("/:orderId/cancel", authenticateUser, cancelOrder)

orderRouter.post("/:orderId/accept", authenticateSeller, acceptOrder)

orderRouter.post("/:orderId/reject", authenticateSeller, rejectOrder)


export default orderRouter