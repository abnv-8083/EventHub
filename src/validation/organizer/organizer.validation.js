import Joi from 'joi'

export const createEventSchema = Joi.object({
    // Basic Information
    title: Joi.string().trim().min(3).max(100).required().messages({
        'string.empty': 'Event title cannot be empty.',
        'string.min': 'Event title must be at least 3 characters long.',
        'string.max': 'Event title cannot exceed 100 characters.',
        'any.required': 'Event title is required.'
    }),

    description: Joi.string().trim().min(20).max(2000).required().messages({
        'string.empty': 'Event description cannot be empty.',
        'string.min': 'Event description must be at least 20 characters to provide enough detail.',
        'string.max': 'Event description cannot exceed 2000 characters.',
        'any.required': 'Event description is required.'
    }),

    category: Joi.string().required().invalid('----Select Categories----', 'No Category Found').messages({
        'any.invalid': 'Please select a valid category.',
        'string.empty': 'Category selection is required.',
        'any.required': 'Category is required.'
    }),

    // Location (Hidden fields populated by Leaflet)
    latitude: Joi.number().min(-90).max(90).required().messages({
        'number.base': 'Latitude must be a valid number.',
        'any.required': 'Please select a venue location on the map.'
    }),

    longitude: Joi.number().min(-180).max(180).required().messages({
        'number.base': 'Longitude must be a valid number.',
        'any.required': 'Please select a venue location on the map.'
    }),

    address: Joi.string().required().messages({
        'string.empty': 'Venue address is required.',
        'any.required': 'Please select a venue location on the map.'
    }),

    // Date & Time
    startDate: Joi.date().min('now').required().messages({
        'date.base': 'Start date must be a valid date.',
        'date.format': 'Start date must be in YYYY-MM-DD format.',
        'date.min': 'Start date cannot be in the past.',
        'any.required': 'Start date is required.'
    }),

    startTime: Joi.string().pattern(/^([01]\d|2[0-3]):?([0-5]\d)$/).required().messages({
        'string.empty': 'Start time is required.',
        'string.pattern.base': 'Start time must be in a valid 24-hour HH:MM format.',
        'any.required': 'Start time is required.'
    }),

    endDate: Joi.date().min(Joi.ref('startDate')).required().messages({
        'date.base': 'End date must be a valid date.',
        'date.min': 'End date must be the same as or after the start date.',
        'any.required': 'End date is required.'
    }),

    endTime: Joi.string().pattern(/^([01]\d|2[0-3]):?([0-5]\d)$/).required().messages({
        'string.empty': 'End time is required.',
        'string.pattern.base': 'End time must be in a valid 24-hour HH:MM format.',
        'any.required': 'End time is required.'
    }),

    // Ticketing

    tickets: Joi.array().items(
        Joi.object({
            name: Joi.string().trim().min(2).max(50).required().messages({
                'string.empty': 'Ticket name is required.',
                'string.min': 'Ticket name must be at least 2 characters.',
                'any.required': 'Ticket name is required.'
            }),
            price: Joi.number().min(0).precision(2).required().messages({
                'number.base': 'Ticket price must be a valid number.',
                'number.min': 'Ticket price cannot be negative. Use 0 for free tickets.',
                'any.required': 'Ticket price is required.'
            }),
            availableSeats: Joi.number().integer().min(1).required().messages({
                'number.base': 'Available seats must be a number.',
                'number.min': 'There must be at least 1 available seat per ticket type.',
                'any.required': 'Available seats limit is required.'
            }),
            maxPerUser: Joi.number().integer().min(1).required().when('availableSeats', {
                is: Joi.number().required(),
                then: Joi.number().max(Joi.ref('availableSeats')),
                otherwise: Joi.number() // Just validate as number if dependency fails
            }).messages({
                'number.base': 'Max tickets per user must be a number.',
                'number.max': 'Max per user cannot exceed the total available seats for this ticket.',
                'any.required': 'Max tickets per user is required.'
            })
        })
    ).min(1).required().messages({
        'array.min': 'You must add at least one ticket type.',
        'any.required': 'Ticketing information is required.'
    }),

    // Media & Settings
    tags: Joi.string().custom((value, helpers) => {
        try {
            if (!value) return [];
            const parsed = JSON.parse(value);
            if (!Array.isArray(parsed)) return [];
            if (parsed.length > 10) return helpers.message('You cannot add more than 10 tags.');
            return parsed;
        } catch (err) {
            return []; // Fail silently for tags in drafts or simply provide empty array
        }
    }).required().messages({
        'string.empty': 'Please add at least one tag.',
        'any.required': 'Tags are required.'
    }),

    visibility: Joi.string().valid('Public', 'Private').required().messages({
        'any.only': 'Visibility must be either Public or Private.',
        'any.required': 'Event visibility setting is required.'
    }),
    
    bannerImage: Joi.string().optional().allow('', null),
    status: Joi.string().valid('Draft', 'Pending', 'Approved', 'Rejected', 'Published', 'Cancelled').optional(),
    isFeatured: Joi.boolean().default(false).optional()
});

/**
 * Lenient schema for Saving as Draft
 * Only title is required, others are optional and can be empty.
 */
export const draftEventSchema = createEventSchema.fork(
    ['description', 'category', 'latitude', 'longitude', 'address', 'startDate', 'startTime', 'endDate', 'endTime', 'tickets', 'tags', 'visibility'],
    (schema) => schema.optional().allow('', null)
).fork(
    ['title'],
    (schema) => schema.messages({
        'string.empty': 'A title is required to save this event as a draft.',
        'any.required': 'A title is required to save this event as a draft.'
    })
).fork(
    ['tickets'],
    (schema) => schema.items(
        Joi.object({
            name: Joi.string().allow('', null),
            price: Joi.number().allow('', null),
            availableSeats: Joi.number().allow('', null),
            maxPerUser: Joi.number().allow('', null)
        }).optional()
    )
).prefs({ convert: true, abortEarly: false, allowUnknown: true });