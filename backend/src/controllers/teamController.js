import Team from '../models/Team.js';

export const createTeam = async (req, res, next) => {
  try {
    const { name, description, color, members = [] } = req.body;

    const team = await Team.create({
      name,
      description,
      color,
      owner: req.user._id,
      members: [
        { user: req.user._id, role: 'admin' },
        ...members.map((m) => ({ user: m, role: 'member' })),
      ],
    });

    const populated = await Team.findById(team._id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar role');

    res.status(201).json({ team: populated });
  } catch (err) {
    next(err);
  }
};

export const listTeams = async (req, res, next) => {
  try {
    const teams = await Team.find({
      $or: [{ owner: req.user._id }, { 'members.user': req.user._id }],
    })
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar role')
      .sort('-createdAt');
    res.json({ teams });
  } catch (err) {
    next(err);
  }
};

export const getTeam = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar role');
    if (!team) return res.status(404).json({ message: 'Team not found' });
    res.json({ team });
  } catch (err) {
    next(err);
  }
};

export const updateTeam = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    const isOwner = team.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this team' });
    }

    const { name, description, color } = req.body;
    if (name) team.name = name;
    if (description !== undefined) team.description = description;
    if (color) team.color = color;
    await team.save();

    const populated = await Team.findById(team._id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar role');
    res.json({ team: populated });
  } catch (err) {
    next(err);
  }
};

export const deleteTeam = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    const isOwner = team.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this team' });
    }

    await team.deleteOne();
    res.json({ message: 'Team deleted' });
  } catch (err) {
    next(err);
  }
};

export const addMember = async (req, res, next) => {
  try {
    const { userId, role = 'member' } = req.body;
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    const isOwner = team.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const exists = team.members.find((m) => m.user.toString() === userId);
    if (exists) return res.status(400).json({ message: 'User is already a team member' });

    team.members.push({ user: userId, role });
    await team.save();

    const populated = await Team.findById(team._id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar role');
    res.json({ team: populated });
  } catch (err) {
    next(err);
  }
};

export const removeMember = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    const isOwner = team.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    team.members = team.members.filter((m) => m.user.toString() !== req.params.userId);
    await team.save();

    const populated = await Team.findById(team._id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar role');
    res.json({ team: populated });
  } catch (err) {
    next(err);
  }
};
