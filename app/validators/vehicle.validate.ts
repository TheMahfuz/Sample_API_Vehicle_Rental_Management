import Joi from 'joi';

export const create = Joi.object({
    name: Joi.string().trim().min(1).required().messages({
        'string.base': 'Name must be a string',
        'string.empty': 'Name is required',
        'any.required': 'Name is required',
    }),
    plate_number: Joi.string().trim().min(1).required().messages({
        'string.base': 'Plate number must be a string',
        'string.empty': 'Plate number is required',
        'any.required': 'Plate number is required',
    }),
    category: Joi.string().trim().min(1).required().messages({
        'string.base': 'Category must be a string',
        'string.empty': 'Category is required',
        'any.required': 'Category is required',
    }),
    daily_rate: Joi.number().positive().required().messages({
        'number.base': 'Daily rate must be a number',
        'number.positive': 'Daily rate must be greater than 0',
        'any.required': 'Daily rate is required',
    }),
});

export const update = Joi.object({
    name: Joi.string().trim().min(1).messages({
        'string.base': 'Name must be a string',
        'string.empty': 'Name must not be empty',
    }),
    plate_number: Joi.string().trim().min(1).messages({
        'string.base': 'Plate number must be a string',
        'string.empty': 'Plate number must not be empty',
    }),
    category: Joi.string().trim().min(1).messages({
        'string.base': 'Category must be a string',
        'string.empty': 'Category must not be empty',
    }),
    daily_rate: Joi.number().positive().messages({
        'number.base': 'Daily rate must be a number',
        'number.positive': 'Daily rate must be greater than 0',
    }),
});

export const list = Joi.object({
    page: Joi.number().integer().positive(),
    limit: Joi.number().integer().positive().max(100),
    category: Joi.string(),
    search: Joi.string(),
});
