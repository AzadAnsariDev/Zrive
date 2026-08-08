import express from "express"
import { adminLogin, adminLogout, getPendingSellerApplications, getSellerApplicationDetail, approveSellerApplication, rejectSellerApplication } from "../controllers/admin.controller.js"
import { authenticateAdmin } from "../middlewares/admin.middleware.js"

const adminRouter = express.Router()

adminRouter.post("/login", adminLogin)
adminRouter.post("/logout", authenticateAdmin, adminLogout)

adminRouter.get("/sellers/pending", authenticateAdmin, getPendingSellerApplications)
adminRouter.get("/sellers/:sellerId", authenticateAdmin, getSellerApplicationDetail)
adminRouter.patch("/sellers/:sellerId/approve", authenticateAdmin, approveSellerApplication)
adminRouter.patch("/sellers/:sellerId/reject", authenticateAdmin, rejectSellerApplication)

export default adminRouter