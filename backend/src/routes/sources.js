import { Router } from 'express';
import multer from 'multer';
import { addSource, listSources, getSource, deleteSource } from '../controllers/sourceController.js';
import { authMiddleware } from '../middleware/auth.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

const router = Router({ mergeParams: true });

router.use(authMiddleware);

router.post('/', upload.single('file'), addSource);
router.get('/', listSources);
router.get('/:sourceId', getSource);
router.delete('/:sourceId', deleteSource);

export default router;

