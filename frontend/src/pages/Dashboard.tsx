import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FolderKanban,
  ListTodo,
  TrendingUp,
  Users,
  ArrowRight,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RTooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import { api } from '@/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/store/auth';
import {
  cn,
  formatDate,
  getInitials,
  isOverdue,
  PRIORITY_COLORS,
  STATUS_COLORS,
  STATUS_LABELS,
} from '@/lib/utils';
import type { DashboardData } from '@/types';
import { Button } from '@/components/ui/button';

const STATUS_PIE_COLORS: Record<string, string> = {
  backlog: '#71717a',
  todo: '#94a3b8',
  in_progress: '#3b82f6',
  in_review: '#f59e0b',
  done: '#10b981',
  cancelled: '#f43f5e',
};

export default function Dashboard() {
  const user = useAuth((s) => s.user);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/dashboard');
        setData(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading)
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-muted/50" />
        ))}
      </div>
    );

  if (!data) return null;

  const stats = [
    { label: 'Total Tasks', value: data.stats.totalTasks, icon: ListTodo, color: 'text-violet-400 bg-violet-500/10' },
    { label: 'In Progress', value: data.stats.inProgressTasks, icon: Activity, color: 'text-blue-400 bg-blue-500/10' },
    { label: 'Completed', value: data.stats.doneTasks, icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-500/10' },
    { label: 'Overdue', value: data.stats.overdueTasks, icon: AlertTriangle, color: 'text-rose-400 bg-rose-500/10' },
  ];

  const trendData = (() => {
    const map = new Map(data.completionTrend.map((d) => [d._id, d.count]));
    const last7: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      last7.push({ date: d.toLocaleDateString('en-US', { weekday: 'short' }), count: (map.get(key) as number) || 0 });
    }
    return last7;
  })();

  const pieData = data.tasksByStatus.map((d) => ({
    name: STATUS_LABELS[d._id] || d._id,
    value: d.count,
    fill: STATUS_PIE_COLORS[d._id] || '#71717a',
  }));

  const priorityData = data.tasksByPriority.map((d) => ({
    name: d._id,
    count: d.count,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-muted-foreground">Here's what's happening with your work today.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="capitalize gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {user?.role}
          </Badge>
          <Button variant="outline" size="sm" asChild>
            <Link to="/app/tasks">
              View all tasks <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="card-hover">
            <CardContent className="flex items-center gap-4 p-5">
              <div className={cn('flex h-11 w-11 items-center justify-center rounded-lg', s.color)}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  {s.label}
                </div>
                <div className="text-2xl font-bold leading-tight">{s.value}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" /> Completion trend
            </CardTitle>
            <span className="text-xs text-muted-foreground">Last 7 days</span>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} allowDecimals={false} />
                  <RTooltip
                    contentStyle={{
                      background: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorCount)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Status breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {pieData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No data yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} stroke="transparent" />
                      ))}
                    </Pie>
                    <RTooltip
                      contentStyle={{
                        background: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="mt-2 space-y-1">
              {pieData.map((p) => (
                <div key={p.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-sm" style={{ background: p.fill }} />
                    <span>{p.name}</span>
                  </div>
                  <span className="text-muted-foreground">{p.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-amber-400" /> Upcoming
            </CardTitle>
            <Link to="/app/tasks" className="text-xs text-muted-foreground hover:text-foreground">
              View all
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {data.upcoming.length === 0 ? (
              <div className="px-6 pb-6 text-sm text-muted-foreground">No upcoming tasks. Nice!</div>
            ) : (
              <div className="divide-y divide-border">
                {data.upcoming.map((t) => (
                  <Link
                    key={t._id}
                    to={`/app/tasks/${t._id}`}
                    className="flex items-center justify-between gap-3 px-6 py-3 hover:bg-accent/40"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={cn('inline-block h-2 w-2 rounded-full', {
                          'bg-rose-500': isOverdue(t.dueDate, t.status),
                          'bg-amber-500': !isOverdue(t.dueDate, t.status) && t.priority === 'high',
                          'bg-blue-500': !isOverdue(t.dueDate, t.status) && t.priority !== 'high',
                        })}
                      />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{t.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {typeof t.project === 'object' ? t.project.name : ''} · Due {formatDate(t.dueDate!)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn('rounded border px-1.5 py-0.5 text-[10px]', STATUS_COLORS[t.status])}>
                        {STATUS_LABELS[t.status]}
                      </span>
                      {t.assignee && (
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={t.assignee.avatar} />
                          <AvatarFallback className="text-[10px]">
                            {getInitials(t.assignee.name)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Priority distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              {priorityData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No data
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={priorityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} allowDecimals={false} />
                    <RTooltip
                      contentStyle={{
                        background: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <div className="flex items-center gap-2 text-xs">
                  <FolderKanban className="h-3.5 w-3.5 text-violet-400" /> Projects
                </div>
                <div className="mt-1 text-xl font-bold">{data.stats.totalProjects}</div>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <div className="flex items-center gap-2 text-xs">
                  <Users className="h-3.5 w-3.5 text-blue-400" /> Teams
                </div>
                <div className="mt-1 text-xl font-bold">{data.stats.totalTeams}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Recent activity</CardTitle>
          <Link to="/app/tasks" className="text-xs text-muted-foreground hover:text-foreground">
            View all
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {data.recentTasks.length === 0 ? (
            <div className="px-6 pb-6 text-sm text-muted-foreground">No recent activity yet.</div>
          ) : (
            <div className="divide-y divide-border">
              {data.recentTasks.map((t) => (
                <Link
                  key={t._id}
                  to={`/app/tasks/${t._id}`}
                  className="flex items-center justify-between gap-3 px-6 py-3 hover:bg-accent/40"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="font-mono text-[10px] text-muted-foreground">
                      {typeof t.project === 'object' ? t.project.key : ''}
                    </div>
                    <div className="truncate text-sm font-medium">{t.title}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn('rounded border px-1.5 py-0.5 text-[10px]', PRIORITY_COLORS[t.priority])}>
                      {t.priority}
                    </span>
                    <span className={cn('rounded border px-1.5 py-0.5 text-[10px]', STATUS_COLORS[t.status])}>
                      {STATUS_LABELS[t.status]}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
