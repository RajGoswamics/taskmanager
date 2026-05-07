import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, ListFilter, KanbanSquare, List } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TaskFormDialog from '@/components/tasks/TaskFormDialog';
import TaskRow from '@/components/tasks/TaskRow';
import { cn, getInitials, PRIORITY_COLORS, STATUS_COLORS, STATUS_LABELS, formatDate } from '@/lib/utils';
import type { Task } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';

const STATUS_COLUMNS: { id: Task['status']; label: string }[] = [
  { id: 'backlog', label: 'Backlog' },
  { id: 'todo', label: 'Todo' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'in_review', label: 'In Review' },
  { id: 'done', label: 'Done' },
];

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [scope, setScope] = useState<string>('mine');
  const [view, setView] = useState<'list' | 'board'>('list');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (priorityFilter !== 'all') params.priority = priorityFilter;
      if (scope === 'mine') params.mine = 'true';
      if (scope === 'overdue') params.due = 'overdue';
      const { data } = await api.get('/tasks', { params });
      setTasks(data.tasks);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [statusFilter, priorityFilter, scope]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [search]);

  const handleDelete = async (t: Task) => {
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

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
          <p className="text-sm text-muted-foreground">All your tasks in one place.</p>
        </div>
        <Button
          variant="gradient"
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> New task
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Tabs value={scope} onValueChange={setScope}>
          <TabsList>
            <TabsTrigger value="mine">My Tasks</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative ml-auto">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 w-56 pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-8 w-[140px]">
            <ListFilter className="h-3.5 w-3.5 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="backlog">Backlog</SelectItem>
            <SelectItem value="todo">Todo</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="in_review">In Review</SelectItem>
            <SelectItem value="done">Done</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="h-8 w-[130px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
        <div className="ml-1 flex items-center rounded-md border border-border p-0.5">
          <Button
            variant={view === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-7 w-7"
            onClick={() => setView('list')}
          >
            <List className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={view === 'board' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-7 w-7"
            onClick={() => setView('board')}
          >
            <KanbanSquare className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-md bg-muted/50" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <h3 className="text-lg font-semibold">No tasks found</h3>
            <p className="mt-1 text-sm text-muted-foreground">Try adjusting filters or creating a new task.</p>
            <Button
              variant="gradient"
              className="mt-4"
              onClick={() => {
                setEditing(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4" /> New task
            </Button>
          </CardContent>
        </Card>
      ) : view === 'list' ? (
        <Card className="overflow-hidden">
          {tasks.map((t) => (
            <TaskRow
              key={t._id}
              task={t}
              onEdit={(task) => {
                setEditing(task);
                setDialogOpen(true);
              }}
              onDelete={handleDelete}
            />
          ))}
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-5">
          {STATUS_COLUMNS.map((col) => (
            <div key={col.id} className="rounded-xl border border-border bg-card/40 p-2">
              <div className="flex items-center justify-between px-2 pb-2">
                <div className="flex items-center gap-2">
                  <span className={cn('rounded border px-1.5 py-0.5 text-[10px]', STATUS_COLORS[col.id])}>
                    {col.label}
                  </span>
                  <span className="text-xs text-muted-foreground">{tasksByStatus[col.id].length}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {tasksByStatus[col.id].length === 0 ? (
                  <div className="rounded-md border border-dashed border-border/50 px-2 py-6 text-center text-xs text-muted-foreground">
                    No tasks
                  </div>
                ) : (
                  tasksByStatus[col.id].map((t) => (
                    <Link
                      key={t._id}
                      to={`/app/tasks/${t._id}`}
                      className="block rounded-md border border-border bg-background p-3 hover:border-foreground/20 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={cn('rounded border px-1.5 py-0.5 text-[10px] capitalize', PRIORITY_COLORS[t.priority])}
                        >
                          {t.priority}
                        </span>
                        {typeof t.project === 'object' && (
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {t.project.key}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 text-sm font-medium">{t.title}</div>
                      <div className="mt-3 flex items-center justify-between">
                        {t.dueDate && (
                          <span className="text-[11px] text-muted-foreground">{formatDate(t.dueDate)}</span>
                        )}
                        {t.assignee && (
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={t.assignee.avatar} />
                            <AvatarFallback className="text-[9px]">
                              {getInitials(t.assignee.name)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <TaskFormDialog open={dialogOpen} onOpenChange={setDialogOpen} task={editing} onSaved={() => load()} />
    </div>
  );
}
