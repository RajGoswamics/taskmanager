import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, MoreHorizontal, Trash2, Pencil, Users, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/api/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import TaskRow from '@/components/tasks/TaskRow';
import TaskFormDialog from '@/components/tasks/TaskFormDialog';
import ProjectFormDialog from '@/components/projects/ProjectFormDialog';
import { cn, formatDate, getInitials, PRIORITY_COLORS, STATUS_COLORS, STATUS_LABELS } from '@/lib/utils';
import type { Project, Task } from '@/types';
import { useAuth } from '@/store/auth';

const STATUS_COLUMNS: { id: Task['status']; label: string }[] = [
  { id: 'backlog', label: 'Backlog' },
  { id: 'todo', label: 'Todo' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'in_review', label: 'In Review' },
  { id: 'done', label: 'Done' },
];

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuth((s) => s.user);

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editProjectOpen, setEditProjectOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [pRes, tRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get('/tasks', { params: { project: id } }),
      ]);
      setProject(pRes.data.project);
      setTasks(tRes.data.tasks);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load project');
      navigate('/app/projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleDeleteTask = async (t: Task) => {
    if (!confirm(`Delete task "${t.title}"?`)) return;
    try {
      await api.delete(`/tasks/${t._id}`);
      toast.success('Task deleted');
      setTasks((prev) => prev.filter((x) => x._id !== t._id));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const tasksByStatus = useMemo(() => {
    const map: Record<string, Task[]> = {};
    STATUS_COLUMNS.forEach((c) => (map[c.id] = []));
    tasks.forEach((t) => {
      if (map[t.status]) map[t.status].push(t);
    });
    return map;
  }, [tasks]);

  if (loading || !project) {
    return <div className="h-40 animate-pulse rounded-xl bg-muted/50" />;
  }

  const isOwner = project.owner._id === user?._id;
  const canEdit = isOwner || user?.role === 'admin';
  const total = project.taskStats?.total || 0;
  const done = project.taskStats?.done || 0;
  const percent = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="space-y-5">
      <Button variant="ghost" size="sm" onClick={() => navigate('/app/projects')}>
        <ArrowLeft className="h-3.5 w-3.5" /> All projects
      </Button>

      <div className="flex flex-wrap items-start gap-4 justify-between">
        <div className="flex items-start gap-4 min-w-0">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-white text-lg font-bold shadow-md"
            style={{ background: project.color }}
          >
            {project.key?.slice(0, 2) || project.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight truncate">{project.name}</h1>
              <Badge variant="outline" className="capitalize">
                {project.status.replace('_', ' ')}
              </Badge>
              <Badge variant="outline" className={cn(PRIORITY_COLORS[project.priority], 'capitalize')}>
                {project.priority}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
              {project.description || 'No description.'}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" /> {project.members.length} members
              </span>
              {project.dueDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> Due {formatDate(project.dueDate)}
                </span>
              )}
              <span>
                Owner: <span className="text-foreground">{project.owner.name}</span>
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="gradient" onClick={() => { setEditingTask(null); setTaskDialogOpen(true); }}>
            <Plus className="h-4 w-4" /> New task
          </Button>
          {canEdit && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setEditProjectOpen(true)}>
                  <Pencil className="h-3.5 w-3.5" /> Edit project
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={async () => {
                    if (!confirm('Delete project and all its tasks?')) return;
                    try {
                      await api.delete(`/projects/${project._id}`);
                      toast.success('Project deleted');
                      navigate('/app/projects');
                    } catch (err: any) {
                      toast.error(err.response?.data?.message || 'Failed to delete');
                    }
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { l: 'Total', v: total, c: 'text-violet-400' },
          { l: 'In Progress', v: project.taskStats?.inProgress || 0, c: 'text-blue-400' },
          { l: 'Completed', v: done, c: 'text-emerald-400' },
          { l: 'Overdue', v: project.taskStats?.overdue || 0, c: 'text-rose-400' },
        ].map((s) => (
          <Card key={s.l}>
            <CardContent className="p-4">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{s.l}</div>
              <div className={cn('mt-1 text-2xl font-bold', s.c)}>{s.v}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {done}/{total} tasks complete
            </span>
            <span>{percent}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${percent}%`, background: project.color }}
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="board">
        <TabsList>
          <TabsTrigger value="board">Board</TabsTrigger>
          <TabsTrigger value="list">List</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>
        <TabsContent value="board">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-5">
            {STATUS_COLUMNS.map((col) => (
              <div key={col.id} className="rounded-xl border border-border bg-card/40 p-2">
                <div className="flex items-center justify-between px-2 pb-2">
                  <span className={cn('rounded border px-1.5 py-0.5 text-[10px]', STATUS_COLORS[col.id])}>
                    {col.label}
                  </span>
                  <span className="text-xs text-muted-foreground">{tasksByStatus[col.id].length}</span>
                </div>
                <div className="flex flex-col gap-2">
                  {tasksByStatus[col.id].length === 0 ? (
                    <div className="rounded-md border border-dashed border-border/50 px-2 py-6 text-center text-xs text-muted-foreground">
                      Drop tasks here
                    </div>
                  ) : (
                    tasksByStatus[col.id].map((t) => (
                      <Link
                        key={t._id}
                        to={`/app/tasks/${t._id}`}
                        className="block rounded-md border border-border bg-background p-3 hover:border-foreground/20 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={cn(
                              'rounded border px-1.5 py-0.5 text-[10px] capitalize',
                              PRIORITY_COLORS[t.priority]
                            )}
                          >
                            {t.priority}
                          </span>
                          {t.dueDate && (
                            <span className="text-[10px] text-muted-foreground">
                              {formatDate(t.dueDate)}
                            </span>
                          )}
                        </div>
                        <div className="mt-2 text-sm font-medium">{t.title}</div>
                        {t.assignee && (
                          <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={t.assignee.avatar} />
                              <AvatarFallback className="text-[9px]">
                                {getInitials(t.assignee.name)}
                              </AvatarFallback>
                            </Avatar>
                            {t.assignee.name}
                          </div>
                        )}
                      </Link>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="list">
          <Card className="overflow-hidden">
            {tasks.length === 0 ? (
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                No tasks yet. Click "New task" to get started.
              </CardContent>
            ) : (
              tasks.map((t) => (
                <TaskRow
                  key={t._id}
                  task={t}
                  showProject={false}
                  onEdit={(task) => {
                    setEditingTask(task);
                    setTaskDialogOpen(true);
                  }}
                  onDelete={handleDeleteTask}
                />
              ))
            )}
          </Card>
        </TabsContent>
        <TabsContent value="members">
          <Card>
            <CardContent className="p-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {project.members.map((m) => (
                  <div
                    key={m.user._id}
                    className="flex items-center gap-3 rounded-md border border-border p-3"
                  >
                    <Avatar>
                      <AvatarImage src={m.user.avatar} />
                      <AvatarFallback>{getInitials(m.user.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-sm font-medium">{m.user.name}</div>
                      <div className="truncate text-xs text-muted-foreground">{m.user.email}</div>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {m.role}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <TaskFormDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        task={editingTask}
        defaultProject={project._id}
        onSaved={() => load()}
      />
      <ProjectFormDialog
        open={editProjectOpen}
        onOpenChange={setEditProjectOpen}
        project={project}
        onSaved={() => load()}
      />
    </div>
  );
}
