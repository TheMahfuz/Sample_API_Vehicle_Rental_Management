import { Request, Response } from 'express';
import passport from 'passport';
import { ApiResponse, ApiErrorResponse } from '../config/global';
import { errors } from '../config/errors';

import {
    login as authLogin,
    refreshToken as authRefreshToken,
    logout as authLogout,
    token_validity,
} from '../services/auth.service';

export const login = async (req: Request, res: Response): Promise<void> => {
    passport.authenticate('local', { session: false }, async (err: any, staff: any) => {
        try {
            if (err || !staff) return ApiErrorResponse({ res, error: errors.AUTH_FAILURE });
            const { user: authenticated_staff, token } = await authLogin(req, staff.email);
            const { id, name, email, created_at } = authenticated_staff;
            return ApiResponse(res, { token, token_validity, staff: { id, name, email, created_at } });
        } catch (error) {
            return ApiErrorResponse({ res, error: errors.SOMETHING_WENT_WRONG, original_error: error });
        }
    })(req, res);
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
        const token = req.headers['authorization']?.split(' ')[1] ?? '';
        const newToken = await authRefreshToken(req, token);
        return ApiResponse(res, { token: newToken, token_validity });
    } catch (err: any) {
        if (err.error_code) return ApiErrorResponse({ res, error: errors[err.error_code], custom_message: err.custom_message || err.message || null });
        return ApiErrorResponse({ res, error: errors.SOMETHING_WENT_WRONG, original_error: err });
    }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) {
            return ApiErrorResponse({ res, error: errors.AUTH_FAILURE, custom_message: 'Token not provided' });
        }
        const resp = await authLogout(token);
        return ApiResponse(res, resp);
    } catch (err: any) {
        if (err.error_code) return ApiErrorResponse({ res, error: errors[err.error_code], custom_message: err.custom_message || err.message || null });
        return ApiErrorResponse({ res, error: errors.SOMETHING_WENT_WRONG, original_error: err });
    }
};
