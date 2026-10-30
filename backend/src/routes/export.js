import { Router } from 'express';
import { exportProject } from '../controllers/exportController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { exportSchema } from '../validators/schemas.js';

const router = Router({ mergeParams: true });

router.use(authMiddleware);

router.post('/export', validate(exportSchema), exportProject);

export default router;

