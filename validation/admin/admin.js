import Joi from "joi"

export const loginValidate = Joi.object({
    email: Joi.string().email().required().messages({
        "string.empty": "Email is required",
        "string.email": "Please enter a valid email address",
    }),
    password: Joi.string().required().messages({
        "string.empty": "Password is required"
    })
})

export const registerValidate = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    confirm_password: Joi.string().valid(Joi.ref('password')).required().messages({
        "any.only": "Passwords must match"
    }),
    notes: Joi.string().allow("").optional()
})
