import { param, body, validationResult } from 'express-validator'

const validateRequest = (req, res, next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({
            Errors: errors.array()
        })
    }

    next()
}

export const validateCreateAddress = [
    body("fullName").trim().notEmpty().withMessage("Full name is required"),
    body("phone").trim().matches(/^[6-9]\d{9}$/).withMessage("Enter a valid 10-digit phone number"),
    body("addressLine1").trim().notEmpty().withMessage("Address line 1 is required"),
    body("addressLine2").optional().trim(),
    body("city").trim().notEmpty().withMessage("City is required"),
    body("state").trim().notEmpty().withMessage("State is required"),
    body("pincode").trim().matches(/^[1-9][0-9]{5}$/).withMessage("Enter a valid 6-digit pincode"),
    body("addressType").optional().isIn(["Home", "Work", "Other"]).withMessage("Address type must be Home, Work or Other"),
    body("isDefault").optional().isBoolean().withMessage("isDefault must be true or false"),
    validateRequest
]

export const validateUpdateAddress = [
    param("addressId").isMongoId().withMessage("Not a valid Mongo ID"),
    body("fullName").optional().trim().notEmpty().withMessage("Full name cannot be empty"),
    body("phone").optional().trim().matches(/^[6-9]\d{9}$/).withMessage("Enter a valid 10-digit phone number"),
    body("addressLine1").optional().trim().notEmpty().withMessage("Address line 1 cannot be empty"),
    body("addressLine2").optional().trim(),
    body("city").optional().trim().notEmpty().withMessage("City cannot be empty"),
    body("state").optional().trim().notEmpty().withMessage("State cannot be empty"),
    body("pincode").optional().trim().matches(/^[1-9][0-9]{5}$/).withMessage("Enter a valid 6-digit pincode"),
    body("addressType").optional().isIn(["Home", "Work", "Other"]).withMessage("Address type must be Home, Work or Other"),
    body("isDefault").optional().isBoolean().withMessage("isDefault must be true or false"),
    validateRequest
]

export const validateAddressId = [
    param("addressId").isMongoId().withMessage("Not a valid Mongo ID"),
    validateRequest
]