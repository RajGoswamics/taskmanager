import { useEffect, useState } from 'react';
import { Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/api/client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { User } from '@/types';
import { useAuth } from '@/store/auth';
import { getInitials, formatDate } from '@/lib/utils';

export default function Members() {
  const me = useAuth((s) => s.user);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users', { params: search ? { search } : {} });
      setUsers(data.users);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [search]);

  const updateRole = async (id: string, role: string) => {
    try {
      const { data } = await api.put(`/users/${id}/role`, { role });
      setUsers((prev) => prev.map((u) => (u._id === id ? data.user : u)));
      toast.success('Role updated');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  const remove = async (u: User) => {
    if (!confirm(`Delete user ${u.name}?`)) return;
    try {
      await api.delete(`/users/${u._id}`);
      setUsers((prev) => prev.filter((x) => x._id !== u._id));
      toast.success('User deleted');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Members</h1>
        <p className="text-sm text-muted-foreground">Manage workspace members and their roles.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search members…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 pl-9 max-w-md"
        />
      </div>

      <Card className="overflow-hidden">
        <div className="grid grid-cols-12 gap-3 border-b border-border px-4 py-2 text-xs text-muted-foreground">
          <div className="col-span-5">User</div>
          <div className="col-span-3">Role</div>
          <div className="col-span-3">Joined</div>
          <div className="col-span-1" />
        </div>
        {loading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded bg-muted/50" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No members found.
          </CardContent>
        ) : (
          users.map((u) => (
            <div
              key={u._id}
              className="grid grid-cols-12 items-center gap-3 border-b border-border px-4 py-3 hover:bg-accent/30"
            >
              <div className="col-span-5 flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={u.avatar} />
                  <AvatarFallback>{getInitials(u.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{u.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{u.email}</div>
                </div>
              </div>
              <div className="col-span-3">
                <Select value={u.role} onValueChange={(v) => updateRole(u._id, v)} disabled={u._id === me?._id}>
                  <SelectTrigger className="h-8 w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-3 text-xs text-muted-foreground">
                {u.createdAt ? formatDate(u.createdAt) : ''}
              </div>
              <div className="col-span-1">
                {u._id !== me?._id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => remove(u)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
