import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, FolderKanban, MoreHorizontal, Trash2, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ProjectFormDialog from '@/components/projects/ProjectFormDialog';
import { cn, getInitials, PRIORITY_COLORS } from '@/lib/utils';
import type { Project } from '@/types';

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/projects', { params: search ? { search } : {} });
      setProjects(data.projects);
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

  const handleDelete = async (p: Project) => {
    if (!confirm(`Delete project "${p.name}"? All tasks will be removed.`)) return;
    try {
      await api.delete(`/projects/${p._id}`);
      toast.success('Project deleted');
      setProjects((prev) => prev.filter((x) => x._id !== p._id));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground">All projects you own or collaborate on.</p>
        </div>
        <Button
          variant="gradient"
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> New project
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search projects…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 pl-9 w-full max-w-md"
        />
      </div>

      {loading ? (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-xl bg-muted/50" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <FolderKanban className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">No projects yet</h3>
            <p className="max-w-sm text-sm text-muted-foreground">
              Get started by creating your first project. It's where all your tasks live.
            </p>
            <Button
              variant="gradient"
              onClick={() => {
                setEditing(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4" /> New project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => {
            const total = p.taskStats?.total ?? 0;
            const done = p.taskStats?.done ?? 0;
            const percent = total ? Math.round((done / total) * 100) : 0;
            return (
              <Card key={p._id} className="card-hover group relative">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <Link to={`/app/projects/${p._id}`} className="flex flex-1 items-center gap-3 min-w-0">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white text-sm font-bold"
                        style={{ background: p.color }}
                      >
                        {p.key?.slice(0, 2) || p.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate font-semibold leading-tight">{p.name}</h3>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {p.description || 'No description'}
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
                        <DropdownMenuItem
                          onClick={() => {
                            setEditing(p);
                            setDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(p)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <Badge variant="outline" className={cn(PRIORITY_COLORS[p.priority], 'capitalize')}>
                      {p.priority}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {p.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Progress</span>
                      <span>
                        {done}/{total} · {percent}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${percent}%`, background: p.color }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {p.members.slice(0, 4).map((m) => (
                        <Avatar key={m.user._id} className="h-7 w-7 border-2 border-card">
                          <AvatarImage src={m.user.avatar} />
                          <AvatarFallback className="text-[10px]">
                            {getInitials(m.user.name)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {p.members.length > 4 && (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-muted text-[10px]">
                          +{p.members.length - 4}
                        </div>
                      )}
                    </div>
                    {p.taskStats && p.taskStats.overdue > 0 && (
                      <span className="text-xs text-rose-400">{p.taskStats.overdue} overdue</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <ProjectFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        project={editing}
        onSaved={() => load()}
      />
    </div>
  );
}
