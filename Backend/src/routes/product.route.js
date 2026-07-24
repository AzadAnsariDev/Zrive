import { Router } from 'express'
import { authenticateSeller, authenticateUser } from '../middlewares/auth.middleware.js'
import { addNewVariant, createProduct, getProductDetail, getProducts, getSellerProduct } from '../controllers/product.controller.js'
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

productRouter.get("/getProducts", getProducts)

productRouter.get("/getProductDetail/:productId", getProductDetail)

productRouter.post("/:productId/addNewVariant", authenticateSeller,upload.array("images", 7), addNewVariant)

export default productRouter