import { Router } from 'express';
const router = Router();
import auth from '../middleware/auth';
import validate from '../middleware/validate';

import { rentalsReport } from '../controllers/report';

// Route prefix
export const prefix = '/reports';

router.get('/rentals', auth, validate('report', 'rentals', 'query'), rentalsReport);

export default router;
