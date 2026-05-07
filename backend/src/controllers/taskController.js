import Task from '../models/Task.js';
import Project from '../models/Project.js';

const canAccessProject = async (projectId, user) => {
  const project = await Project.findById(projectId);
  if (!project) return { ok: false, code: 404, message: 'Project not found' };
  const isOwner = project.owner.toString() === user._id.toString();
  const isAdmin = user.role === 'admin';
  const isMember = project.members.find((m) => m.user.toString() === user._id.toString());
  if (!isOwner && !isAdmin && !isMember) {
    return { ok: false, code: 403, message: 'Not authorized for this project' };
  }
  return { ok: true, project };
};

export const createTask = async (req, res, next) => {
  try {
    const { project, title, description, status, priority, assignee, dueDate, labels, estimatedHours } =
      req.body;

    const access = await canAccessProject(project, req.user);
    if (!access.ok) return res.status(access.code).json({ message: access.message });

    const task = await Task.create({
      project,
      title,
      description,
      status,
      priority,
      assignee: assignee || null,
      dueDate: dueDate || null,
      labels,
      estimatedHours,
      reporter: req.user._id,
    });

    const populated = await Task.findById(task._id)
      .populate('assignee', 'name email avatar')
      .populate('reporter', 'name email avatar')
      .populate('project', 'name key color');

    res.status(201).json({ task: populated });
  } catch (err) {
    next(err);
  }
};

export const listTasks = async (req, res, next) => {
  try {
    const { project, status, assignee, priority, search, due, mine } = req.query;
    const filter = {};
    if (project) filter.project = project;
    if (status) filter.status = status;
    if (assignee) filter.assignee = assignee;
    if (priority) filter.priority = priority;
    if (search) filter.title = { $regex: search, $options: 'i' };
    if (mine === 'true') filter.assignee = req.user._id;
    if (due === 'overdue') {
      filter.dueDate = { $lt: new Date() };
      filter.status = { $nin: ['done', 'cancelled'] };
    }
    if (due === 'today') {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      filter.dueDate = { $gte: start, $lte: end };
    }

    if (req.user.role !== 'admin' && !project) {
      const projects = await Project.find({
        $or: [{ owner: req.user._id }, { 'members.user': req.user._id }],
      }).select('_id');
      filter.project = { $in: projects.map((p) => p._id) };
    }

    const tasks = await Task.find(filter)
      .populate('assignee', 'name email avatar')
      .populate('reporter', 'name email avatar')
      .populate('project', 'name key color')
      .sort('-createdAt');

    res.json({ tasks });
  } catch (err) {
    next(err);
  }
};

export const getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignee', 'name email avatar')
      .populate('reporter', 'name email avatar')
      .populate('project', 'name key color members owner')
      .populate('comments.user', 'name email avatar');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ task });
  } catch (err) {
    next(err);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate('project');
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const project = task.project;
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isMember = project.members.find((m) => m.user.toString() === req.user._id.toString());
    const isAssignee = task.assignee && task.assignee.toString() === req.user._id.toString();
    const isReporter = task.reporter.toString() === req.user._id.toString();

    if (!isOwner && !isAdmin && !isMember && !isAssignee && !isReporter) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    const allowed = [
      'title',
      'description',
      'status',
      'priority',
      'assignee',
      'dueDate',
      'labels',
      'estimatedHours',
      'order',
    ];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) task[field] = req.body[field];
    });
    await task.save();

    const populated = await Task.findById(task._id)
      .populate('assignee', 'name email avatar')
      .populate('reporter', 'name email avatar')
      .populate('project', 'name key color')
      .populate('comments.user', 'name email avatar');

    res.json({ task: populated });
  } catch (err) {
    next(err);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate('project');
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const project = task.project;
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isReporter = task.reporter.toString() === req.user._id.toString();
    if (!isOwner && !isAdmin && !isReporter) {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }

    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
};

export const addComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Comment content is required' });
    }
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    task.comments.push({ user: req.user._id, content });
    await task.save();

    const populated = await Task.findById(task._id).populate('comments.user', 'name email avatar');
    res.status(201).json({ comments: populated.comments });
  } catch (err) {
    next(err);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const comment = task.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    const isOwner = comment.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    task.comments.pull({ _id: req.params.commentId });
    await task.save();
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    next(err);
  }
};
