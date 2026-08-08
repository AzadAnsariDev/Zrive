import {
    getFailedDeliveries,
    retryDeliverySync,
    assignAWBController,
    schedulePickupController,
    generateLabelController,
    trackDeliveryController,
} from "../controllers/delivery.controller.js"
import { authenticateSeller } from "../middlewares/auth.middleware.js"   
import { authenticateAdmin } from "../middlewares/admin.middleware.js"
import { Router } from 'express'

const deliveryRouter = Router()

//Admin-Only
deliveryRouter.get("/failed", authenticateAdmin, getFailedDeliveries)
deliveryRouter.post("/:deliveryId/retry", authenticateAdmin, retryDeliverySync)

//Seller-Access
deliveryRouter.post("/:deliveryId/assign-awb", authenticateSeller, assignAWBController)
deliveryRouter.post("/:deliveryId/schedule-pickup", authenticateSeller, schedulePickupController)
deliveryRouter.post("/:deliveryId/generate-label", authenticateSeller, generateLabelController)
deliveryRouter.get("/:deliveryId/track", authenticateSeller, trackDeliveryController)

export default deliveryRouter