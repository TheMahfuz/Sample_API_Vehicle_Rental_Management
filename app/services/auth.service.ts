import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import jwt from 'jsonwebtoken';
import Staff from '../models/staff.model';
import UserSession from '../models/user_sessions.model';
import bcrypt from 'bcrypt';
import { Request } from 'express';

import { fromBase64Str } from '../libraries/encryption.lib';

// JWT configuration
export const JWT_SECRET = process.env.JWT_SECRET ?? 'your_default_jwt_secret';

// Set JWT expiration time in seconds from environment variable or default to 3600 seconds (1 hour)
let JWT_EXPIRATION: number = Number(process.env.JWT_EXPIRATION) || 3600;
export const token_validity = JWT_EXPIRATION;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined. Please set it in your environment variables.');
}

// JWT payload interface
interface JwtPayload {
    id: string | number;
    token_id: string | number;
    email: string;
}

// Local strategy for passport (email + password_hash)
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email, password, done) => {
    try {
        const staff = await Staff.qb().where({ email }).select('*').first();
        if (!staff) {
            return done(null, false, { message: 'Incorrect email.' });
        }
        if (!staff.password_hash) return done(null, false, { message: 'Your password is not set.' });

        const isMatch = await bcrypt.compare(password, staff.password_hash);
        if (!isMatch) {
            return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, staff);
    } catch (err) {
        return done(err);
    }
}));

export const hashPassword = async (password: string): Promise<string> => {
    return bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    return bcrypt.compare(password, hashedPassword);
};

// Login function
export const login = async (req: Request, identifier: string, field: string = 'email') => {
    const staff = await Staff.find({ [field]: identifier });
    if (!staff) {
        throw new Error('Incorrect credentials.');
    }

    const userAgent = req.headers['user-agent'] ?? null;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
    const [insert_id] = await UserSession.save({
        user_id: staff.id,
        token: null,
        user_agent: userAgent,
        ip: ip,
    });

    const payload: JwtPayload = { id: staff.id, token_id: insert_id, email: staff.email };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
    const token_info = fromBase64Str(token.split(".")[1]);

    await UserSession.update({ id: insert_id }, {
        token,
        ended_at: new Date(token_info.exp * 1000)
    });
    return { user: staff, token, token_id: insert_id };
};

// Refresh token function
export const refreshToken = async (req: Request, token: string) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
        if (typeof decoded.id !== 'string' && typeof decoded.id !== 'number') {
            return Promise.reject({ error_code: 'AUTH_FAILURE', custom_message: "Invalid token payload." });
        }
        const newPayload = { id: decoded.id, token_id: decoded.token_id, email: decoded.email };
        const newToken = jwt.sign(newPayload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
        const token_info = fromBase64Str(newToken.split(".")[1]);
        const userAgent = req.headers['user-agent'] ?? null;
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;

        await UserSession.update({ id: decoded.token_id }, {
            token: newToken,
            user_agent: userAgent,
            ip,
            ended_at: new Date(token_info.exp * 1000),
            updated_at: UserSession.db.fn.now()
        });
        return newToken;
    } catch (err) {
        return Promise.reject({ error_code: 'AUTH_FAILURE', custom_message: "Invalid token payload." });
    }
};

// Logout function
export const logout = async (token: string): Promise<{ success: boolean; message: string }> => {
    try {
        if (!token) {
            return Promise.reject({ error_code: "AUTH_FAILURE", custom_message: 'Token not provided' });
        }
        await UserSession.delete({ token });
        return { success: true, message: 'Staff logged out successfully' };
    } catch (err) {
        return Promise.reject(err);
    }
};
