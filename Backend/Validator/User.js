import { body, validationResult, check } from "express-validator";

export const registerValidator = [
    body("name")
        .notEmpty()
        .withMessage("Name is required"),

    body("userName")
        .notEmpty()
        .withMessage("Username is required"),

    body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters"),

];


export const validate = (req, res, next) => {
    const errors = validationResult(req);
    const errorMessages = errors.array().map((error) => error.msg);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errorMessages,
        });
    }

    next();
};

export const validateAvatar = (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "Avatar is required",
        });
    }

    next();
};

export const loginValidator = [
    body("userName")
        .notEmpty()
        .withMessage("Username is required"),
    body("password")
        .notEmpty()
        .withMessage("Password is required"),
];