import express from 'express';
import { listUsers, getUser, updateUserRole, deleteUser } from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.get('/', listUsers);
router.get('/:id', getUser);
router.put('/:id/role', authorize('admin'), updateUserRole);
router.delete('/:id', authorize('admin'), deleteUser);

export default router;
