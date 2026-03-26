import Joi from "joi"

// Base patterns
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,30}$/;

export const registerValidate = Joi.object({
    name: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
            'string.empty': 'Please enter your full name.',
            'any.required': 'Name is a required field.',
            'string.min': 'Name must be at least 2 characters long.',
            'string.max': 'Name cannot exceed 50 characters.'
        }),

    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: false } })
        .required()
        .messages({
            'string.empty': 'Please enter your email address.',
            'any.required': 'Email is a required field.',
            'string.email': 'Please enter a valid email address.'
        }),

    phone: Joi.string()
        .pattern(/^[0-9]{10}$/)
        .required()
        .messages({
            'string.empty': 'Please enter your phone number.',
            'any.required': 'Phone number is a required field.',
            'string.pattern.base': 'Please enter a valid 10-digit phone number.'
        }),

    password: Joi.string()
        .pattern(passwordPattern)
        .required()
        .messages({
            'string.empty': 'Please enter a password.',
            'any.required': 'Password is a required field.',
            'string.pattern.base': 'Password must contain uppercase, lowercase, number and special character.'
        }),
});

export const loginValidate = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.empty': 'Please enter your email address.',
            'any.required': 'Email is a required field.',
            'string.email': 'Please enter a valid email address.'
        }),
    password: Joi.string()
        .required()
        .messages({
            'string.empty': 'Please enter your password.',
            'any.required': 'Password is a required field.'
        })
});

export const forgotePasswordValidate = Joi.object({
    email: Joi.string()
    .email()
    .required()
    .messages({
        'string.empty': 'Please enter your email address.',
        'any.required': 'Email is a required field.',
        'string.email': 'Please enter a valid email address.'
    })
})

export const profileUpdateValidate = Joi.object({
    id: Joi.string()
        .hex()
        .length(24)
        .required()
        .messages({
            'string.empty': 'User ID is missing.',
            'any.required': 'User ID is a required field.',
            'string.hex': 'Invalid User ID format.',
            'string.length': 'Invalid User ID length.'
        }),
    name: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
            'string.empty': 'Please enter your full name.',
            'any.required': 'Name is a required field.',
            'string.min': 'Name must be at least 2 characters long.',
            'string.max': 'Name cannot exceed 50 characters.'
        }),
    phone: Joi.string()
        .pattern(/^[0-9]{10}$/)
        .required()
        .messages({
            'string.empty': 'Please enter your phone number.',
            'any.required': 'Phone number is a required field.',
            'string.pattern.base': 'Please enter a valid 10-digit phone number.'
        }),
    city: Joi.string()
        .required()
        .messages({
            'string.empty': 'Please select a city from the dropdown.',
            'any.required': 'City is a required field.'
        }),
    bio: Joi.string()
        .allow('', null)
        .optional()
        .messages({
            'string.base': 'Bio must be a string.'
        }),
    gender: Joi.string()
        .valid('Male', 'Female', 'Other', 'Prefer not to say')
        .required()
        .messages({
            'string.empty': 'Please select your gender.',
            'any.required': 'Gender is a required field.',
            'any.only': 'Please select a valid gender option.'
        }),
    dob: Joi.date()
        .max(new Date(new Date().setFullYear(new Date().getFullYear() - 18)))
        .messages({
            'date.base': 'Please enter a valid date of birth.',
            'date.max': 'You must be at least 18 years old.'
        })
        .allow('', null)
        .optional(),
    occupation: Joi.string()
        .allow('', null)
        .optional()
        .messages({
            'string.base': 'Occupation must be a string.'
        })
})

export const editEmailValidate = Joi.object({
    id: Joi.string()
        .hex()
        .length(24)
        .required()
        .messages({
            'string.empty': 'User ID is missing.',
            'any.required': 'User ID is a required field.',
            'string.hex': 'Invalid User ID format.',
            'string.length': 'Invalid User ID length.'
        }),
    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: false } })
        .required()
        .messages({
            'string.empty': 'Please enter your new email address.',
            'any.required': 'Email is a required field.',
            'string.email': 'Please enter a valid email address.'
        })
})

export const passwordUpdateValidate = Joi.object({
    id: Joi.string()
        .hex()
        .length(24)
        .required(),
    currentPassword: Joi.string()
        .allow('', null)
        .optional()
        .messages({
            'string.empty': 'Please enter your current password.',
        }),
    newPassword: Joi.string()
        .pattern(passwordPattern)
        .required()
        .messages({
            'string.empty': 'Please enter a new password.',
            'any.required': 'New password is a required field.',
            'string.pattern.base': 'Password must contain uppercase, lowercase, number and special character and be at least 8 characters long.'
        }),
    confirmPassword: Joi.any()
        .valid(Joi.ref('newPassword'))
        .required()
        .messages({
            'any.only': 'Confirm password does not match the new password.',
            'any.required': 'Please confirm your new password.'
        })
})
