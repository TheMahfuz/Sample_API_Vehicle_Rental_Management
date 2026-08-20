// Import necessary modules
import express, { Express } from 'express';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import {
    REQUEST_SIZE_LIMIT,
    REQUEST_LIMIT,
    REQUEST_LIMIT_TIME
} from './config/config';
import dotenv from 'dotenv';
dotenv.config();

// Create an instance of the Express application
let app: Express = express();

// Enable CORS for all requests
app.use(cors());

// Enable 'trust proxy' to ensure express-rate-limit can accurately identify users
app.set('trust proxy', 1);

// Create a rate limiter that allows x requests per IP per y seconds
const limiter = rateLimit({
    windowMs: REQUEST_LIMIT_TIME, // milliseconds
    max: REQUEST_LIMIT, // limit each IP to requests per windowMs
    message: 'Too many requests, please try again later.',
    validate: {
        validationsConfig: false,
        default: true,
    }
});
// Apply the rate limiter to all requests
app.use(limiter);

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: REQUEST_SIZE_LIMIT }));
app.use(express.json({ limit: REQUEST_SIZE_LIMIT }));

// Serve uploaded files (e.g. vehicle photos) statically
import { UPLOAD_DIR, uploadPath } from './middleware/upload';
app.use(`/${UPLOAD_DIR}`, express.static(uploadPath));

// Import and apply injectable methods to the app
import { bootstrap } from '../system';
app = bootstrap(app);

// Disable the 'x-powered-by' header for security reasons
app.disable('x-powered-by');

// Export the configured app instance
export default app;
