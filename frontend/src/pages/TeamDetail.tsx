import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, UserMinus } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/api/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { getInitials } from '@/lib/utils';
import type { Team, User } from '@/types';
import { useAuth } from '@/store/auth';

export default function TeamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuth((s) => s.user);
  const [team, setTeam] = useState<Team | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [t, u] = await Promise.all([api.get(`/teams/${id}`), api.get('/users')]);
      setTeam(t.data.team);
      setUsers(u.data.users);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load team');
      navigate('/app/teams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const addMember = async () => {
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      const { data } = await api.post(`/teams/${id}/members`, { userId: selectedUser });
      setTeam(data.team);
      toast.success('Member added');
      setAddOpen(false);
      setSelectedUser('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add');
    } finally {
      setSubmitting(false);
    }
  };

  const removeMember = async (userId: string) => {
    if (!confirm('Remove this member?')) return;
    try {
      const { data } = await api.delete(`/teams/${id}/members/${userId}`);
      setTeam(data.team);
      toast.success('Member removed');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to remove');
    }
  };

  if (loading || !team) return <div className="h-40 animate-pulse rounded-xl bg-muted/50" />;

  const isOwner = team.owner._id === user?._id;
  const canManage = isOwner || user?.role === 'admin';
  const candidates = users.filter((u) => !team.members.find((m) => m.user._id === u._id));

  return (
    <div className="space-y-5">
      <Button variant="ghost" size="sm" onClick={() => navigate('/app/teams')}>
        <ArrowLeft className="h-3.5 w-3.5" /> All teams
      </Button>

      <div className="flex items-start gap-4">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-xl text-white text-lg font-bold"
          style={{ background: team.color }}
        >
          {team.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{team.name}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{team.description || 'No description'}</p>
          <div className="mt-2 text-xs text-muted-foreground">
            Owned by {team.owner.name} · {team.members.length} members
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">Members</CardTitle>
          {canManage && (
            <Button variant="gradient" size="sm" onClick={() => setAddOpen(true)}>
              <Plus className="h-3.5 w-3.5" /> Add member
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {team.members.map((m) => (
              <div
                key={m.user._id}
                className="flex items-center gap-3 rounded-md border border-border p-3"
              >
                <Avatar>
                  <AvatarImage src={m.user.avatar} />
                  <AvatarFallback>{getInitials(m.user.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="text-sm font-medium">{m.user.name}</div>
                  <div className="text-xs text-muted-foreground">{m.user.email}</div>
                </div>
                <Badge variant="outline" className="capitalize">
                  {m.user._id === team.owner._id ? 'Owner' : m.role}
                </Badge>
                {canManage && m.user._id !== team.owner._id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => removeMember(m.user._id)}
                  >
                    <UserMinus className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add member</DialogTitle>
            <DialogDescription>Select a user to add to this team.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>User</Label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger>
                <SelectValue placeholder="Select user" />
              </SelectTrigger>
              <SelectContent>
                {candidates.map((u) => (
                  <SelectItem key={u._id} value={u._id}>
                    {u.name} ({u.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button variant="gradient" onClick={addMember} disabled={submitting || !selectedUser}>
              {submitting ? 'Adding…' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
