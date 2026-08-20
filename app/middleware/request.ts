import { Request, Response, NextFunction } from 'express';

export default async (req: Request, res: Response, next: NextFunction) => {
    if (process.env.NODE_ENV === 'development') {
        const endpoint = req.originalUrl || req.url;
        const method = req.method;
        type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
        const colors: Record<HttpMethod | 'DEFAULT', string> = {
            GET: '\x1b[32m',    // Green
            POST: '\x1b[34m',   // Blue
            PUT: '\x1b[33m',    // Yellow
            DELETE: '\x1b[31m', // Red
            PATCH: '\x1b[35m',  // Magenta
            DEFAULT: '\x1b[37m' // White
        };
        const resetColor = '\x1b[0m';
        const methodColor = colors[method as HttpMethod] || colors.DEFAULT;

        console.log(`[${new Date().toISOString()}] ${methodColor}${method}${resetColor} ${endpoint}`);
    }
    next();
};