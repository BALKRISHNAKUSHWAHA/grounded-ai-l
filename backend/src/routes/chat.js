import { Router } from 'express';
import { sendMessage, getHistory } from '../controllers/chatController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { chatSchema } from '../validators/schemas.js';

const router = Router({ mergeParams: true });

router.use(authMiddleware);

router.post('/', validate(chatSchema), sendMessage);
router.get('/', getHistory);

export default router;

