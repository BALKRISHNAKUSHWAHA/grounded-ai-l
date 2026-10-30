import { Router } from 'express';
import { synthesize, listReports, getReport } from '../controllers/synthesisController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { synthesisSchema } from '../validators/schemas.js';

const router = Router({ mergeParams: true });

router.use(authMiddleware);

router.post('/synthesize', validate(synthesisSchema), synthesize);
router.get('/synthesis', listReports);
router.get('/synthesis/:reportId', getReport);

export default router;

