export type Role = 'admin' | 'member';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  bio?: string;
  createdAt?: string;
}

export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'done' | 'cancelled';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'archived';

export interface Member {
  user: User;
  role: Role;
  joinedAt?: string;
}

export interface Team {
  _id: string;
  name: string;
  description?: string;
  color: string;
  owner: User;
  members: Member[];
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  _id: string;
  name: string;
  key: string;
  description?: string;
  status: ProjectStatus;
  priority: Priority;
  color: string;
  icon: string;
  owner: User;
  team?: { _id: string; name: string; color: string } | null;
  members: Member[];
  startDate?: string;
  dueDate?: string;
  taskStats?: { total: number; done: number; inProgress?: number; overdue: number };
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  user: User;
  content: string;
  createdAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  project: Project | string;
  status: TaskStatus;
  priority: Priority;
  assignee?: User | null;
  reporter: User;
  labels: string[];
  dueDate?: string | null;
  completedAt?: string | null;
  estimatedHours?: number;
  comments: Comment[];
  isOverdue?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardData {
  stats: {
    totalTasks: number;
    todoTasks: number;
    inProgressTasks: number;
    doneTasks: number;
    overdueTasks: number;
    myTasks: number;
    totalProjects: number;
    totalTeams: number;
    totalUsers: number;
  };
  tasksByStatus: { _id: string; count: number }[];
  tasksByPriority: { _id: string; count: number }[];
  completionTrend: { _id: string; count: number }[];
  upcoming: Task[];
  recentTasks: Task[];
  projects: Project[];
}
