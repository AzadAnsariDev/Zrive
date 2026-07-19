import { body, validationResult } from "express-validator";

const validationRequest = (req, res, next)=>{

    const errors = validationResult(req)

    if(!errors.isEmpty()){
        return res.status(400).json({errors : errors.array()})
    }

    next()
}

export const validateProduct = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required"),

  body("priceAmount")
    .isFloat({ min: 100 })
    .withMessage("Price must be a positive number and above 100"),
    validationRequest
]

