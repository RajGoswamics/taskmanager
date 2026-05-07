import express from 'express';
import {
  createTeam,
  listTeams,
  getTeam,
  updateTeam,
  deleteTeam,
  addMember,
  removeMember,
} from '../controllers/teamController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.route('/').get(listTeams).post(createTeam);
router.route('/:id').get(getTeam).put(updateTeam).delete(deleteTeam);
router.post('/:id/members', addMember);
router.delete('/:id/members/:userId', removeMember);

export default router;
