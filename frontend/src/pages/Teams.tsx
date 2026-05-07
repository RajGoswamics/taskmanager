import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, MoreHorizontal, Trash2, Pencil, Users } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/api/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import type { Team } from '@/types';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#10b981', '#06b6d4', '#3b82f6'];

export default function Teams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Team | null>(null);
  const [form, setForm] = useState({ name: '', description: '', color: COLORS[0] });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/teams');
      setTeams(data.teams);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const startCreate = () => {
    setEditing(null);
    setForm({ name: '', description: '', color: COLORS[0] });
    setOpen(true);
  };

  const startEdit = (t: Team) => {
    setEditing(t);
    setForm({ name: t.name, description: t.description || '', color: t.color });
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        await api.put(`/teams/${editing._id}`, form);
        toast.success('Team updated');
      } else {
        await api.post('/teams', form);
        toast.success('Team created');
      }
      setOpen(false);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save team');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (t: Team) => {
    if (!confirm(`Delete team "${t.name}"?`)) return;
    try {
      await api.delete(`/teams/${t._id}`);
      toast.success('Team deleted');
      setTeams((prev) => prev.filter((x) => x._id !== t._id));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Teams</h1>
          <p className="text-sm text-muted-foreground">Group people who work together.</p>
        </div>
        <Button variant="gradient" onClick={startCreate}>
          <Plus className="h-4 w-4" /> New team
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl bg-muted/50" />
          ))}
        </div>
      ) : teams.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">No teams yet</h3>
            <p className="max-w-sm text-sm text-muted-foreground">Create a team to collaborate with others.</p>
            <Button variant="gradient" onClick={startCreate}>
              <Plus className="h-4 w-4" /> New team
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((t) => (
            <Card key={t._id} className="card-hover group">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <Link to={`/app/teams/${t._id}`} className="flex flex-1 items-center gap-3 min-w-0">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white text-sm font-bold"
                      style={{ background: t.color }}
                    >
                      {t.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold">{t.name}</h3>
                      <p className="truncate text-xs text-muted-foreground">
                        {t.description || `${t.members.length} members`}
                      </p>
                    </div>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => startEdit(t)}>
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(t)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {t.members.slice(0, 5).map((m) => (
                      <Avatar key={m.user._id} className="h-7 w-7 border-2 border-card">
                        <AvatarImage src={m.user.avatar} />
                        <AvatarFallback className="text-[10px]">
                          {getInitials(m.user.name)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {t.members.length > 5 && (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-muted text-[10px]">
                        +{t.members.length - 5}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{t.members.length} members</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit team' : 'New team'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Update team details.' : 'Create a team to bring people together.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="tname">Name</Label>
              <Input
                id="tname"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tdesc">Description</Label>
              <Textarea
                id="tdesc"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setForm({ ...form, color: c })}
                    className={`h-7 w-7 rounded-full border-2 ${
                      form.color === c ? 'border-foreground' : 'border-transparent'
                    }`}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="gradient" disabled={submitting}>
                {submitting ? 'Saving…' : editing ? 'Save changes' : 'Create team'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
