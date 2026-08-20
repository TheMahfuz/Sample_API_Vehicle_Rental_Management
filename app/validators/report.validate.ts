import Joi from 'joi';

export const rentals = Joi.object({
    month: Joi.string().pattern(/^\d{4}-(0[1-9]|1[0-2])$/).required().messages({
        'string.base': 'Month must be a string',
        'string.empty': 'Month is required',
        'string.pattern.base': 'Month must be in YYYY-MM format',
        'any.required': 'Month is required',
    }),
    vehicle_id: Joi.number().integer().positive().messages({
        'number.base': 'Vehicle id must be a number',
    }),
});
