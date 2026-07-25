import { param, body, validationResult} from 'express-validator'

const  validateRequest = (req, res, next)=>{
    const errors = validationResult(req)

    if(!errors.isEmpty()){
        return res.status(400).json({
            Errors : errors.array()
        })
    }

    next()
}

export const validateAddToCart = [
    param("productId").isMongoId().withMessage("Not a valid Mongo ID"),
    param("variantId").isMongoId().withMessage("Not a valid Mongo ID"),
    body("quantity").optional().isInt({min: 1}).withMessage("Quantity must be atleast 1"),
    validateRequest
]