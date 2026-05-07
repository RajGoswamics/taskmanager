import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/api/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Project, Task, User } from '@/types';

export default function TaskFormDialog({
  open,
  onOpenChange,
  task,
  defaultProject,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  task?: Task | null;
  defaultProject?: string;
  onSaved?: (t: Task) => void;
}) {
  const isEdit = !!task;
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    project: defaultProject || '',
    status: 'todo',
    priority: 'medium',
    assignee: 'none',
    dueDate: '',
  });

  useEffect(() => {
    if (open) {
      (async () => {
        try {
          const [pr, us] = await Promise.all([api.get('/projects'), api.get('/users')]);
          setProjects(pr.data.projects);
          setUsers(us.data.users);
        } catch {
          /* ignore */
        }
      })();
      const projectId =
        typeof task?.project === 'object' ? task?.project?._id : (task?.project as string) || defaultProject || '';
      setForm({
        title: task?.title || '',
        description: task?.description || '',
        project: projectId || '',
        status: task?.status || 'todo',
        priority: task?.priority || 'medium',
        assignee: task?.assignee?._id || 'none',
        dueDate: task?.dueDate ? task.dueDate.split('T')[0] : '',
      });
    }
  }, [open, task, defaultProject]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.project) {
      toast.error('Please select a project first');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        assignee: form.assignee === 'none' ? null : form.assignee,
        dueDate: form.dueDate || null,
      };
      const res = isEdit
        ? await api.put(`/tasks/${task!._id}`, payload)
        : await api.post('/tasks', payload);
      toast.success(isEdit ? 'Task updated' : 'Task created');
      onSaved?.(res.data.task);
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit task' : 'New task'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update task details below.' : 'Add a task to one of your projects.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              required
              maxLength={200}
              autoFocus
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="What needs to be done?"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder="Add more details (optional)"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Project</Label>
              <Select value={form.project} onValueChange={(v) => setForm({ ...form, project: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p._id} value={p._id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Assignee</Label>
              <Select value={form.assignee} onValueChange={(v) => setForm({ ...form, assignee: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u._id} value={u._id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="backlog">Backlog</SelectItem>
                  <SelectItem value="todo">Todo</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="in_review">In Review</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="due">Due date</Label>
              <Input
                id="due"
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient" disabled={submitting}>
              {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
