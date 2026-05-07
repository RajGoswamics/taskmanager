import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Pencil, Send, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/api/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  cn,
  formatDate,
  formatRelative,
  getInitials,
  isOverdue,
  PRIORITY_COLORS,
  STATUS_COLORS,
  STATUS_LABELS,
} from '@/lib/utils';
import type { Task } from '@/types';
import { useAuth } from '@/store/auth';
import TaskFormDialog from '@/components/tasks/TaskFormDialog';

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuth((s) => s.user);
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/tasks/${id}`);
      setTask(data.task);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load task');
      navigate('/app/tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const updateField = async (patch: Partial<Task>) => {
    try {
      const { data } = await api.put(`/tasks/${id}`, patch);
      setTask(data.task);
      toast.success('Updated');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await api.post(`/tasks/${id}/comments`, { content: comment });
      setTask((prev) => (prev ? { ...prev, comments: data.comments } : prev));
      setComment('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return;
    try {
      await api.delete(`/tasks/${id}/comments/${commentId}`);
      setTask((prev) =>
        prev ? { ...prev, comments: prev.comments.filter((c) => c._id !== commentId) } : prev
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  if (loading || !task) return <div className="h-40 animate-pulse rounded-xl bg-muted/50" />;

  const overdue = isOverdue(task.dueDate, task.status);

  return (
    <div className="space-y-5">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </Button>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {typeof task.project === 'object' && (
                      <Link
                        to={`/app/projects/${task.project._id}`}
                        className="font-mono hover:text-foreground"
                      >
                        {task.project.key}
                      </Link>
                    )}
                    <span>·</span>
                    <span>Reported by {task.reporter.name}</span>
                    <span>·</span>
                    <span>{formatRelative(task.createdAt)}</span>
                  </div>
                  <h1 className="mt-1 text-2xl font-bold tracking-tight">{task.title}</h1>
                </div>
                <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
              </div>
              <Separator className="my-4" />
              <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {task.description || (
                  <span className="text-muted-foreground italic">No description provided.</span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <MessageSquare className="h-4 w-4" /> Comments ({task.comments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {task.comments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No comments yet.</p>
              ) : (
                <div className="space-y-3">
                  {task.comments.map((c) => (
                    <div key={c._id} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={c.user?.avatar} />
                        <AvatarFallback className="text-[10px]">
                          {getInitials(c.user?.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{c.user?.name}</span>
                          <span className="text-xs text-muted-foreground">{formatRelative(c.createdAt)}</span>
                          {(c.user?._id === user?._id || user?.role === 'admin') && (
                            <button
                              onClick={() => deleteComment(c._id)}
                              className="ml-auto text-xs text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                        <p className="mt-0.5 whitespace-pre-wrap text-sm">{c.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Separator />
              <form onSubmit={submitComment} className="flex gap-3">
                <Avatar className="h-8 w-8 mt-0.5">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="text-[10px]">{getInitials(user?.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Textarea
                    placeholder="Leave a comment…"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={2}
                  />
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      variant="gradient"
                      size="sm"
                      disabled={submitting || !comment.trim()}
                    >
                      <Send className="h-3.5 w-3.5" /> {submitting ? 'Sending…' : 'Comment'}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Properties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <div className="mb-1 text-xs text-muted-foreground">Status</div>
                <Select value={task.status} onValueChange={(v) => updateField({ status: v as any })}>
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
              <div>
                <div className="mb-1 text-xs text-muted-foreground">Priority</div>
                <Select value={task.priority} onValueChange={(v) => updateField({ priority: v as any })}>
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
              <Separator />
              <div>
                <div className="mb-1 text-xs text-muted-foreground">Assignee</div>
                {task.assignee ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={task.assignee.avatar} />
                      <AvatarFallback className="text-[10px]">
                        {getInitials(task.assignee.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{task.assignee.name}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">Unassigned</span>
                )}
              </div>
              <div>
                <div className="mb-1 text-xs text-muted-foreground">Reporter</div>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={task.reporter.avatar} />
                    <AvatarFallback className="text-[10px]">
                      {getInitials(task.reporter.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span>{task.reporter.name}</span>
                </div>
              </div>
              <Separator />
              <div>
                <div className="mb-1 text-xs text-muted-foreground">Due date</div>
                {task.dueDate ? (
                  <div className={cn('flex items-center gap-2', overdue && 'text-rose-400')}>
                    {overdue && <AlertTriangle className="h-3.5 w-3.5" />}
                    {formatDate(task.dueDate)} {overdue && <Badge variant="destructive">Overdue</Badge>}
                  </div>
                ) : (
                  <span className="text-muted-foreground">No due date</span>
                )}
              </div>
              <div>
                <div className="mb-1 text-xs text-muted-foreground">Created</div>
                <span>{formatRelative(task.createdAt)}</span>
              </div>
              {task.completedAt && (
                <div>
                  <div className="mb-1 text-xs text-muted-foreground">Completed</div>
                  <span>{formatRelative(task.completedAt)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Button
            variant="outline"
            className="w-full text-destructive hover:text-destructive"
            onClick={async () => {
              if (!confirm('Delete this task?')) return;
              try {
                await api.delete(`/tasks/${id}`);
                toast.success('Task deleted');
                navigate(-1);
              } catch (err: any) {
                toast.error(err.response?.data?.message || 'Failed to delete');
              }
            }}
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete task
          </Button>
        </div>
      </div>

      <TaskFormDialog open={editing} onOpenChange={setEditing} task={task} onSaved={() => load()} />
    </div>
  );
}
