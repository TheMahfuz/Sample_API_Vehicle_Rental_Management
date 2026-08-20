import { Router } from 'express';
const router = Router();
import auth from '../middleware/auth';
import validate from '../middleware/validate';

import {
    list,
    getById,
    create,
    update,
    remove,
} from '../controllers/rental';

// Route prefix
export const prefix = '/rentals';

router.get('/', auth, validate('rental', 'list', 'query'), list);
router.get('/:id', auth, getById);
router.post('/', auth, validate('rental', 'create'), create);
router.put('/:id', auth, validate('rental', 'update'), update);
router.delete('/:id', auth, remove);

export default router;
