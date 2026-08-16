import { body, validationResult} from 'express-validator'

const validationRequest = (req, res, next)=>{

    const errors = validationResult(req)

    if(!errors.isEmpty()){
        return res.status(400).json({errors : errors.array()})
    }

    next()
}

export const validateRegister = [
    body("email")
        .isEmail().withMessage("Please provide a valid email addresss"),
    body("contact")
        .isMobilePhone().withMessage("Please provide a valid contact number")
        .isLength({min:10, max: 10}).withMessage("Please provide a valid contact number"),
    body("username")
        .notEmpty().withMessage("Please provide a valid username")
        .isLength({min : 3}).withMessage("Username must be atleast 3 character long"),
    body("password")
        .isLength({min : 6}).withMessage("Password must be atleast 6 character long"),

    validationRequest  
]

export const validateLogin = [
    body("identifier")
        .notEmpty()
        .withMessage("Email or Contact number is required"),

    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long"),

    validationRequest
];

export const validateUpdateProfile = [
    body("fullName")
        .optional()
        .notEmpty().withMessage("Full name cannot be empty")
        .isLength({ min: 3 }).withMessage("Full name must be atleast 3 character long"),

    body("phone")
        .optional({ checkFalsy: true })
        .isMobilePhone().withMessage("Please provide a valid contact number")
        .isLength({ min: 10, max: 10 }).withMessage("Please provide a valid contact number"),

    body("gender")
        .optional({ checkFalsy: true })
        .isIn(["Male", "Female", "Prefer not to say"]).withMessage("Please provide a valid gender"),

    body("dob")
        .optional({ checkFalsy: true })
        .isISO8601().withMessage("Please provide a valid date of birth")
        .toDate(),

    body("preferences")
        .optional()
        .isObject().withMessage("Preferences must be an object"),

    body("preferences.newsletter")
        .optional()
        .isBoolean().withMessage("Newsletter preference must be true or false"),

    body("preferences.orderUpdatesSms")
        .optional()
        .isBoolean().withMessage("Order updates SMS preference must be true or false"),

    body("preferences.size")
        .optional()
        .isIn(["XS", "S", "M", "L", "XL", "XXL"]).withMessage("Please provide a valid size"),

    validationRequest
]

export const validateChangePassword = [
    body("currentPassword")
        .notEmpty().withMessage("Current password is required"),

    body("newPassword")
        .notEmpty().withMessage("New password is required")
        .isLength({ min: 8 }).withMessage("New password must be atleast 8 character long")
        .custom((value, { req }) => value !== req.body.currentPassword)
        .withMessage("New password must be different from current password"),

    validationRequest
]