import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { errors } from '../config/errors';
import { ApiErrorResponse } from '../config/global';
import UserSessionModel from '../models/user_sessions.model';

declare namespace Express {
    export interface Request {
        request_id?: string;
        user?: {
            id: number;
            email: string;
        };
    }
}

// Retrieve the JWT secret from environment variables or use a default value
export const JWT_SECRET = process.env.JWT_SECRET ?? 'your_default_jwt_secret';

export default async (req: Request, res: Response, next: NextFunction) => {
    // Extract the authorization header from the request
    const authHeader = req.headers.authorization;
    // Check if the authorization header is present and properly formatted
    if (!authHeader?.startsWith('Bearer ')) {
        return ApiErrorResponse({ res, error: errors.AUTH_FAILURE, custom_message: 'Authorization header missing or malformed.' });
    }

    // Extract the token from the authorization header
    const token = authHeader?.split(' ')[1];

    // Check if the token is present
    if (!token) {
        return ApiErrorResponse({ res, error: errors.AUTH_FAILURE, custom_message: 'Invalid or expired token.' });
    }

    try {
        // Verify the token using the JWT secret
        const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

        // Check if the token exists in the database
        const authRecord = await UserSessionModel.find({ id: decoded.token_id });

        // If no record is found, the token is invalid or expired
        if (!authRecord) {
            return ApiErrorResponse({ res, error: errors.AUTH_FAILURE, custom_message: 'Invalid or expired token.' });
        }

        // Attach the decoded user information to the request object
        req.user = { id: decoded.id, email: decoded.email };

        // Proceed to the next middleware or route handler
        next();
    } catch (err) {
        // Handle any errors that occur during token verification
        return ApiErrorResponse({ res, error: errors.AUTH_FAILURE, custom_message: 'Invalid or expired token.', original_error: err });
    }
};
