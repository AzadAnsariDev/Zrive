import { Router }  from 'express'
import { authenticateUser } from '../middlewares/auth.middleware.js'
import {
    createBasicSellerApplication,
    getMySellerApplication,
    submitVerificationDetails,
    updateSellerProfile,
    subscribeSellerPlan,
    getSellerPayouts
} from '../controllers/seller.controller.js'
import { validateBasicSellerApplication, validateSellerVerificationDetails } from '../validators/seller.validator.js'
import multer from "multer"

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }
})

const sellerRouter = Router()

sellerRouter.post("/onboard", authenticateUser, validateBasicSellerApplication, createBasicSellerApplication)

sellerRouter.post("/verify", authenticateUser, upload.single("panPhoto"), validateSellerVerificationDetails, submitVerificationDetails)

sellerRouter.get("/sellerApplication", authenticateUser, getMySellerApplication)

sellerRouter.put("/updateProfile", authenticateUser, updateSellerProfile)

sellerRouter.post("/subscribePlan", authenticateUser, subscribeSellerPlan)

sellerRouter.get("/payoutSummary", authenticateUser, getSellerPayouts)

export default sellerRouter