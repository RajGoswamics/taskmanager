import Project from '../models/Project.js';
import Task from '../models/Task.js';

const generateKey = (name) => {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 4).toUpperCase();
  return words
    .slice(0, 3)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
};

export const createProject = async (req, res, next) => {
  try {
    const { name, description, color, icon, team, priority, status, startDate, dueDate, members = [] } =
      req.body;

    const project = await Project.create({
      name,
      key: req.body.key || generateKey(name),
      description,
      color,
      icon,
      team: team || null,
      priority,
      status,
      startDate,
      dueDate,
      owner: req.user._id,
      members: [
        { user: req.user._id, role: 'admin' },
        ...members.map((m) => ({ user: m, role: 'member' })),
      ],
    });

    const populated = await Project.findById(project._id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar role')
      .populate('team', 'name color');

    res.status(201).json({ project: populated });
  } catch (err) {
    next(err);
  }
};

export const listProjects = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const filter = {
      $or: [{ owner: req.user._id }, { 'members.user': req.user._id }],
    };
    if (req.user.role === 'admin' && req.query.all === 'true') {
      delete filter.$or;
    }
    if (status) filter.status = status;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const projects = await Project.find(filter)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar role')
      .populate('team', 'name color')
      .sort('-createdAt');

    const withCounts = await Promise.all(
      projects.map(async (p) => {
        const total = await Task.countDocuments({ project: p._id });
        const done = await Task.countDocuments({ project: p._id, status: 'done' });
        const overdue = await Task.countDocuments({
          project: p._id,
          dueDate: { $lt: new Date() },
          status: { $nin: ['done', 'cancelled'] },
        });
        return { ...p.toObject(), taskStats: { total, done, overdue } };
      })
    );

    res.json({ projects: withCounts });
  } catch (err) {
    next(err);
  }
};

export const getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar role')
      .populate('team', 'name color');
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const total = await Task.countDocuments({ project: project._id });
    const done = await Task.countDocuments({ project: project._id, status: 'done' });
    const inProgress = await Task.countDocuments({ project: project._id, status: 'in_progress' });
    const overdue = await Task.countDocuments({
      project: project._id,
      dueDate: { $lt: new Date() },
      status: { $nin: ['done', 'cancelled'] },
    });

    res.json({ project: { ...project.toObject(), taskStats: { total, done, inProgress, overdue } } });
  } catch (err) {
    next(err);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const isOwner = project.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isProjectAdmin = project.members.find(
      (m) => m.user.toString() === req.user._id.toString() && m.role === 'admin'
    );

    if (!isOwner && !isAdmin && !isProjectAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }

    const allowed = ['name', 'description', 'color', 'icon', 'priority', 'status', 'startDate', 'dueDate', 'team', 'key'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) project[field] = req.body[field];
    });
    await project.save();

    const populated = await Project.findById(project._id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar role')
      .populate('team', 'name color');
    res.json({ project: populated });
  } catch (err) {
    next(err);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const isOwner = project.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Only owner or admin can delete project' });
    }

    await Task.deleteMany({ project: project._id });
    await project.deleteOne();
    res.json({ message: 'Project and its tasks deleted' });
  } catch (err) {
    next(err);
  }
};

export const addProjectMember = async (req, res, next) => {
  try {
    const { userId, role = 'member' } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const isOwner = project.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (project.members.find((m) => m.user.toString() === userId)) {
      return res.status(400).json({ message: 'User is already a member' });
    }
    project.members.push({ user: userId, role });
    await project.save();

    const populated = await Project.findById(project._id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar role')
      .populate('team', 'name color');
    res.json({ project: populated });
  } catch (err) {
    next(err);
  }
};

export const removeProjectMember = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const isOwner = project.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    project.members = project.members.filter((m) => m.user.toString() !== req.params.userId);
    await project.save();

    const populated = await Project.findById(project._id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar role')
      .populate('team', 'name color');
    res.json({ project: populated });
  } catch (err) {
    next(err);
  }
};
