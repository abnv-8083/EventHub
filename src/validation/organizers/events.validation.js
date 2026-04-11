import Joi from "joi"

export const createEventValidate = Joi.object({
    title: Joi.string()
        .min(3)
        .max(100)
        .required()
        .messages({
            'string.empty': 'Please enter the event title.',
            'any.required': 'Event title is a required field.',
            'string.min': 'Event title must be at least 3 characters long.',
            'string.max': 'Event title cannot exceed 100 characters.'
        }),

    description: Joi.string()
        .min(10)
        .max(2000)
        .required()
        .messages({
            'string.empty': 'Please enter the event description.',
            'any.required': 'Event description is a required field.',
            'string.min': 'Event description must be at least 10 characters long.',
            'string.max': 'Event description cannot exceed 2000 characters.'
        }),

    category: Joi.string()
        .valid('Music', 'Technology', 'Art', 'Business', 'Sports', 'Social', 'Education', 'Other')
        .required()
        .messages({
            'string.empty': 'Please select a category.',
            'any.required': 'Category is a required field.',
            'any.only': 'Please select a valid category.'
        }),

    address: Joi.string()
        .min(5)
        .max(255)
        .required()
        .messages({
            'string.empty': 'Please select a venue location.',
            'any.required': 'Venue address is a required field.',
            'string.min': 'Address must be at least 5 characters long.'
        }),

    latitude: Joi.number()
        .min(-90)
        .max(90)
        .required()
        .messages({
            'number.base': 'Invalid latitude value.',
            'any.required': 'Venue latitude is required.',
            'number.min': 'Latitude must be between -90 and 90.',
            'number.max': 'Latitude must be between -90 and 90.'
        }),

    longitude: Joi.number()
        .min(-180)
        .max(180)
        .required()
        .messages({
            'number.base': 'Invalid longitude value.',
            'any.required': 'Venue longitude is required.',
            'number.min': 'Longitude must be between -180 and 180.',
            'number.max': 'Longitude must be between -180 and 180.'
        }),

    startDate: Joi.date()
        .min('now')
        .required()
        .messages({
            'date.base': 'Start date must be a valid date.',
            'any.required': 'Start date is a required field.',
            'date.min': 'Start date cannot be in the past.'
        }),

    startTime: Joi.string()
        .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
        .required()
        .messages({
            'string.empty': 'Please enter the start time.',
            'any.required': 'Start time is a required field.',
            'string.pattern.base': 'Start time must be in HH:MM format.'
        }),

    endDate: Joi.date()
        .min(Joi.ref('startDate'))
        .required()
        .messages({
            'date.base': 'End date must be a valid date.',
            'any.required': 'End date is a required field.',
            'date.min': 'End date cannot be before start date.'
        }),

    endTime: Joi.string()
        .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
        .required()
        .messages({
            'string.empty': 'Please enter the end time.',
            'any.required': 'End time is a required field.',
            'string.pattern.base': 'End time must be in HH:MM format.'
        }),

    price: Joi.number()
        .min(0)
        .max(999999)
        .required()
        .messages({
            'number.base': 'Ticket price must be a number.',
            'any.required': 'Ticket price is a required field.',
            'number.min': 'Ticket price cannot be negative.',
            'number.max': 'Ticket price is too high.'
        }),

    availableSeats: Joi.number()
        .integer()
        .min(1)
        .max(999999)
        .required()
        .messages({
            'number.base': 'Available seats must be a number.',
            'any.required': 'Available seats is a required field.',
            'number.integer': 'Available seats must be a whole number.',
            'number.min': 'At least 1 seat must be available.',
            'number.max': 'Available seats limit exceeded.'
        }),

    maxPerUser: Joi.number()
        .integer()
        .min(1)
        .max(Joi.ref('availableSeats'))
        .required()
        .messages({
            'number.base': 'Max per user must be a number.',
            'any.required': 'Max per user is a required field.',
            'number.integer': 'Max per user must be a whole number.',
            'number.min': 'Max per user must be at least 1.',
            'number.max': 'Max per user cannot exceed available seats.'
        }),

    tags: Joi.string()
        .custom((value, helpers) => {
            try {
                const parsed = JSON.parse(value);
                if (!Array.isArray(parsed)) {
                    return helpers.error('array.base');
                }
                if (parsed.length > 10) {
                    return helpers.error('array.max');
                }
                parsed.forEach(tag => {
                    if (typeof tag !== 'string' || tag.length < 2 || tag.length > 30) {
                        return helpers.error('string.invalid');
                    }
                });
                return value;
            } catch (e) {
                return helpers.error('json.invalid');
            }
        })
        .allow('')
        .messages({
            'array.max': 'Maximum 10 tags allowed.',
            'string.invalid': 'Each tag must be between 2-30 characters.',
            'json.invalid': 'Tags format is invalid.'
        }),

    visibility: Joi.string()
        .valid('Public', 'Private')
        .required()
        .messages({
            'string.empty': 'Please select visibility.',
            'any.required': 'Visibility is a required field.',
            'any.only': 'Please select a valid visibility option.'
        }),

    banner: Joi.optional(),
});

export const updateEventValidate = Joi.object({
    eventId: Joi.string()
        .hex()
        .length(24)
        .required()
        .messages({
            'string.empty': 'Event ID is missing.',
            'any.required': 'Event ID is required.',
            'string.hex': 'Invalid event ID format.'
        }),

    title: Joi.string()
        .min(3)
        .max(100)
        .messages({
            'string.min': 'Event title must be at least 3 characters long.',
            'string.max': 'Event title cannot exceed 100 characters.'
        }),

    description: Joi.string()
        .min(10)
        .max(2000)
        .messages({
            'string.min': 'Event description must be at least 10 characters long.',
            'string.max': 'Event description cannot exceed 2000 characters.'
        }),

    category: Joi.string()
        .valid('Music', 'Technology', 'Art', 'Business', 'Sports', 'Social', 'Education', 'Other')
        .messages({
            'any.only': 'Please select a valid category.'
        }),

    visibility: Joi.string()
        .valid('Public', 'Private')
        .messages({
            'any.only': 'Please select a valid visibility option.'
        })
});