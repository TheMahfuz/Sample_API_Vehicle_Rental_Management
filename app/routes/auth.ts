import { Router } from 'express';
import rateLimit from 'express-rate-limit';
const router = Router();
import validate from '../middleware/validate';
import auth from '../middleware/auth';

import {
    login,
    refreshToken,
    logout,
} from '../controllers/staff';

// Define the API version prefix for the routes. example: /api/v1
export const prefix = '/auth';

// Rate limit login attempts: 10 requests per minute per IP
const loginLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: 'Too many login attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Define all auth routes here
router.post('/login', loginLimiter, validate('staff', 'login'), login);
router.post('/refresh-token', auth, refreshToken);
router.post('/logout', auth, logout);

// Export the router to be used in the main application
export default router;
