import Joi from 'joi';

// Dates are validated as zero-padded YYYY-MM-DD strings, so lexicographic
// comparison matches chronological order.
const dateStr = (label: string) =>
    Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).messages({
        'string.base': `${label} must be a string`,
        'string.empty': `${label} is required`,
        'string.pattern.base': `${label} must be in YYYY-MM-DD format`,
        'any.required': `${label} is required`,
    });

const status = Joi.string().valid('booked', 'ongoing', 'completed', 'cancelled').messages({
    'any.only': 'Status must be one of booked, ongoing, completed, cancelled',
    'string.base': 'Status must be one of booked, ongoing, completed, cancelled',
});

// Enforces end_date >= start_date when both are present.
const endAfterStart = (value: any, helpers: Joi.CustomHelpers) => {
    const { start_date } = helpers.state.ancestors[0] as { start_date?: string };
    if (start_date && value < start_date) return helpers.error('date.order');
    return value;
};

const orderMessage = { 'date.order': 'End date must be on or after start date' };

export const create = Joi.object({
    vehicle_id: Joi.number().integer().positive().required().messages({
        'number.base': 'Vehicle id must be a number',
        'any.required': 'Vehicle id is required',
    }),
    customer_name: Joi.string().trim().min(1).required().messages({
        'string.empty': 'Customer name is required',
        'any.required': 'Customer name is required',
    }),
    customer_phone: Joi.string().trim().min(1).required().messages({
        'string.empty': 'Customer phone is required',
        'any.required': 'Customer phone is required',
    }),
    start_date: dateStr('Start date').required(),
    end_date: dateStr('End date').required().custom(endAfterStart).messages(orderMessage),
    status: status.optional(),
});

export const update = Joi.object({
    vehicle_id: Joi.number().integer().positive().messages({
        'number.base': 'Vehicle id must be a number',
    }),
    customer_name: Joi.string().trim().min(1),
    customer_phone: Joi.string().trim().min(1),
    start_date: dateStr('Start date'),
    end_date: dateStr('End date').custom(endAfterStart).messages(orderMessage),
    status: status.optional(),
});

export const list = Joi.object({
    page: Joi.number().integer().positive(),
    limit: Joi.number().integer().positive().max(100),
    vehicle_id: Joi.number().integer().positive(),
    status: status.optional(),
    date_from: dateStr('Date from'),
    date_to: dateStr('Date to'),
    search: Joi.string(),
});
