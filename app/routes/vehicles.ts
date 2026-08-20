import { Router } from 'express';
const router = Router();
import auth from '../middleware/auth';
import validate from '../middleware/validate';
import upload from '../middleware/upload';

import {
    list,
    getById,
    create,
    update,
    remove,
} from '../controllers/vehicle';

// Route prefix
export const prefix = '/vehicles';

router.get('/', auth, validate('vehicle', 'list', 'query'), list);
router.get('/:id', auth, getById);
router.post('/', auth, upload.single('photo'), validate('vehicle', 'create'), create);
router.put('/:id', auth, upload.single('photo'), validate('vehicle', 'update'), update);
router.delete('/:id', auth, remove);

export default router;
