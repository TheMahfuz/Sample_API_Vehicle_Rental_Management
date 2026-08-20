import { Request, Response, NextFunction } from 'express';
import { requestlog } from './logger'
import { generateRequestID } from './utils'

export const setRequestId = (req: Request, res: Response, next: NextFunction) => {
    try {
        req.request_id = generateRequestID();
        next();
    } catch (error) {
        console.error('Request logging failed:', error);
        next();
    }
};

export const logOnRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await requestlog(req);
        next();
    } catch (error) {
        console.error('Request logging failed:', error);
        next();
    }
};