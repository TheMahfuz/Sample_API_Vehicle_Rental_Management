import { Request, Response, NextFunction } from 'express';
import { ApiErrorResponse } from '../config/global';
import requestMiddleware from '../middleware/request';

export { requestMiddleware };

export const error_handler = (err: any, req: Request, res: Response, next: NextFunction): void => {
    if (err instanceof Error) {
        if (err.name === 'EntityTooLargeError') {
            ApiErrorResponse({ res, error_code: "TOO_LARGE_REQUEST_ENTITY" });
        } else if (err.name === 'SyntaxError' && err.message.includes('JSON')) {
            ApiErrorResponse({ res, error_code: "INVALID_JSON_BODY" });
        } else {
            console.log('Catching the error from error handler in app injection dependencies:', err);
            return ApiErrorResponse({ res, error_code: "SOMETHING_WENT_WRONG" });
        }
    } else {
        console.log('Catching a non-error object from error handler in app injection dependencies:', err);
        return ApiErrorResponse({ res, error_code: "SOMETHING_WENT_WRONG" });
    }
}

