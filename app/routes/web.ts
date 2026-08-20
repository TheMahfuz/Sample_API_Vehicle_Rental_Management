import { Router } from 'express';
const router = Router();
// import validate from '../app/middleware/validate';

import { home } from '../controllers/home';

// Define the API version prefix for the routes. example: /api/v1
export const prefix = '/';

// Define the route here
router.get('/', home);

// Export the router to be used in the main application
export default router;
