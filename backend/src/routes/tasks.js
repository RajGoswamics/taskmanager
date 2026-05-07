import express from 'express';
import {
  createTask,
  listTasks,
  getTask,
  updateTask,
  deleteTask,
  addComment,
  deleteComment,
} from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.route('/').get(listTasks).post(createTask);
router.route('/:id').get(getTask).put(updateTask).delete(deleteTask);
router.post('/:id/comments', addComment);
router.delete('/:id/comments/:commentId', deleteComment);

export default router;
