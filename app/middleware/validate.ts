import { Request, Response, NextFunction } from 'express';
import Joi from "joi";
import path from "node:path";
import { ApiErrorResponse } from '../config/global';

/**
 * Middleware function to validate request data against a Joi schema.
 * 
 * This middleware dynamically imports a Joi schema from the specified file path 
 * within the validators subfolder. The schema file should be provided as a 
 * full path (excluding the .validate extension), and the schema name can be 
 * specified (default is 'schema'). If the schema is not found or is invalid, 
 * an error response will be sent to the client. If validation fails, detailed 
 * error messages will be returned in the response. If the validator file exports 
 * with a schema name, it can be used; otherwise, the default schema will be applied.
 * 
 * When validating query data, all values should be treated as strings. 
 * You may need to validate these using regular expressions or custom methods.
 * 
 * @param {string} schema_file - The full path to the schema file in the validators subfolder. 
 * @param {string} [schema_name='schema'] - The name of the schema to be used for validation, if available.
 * @returns {Function} - A middleware function that validates the request body or query data.
 * 
 * Example usage:
 * 
 * router.post('/save-categories', validate('sam/sample', 'schema2'), addCetegory);
 */

const validate = (schema_file: string, schema_name: string = 'schema', data: string = 'body') => async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Dynamically load the schema
        const schemaFilePath = path.resolve(__dirname, "../validators/", schema_file + '.validate');
        if (!schema_name) schema_name = "schema";
        if (data != "query") data = "body"
        // Use require (project is CommonJS) to avoid Node's ESM loader reparsing overhead/warnings
        const { [schema_name]: schema } = require(schemaFilePath);

        if (!schema || !Joi.isSchema(schema)) {
            return ApiErrorResponse({ res, error_code: "INVALID_SCHEMA" });
        }

        // Validate the request body/query. `convert` coerces string inputs
        // (query/multipart) for validation; the coerced value is intentionally
        // discarded so downstream handlers keep receiving the raw request data.
        const { error } = (schema as Joi.Schema).validate(req[data as keyof typeof req] ?? {}, {
            abortEarly: false,
            allowUnknown: true,
            convert: true,
            errors: { wrap: { label: false } },
        });

        if (error) {
            // Send validation errors to the client
            const data_errors: Record<string, string> = {};
            for (const detail of error.details) {
                data_errors[detail.path.join('.')] = detail.message;
            }

            let message: string = ""; // Initialize message to an empty string
            for (const k of Object.keys(data_errors)) { // Use Object.keys to iterate over the keys
                if (message !== "") message += ',';
                message += `${k}: ${data_errors[k]}`;
            }

            res.status(400).json({ // Change status to 400 for validation errors
                result_code: 1,
                request_id: req.request_id,
                time: new Date().valueOf(),
                error: {
                    title: "Invalid Request Data",
                    message: message, // Use the initialized message variable
                    details: data_errors
                }
            });
            return; // Ensure to return here
        }
        return next(); // Ensure to return next() here
    } catch (error) {
        // Handle other errors (e.g., file not found)
        return ApiErrorResponse({ res, error_code: "INTERNAL_SERVER_ERROR", custom_message: 'Internal server error during schema validation.', original_error: error });
    }
}

export default validate;