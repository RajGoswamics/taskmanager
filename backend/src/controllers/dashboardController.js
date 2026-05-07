import Task from '../models/Task.js';
import Project from '../models/Project.js';
import Team from '../models/Team.js';
import User from '../models/User.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const isAdmin = req.user.role === 'admin';

    const projectFilter = isAdmin
      ? {}
      : { $or: [{ owner: userId }, { 'members.user': userId }] };
    const projects = await Project.find(projectFilter).select('_id name color status');
    const projectIds = projects.map((p) => p._id);

    const taskFilter = isAdmin ? {} : { project: { $in: projectIds } };

    const [totalTasks, todoTasks, inProgressTasks, doneTasks, overdueTasks, myTasks, totalProjects, totalTeams, totalUsers] =
      await Promise.all([
        Task.countDocuments(taskFilter),
        Task.countDocuments({ ...taskFilter, status: 'todo' }),
        Task.countDocuments({ ...taskFilter, status: 'in_progress' }),
        Task.countDocuments({ ...taskFilter, status: 'done' }),
        Task.countDocuments({
          ...taskFilter,
          dueDate: { $lt: new Date() },
          status: { $nin: ['done', 'cancelled'] },
        }),
        Task.countDocuments({ assignee: userId }),
        Project.countDocuments(projectFilter),
        Team.countDocuments(
          isAdmin ? {} : { $or: [{ owner: userId }, { 'members.user': userId }] }
        ),
        isAdmin ? User.countDocuments() : 0,
      ]);

    const upcoming = await Task.find({
      ...taskFilter,
      dueDate: { $gte: new Date() },
      status: { $nin: ['done', 'cancelled'] },
    })
      .sort('dueDate')
      .limit(5)
      .populate('assignee', 'name avatar')
      .populate('project', 'name color key');

    const recentTasks = await Task.find(taskFilter)
      .sort('-updatedAt')
      .limit(8)
      .populate('assignee', 'name avatar')
      .populate('project', 'name color key');

    const tasksByStatus = await Task.aggregate([
      ...(isAdmin ? [] : [{ $match: { project: { $in: projectIds } } }]),
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const tasksByPriority = await Task.aggregate([
      ...(isAdmin ? [] : [{ $match: { project: { $in: projectIds } } }]),
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const completionTrend = await Task.aggregate([
      {
        $match: {
          ...(isAdmin ? {} : { project: { $in: projectIds } }),
          completedAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      stats: {
        totalTasks,
        todoTasks,
        inProgressTasks,
        doneTasks,
        overdueTasks,
        myTasks,
        totalProjects,
        totalTeams,
        totalUsers,
      },
      tasksByStatus,
      tasksByPriority,
      completionTrend,
      upcoming,
      recentTasks,
      projects,
    });
  } catch (err) {
    next(err);
  }
};
