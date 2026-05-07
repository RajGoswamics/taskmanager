import express from 'express';
import {
  createProject,
  listProjects,
  getProject,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember,
} from '../controllers/projectController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.route('/').get(listProjects).post(createProject);
router.route('/:id').get(getProject).put(updateProject).delete(deleteProject);
router.post('/:id/members', addProjectMember);
router.delete('/:id/members/:userId', removeProjectMember);

export default router;
