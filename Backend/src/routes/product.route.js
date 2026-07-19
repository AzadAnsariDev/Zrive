import { Router } from 'express'
import { authenticateSeller } from '../middlewares/auth.middleware.js'
import { createProduct, getSellerProduct } from '../controllers/product.controller.js'
import multer from 'multer'
import { validateProduct } from '../validators/product.validator.js'

const upload = multer({
    storage: multer.memoryStorage(),
    limits : {
        fileSize: 5 * 1024 * 1024, // 5 MB
    }
})

const productRouter = Router()

productRouter.post("/createProduct", authenticateSeller, upload.array("images", 7), validateProduct, createProduct )

productRouter.get("/getSellerProducts", authenticateSeller, getSellerProduct)

export default productRouter