import { Router } from 'express';
import { listProjects, createProject, getProject, deleteProject } from '../controllers/projectController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { projectSchema } from '../validators/schemas.js';

const router = Router();

router.use(authMiddleware);

router.get('/', listProjects);
router.post('/', validate(projectSchema), createProject);
router.get('/:id', getProject);
router.delete('/:id', deleteProject);

export default router;

