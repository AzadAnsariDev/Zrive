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