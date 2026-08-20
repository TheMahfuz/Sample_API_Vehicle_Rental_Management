import { Response } from 'express';
import { ErrorResponse } from '../config/errors';
import { errors } from './errors';
import { logger } from '../../system';
/**
 * Constructs and sends a JSON error response to the client.
 * 
 * @param {Object} params - The parameters for the error response.
 * @param {Response} params.res - The Express response object used to send the response.
 * @param {ErrorResponse} params.error - The error object containing details about the error.
 * @param {string | null} [params.error_code] - An optional error code for an alternate error.
 * @param {string | null} [params.custom_message] - An optional custom error message to override the default.
 * @param {any} [params.original_error] - An optional original error object for logging or debugging.
 */

interface ApiResponseParams {
    res: Response,
    error?: ErrorResponse | null,
    error_code?: string | null,
    custom_message?: string | null,
    original_error?: any
}
export const ApiErrorResponse = ({ res, error, error_code, custom_message, original_error }: ApiResponseParams) => {
    try {
        let request_id = (res as any).req.request_id || null;
        if (original_error) {
            logger.error({ request_id, message: `${original_error}` }); // For error level
            console.log(original_error)
        }
        if (!error) {
            error = errors[error_code ?? 'INTERNAL_SERVER_ERROR'];
            if (!error) {
                error = errors.INTERNAL_SERVER_ERROR;
                custom_message = `Undefined error code: ${error_code}`;
            }
        }
        const error_message = custom_message ?? error.message ?? 'something went wrong!';
        const resp = {
            result_code: error.result_code || 0,
            request_id: request_id,
            time: new Date().valueOf(),
            error: {
                title: error.title,
                message: error_message
            }
        };
        logger.silly({ request_id: request_id, message: `${error_message}` });

        res.setHeader('Content-Type', 'application/json');
        res.status(error.header_status || 500);
        res.send(resp);
        res.end();
    } catch (e) {
        console.log('Something went wrong while responding JSON', { error, error_code, custom_message, original_error });
        console.log(e);
    }
};

/**
 * Constructs and sends a JSON success response to the client.
 * 
 * @param {Response} res - The Express response object used to send the response.
 * @param {any} [result=null] - The data to be included in the response body.
 */
export const ApiResponse = (res: Response, result: any = null) => {
    try {
        const responseData: {
            result_code: number;
            time: number;
            maintenance_info: null;
            result: any;
            request_id?: string | null;
        } = {
            "result_code": 0,
            request_id: (res as any).req.request_id || null,
            "time": new Date().valueOf(),
            "maintenance_info": null,
            result: null
        };

        if (typeof result === 'string') responseData.result = { message: result };
        else responseData.result = result;

        logger.info({ request_id: responseData.request_id, message: 'Successfully responded.' });

        res.setHeader('Content-Type', 'application/json');
        res.status(200);
        res.send(responseData);
        res.end();
    } catch (e) {
        console.log(e);
        console.log('ApiResponse method error');
    }
};