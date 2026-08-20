import { Request } from 'express';

export const isApiRequest = (req: Request): boolean => {
    const accept_header = req.headers['accept'];
    const content_type_header = req.headers['content-type'];

    // Check if the request is an API call based on the Accept or Content-Type headers
    if (accept_header?.includes('application/json')) {
        return true;
    }

    if (content_type_header?.includes('application/json')) {
        return true;
    }

    // Check if the request is an API call based on the URL pattern (e.g., /api/)
    if (req.originalUrl.includes('/api/')) {
        return true;
    }

    // Check if the request params has json=true
    if (req.query.json === 'true') {
        return true;
    }

    return false;
};
