import { body, validationResult } from 'express-validator'

const validateRequest = (req, res, next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({
            Errors: errors.array()
        })
    }

    next()
}

export const validateBasicSellerApplication = [
    body("brandName").trim().notEmpty().withMessage("Brand name is required"),
    body("businessEmail").trim().isEmail().withMessage("Valid business email is required"),
    body("businessPhone").trim().notEmpty().withMessage("Business phone is required"),
    validateRequest
]

export const validateSellerVerificationDetails = [
    body("pickupAddress")
        .notEmpty().withMessage("Pickup address is required")
        .custom((value, { req }) => {
            let parsed
            try {
                parsed = JSON.parse(value)
            } catch {
                throw new Error("Pickup address must be valid JSON")
            }

            const requiredFields = ["addressLine1", "city", "state", "pincode"]
            const missingField = requiredFields.find((field) => !parsed?.[field])
            if (missingField) {
                throw new Error(`Pickup address: ${missingField} is required`)
            }

            const pincodeRegex = /^[1-9][0-9]{5}$/
            if (!pincodeRegex.test(parsed.pincode)) {
                throw new Error("Not a valid Indian pincode")
            }

            req.parsedPickupAddress = parsed // Cache parsed object for controller
            return true
        }),

    body("kyc")
        .notEmpty().withMessage("KYC details are required")
        .custom((value, { req }) => {
            let parsed
            try {
                parsed = JSON.parse(value)
            } catch {
                throw new Error("KYC details must be valid JSON")
            }

            if (!parsed?.panNumber) {
                throw new Error("PAN number is required")
            }

            const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
            if (!panRegex.test(parsed.panNumber)) {
                throw new Error("Not a valid PAN number")
            }

            req.parsedKyc = parsed
            return true
        }),

    body("payout")
        .notEmpty().withMessage("Payout details are required")
        .custom((value, { req }) => {
            let parsed
            try {
                parsed = JSON.parse(value)
            } catch {
                throw new Error("Payout details must be valid JSON")
            }

            if (!parsed?.upiId && !parsed?.upiMobile) {
                throw new Error("UPI ID or UPI mobile number is required")
            }

            if (parsed.upiMobile) {
                const mobileRegex = /^[6-9]\d{9}$/
                if (!mobileRegex.test(parsed.upiMobile)) {
                    throw new Error("Not a valid Indian mobile number")
                }
            }

            req.parsedPayout = parsed
            return true
        }),

    validateRequest
]