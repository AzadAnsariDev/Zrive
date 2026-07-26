import { body, validationResult } from "express-validator";

const validationRequest = (req, res, next) => {

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
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

  body("variants")
    .notEmpty()
    .withMessage("Variants are required")
    .custom((value) => {
        let parsed
        try {
            parsed = JSON.parse(value)
        } catch {
            throw new Error("Variants must be valid JSON")
        }

        if (!Array.isArray(parsed) || parsed.length === 0) {
            throw new Error("At least one variant is required")
        }

        for (const v of parsed) {
            if (!v.size || !v.color || !v.sku || v.stock === undefined) {
                throw new Error("Each variant must have size, color, sku and stock")
            }
        }

        return true
    }),

    validationRequest
]