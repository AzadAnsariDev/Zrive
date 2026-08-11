import {
    retryDeliverySync,
    assignAWBController,
    schedulePickupController,
    generateLabelController,
    trackDeliveryController,
    getDeliveryByOrderController,
    getAllDeliveries,
    cancelDeliveryController,
    getDeliveryByOrderForBuyerController,   // 👈 naya
    trackDeliveryForBuyerController,        // 👈 naya
} from "../controllers/delivery.controller.js"
import { authenticateSeller, authenticateUser } from "../middlewares/auth.middleware.js"   // 👈 authenticateUser add
import { authenticateAdmin } from "../middlewares/admin.middleware.js"
import { Router } from 'express'

const deliveryRouter = Router()

//Admin-Only
deliveryRouter.get("/all", authenticateAdmin, getAllDeliveries)
deliveryRouter.post("/:deliveryId/retry", authenticateAdmin, retryDeliverySync)

//Seller-Access
deliveryRouter.post("/:deliveryId/assign-awb", authenticateSeller, assignAWBController)
deliveryRouter.post("/:deliveryId/schedule-pickup", authenticateSeller, schedulePickupController)
deliveryRouter.post("/:deliveryId/generate-label", authenticateSeller, generateLabelController)
deliveryRouter.get("/:deliveryId/track", authenticateSeller, trackDeliveryController)
deliveryRouter.get("/by-order/:orderId", authenticateSeller, getDeliveryByOrderController)
deliveryRouter.post("/:deliveryId/cancel", authenticateSeller, cancelDeliveryController)

//Buyer-Access
deliveryRouter.get("/buyer/by-order/:orderId", authenticateUser, getDeliveryByOrderForBuyerController)
deliveryRouter.get("/buyer/:deliveryId/track", authenticateUser, trackDeliveryForBuyerController)

export default deliveryRouter