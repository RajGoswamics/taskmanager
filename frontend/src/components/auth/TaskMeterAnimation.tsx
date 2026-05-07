import { CheckCircle2, Circle, Clock, GitBranch, MessageSquare } from 'lucide-react';

const TASKS = [
  {
    key: 'TM-128',
    title: 'Refactor authentication flow',
    status: 'In Progress',
    statusClass: 'bg-blue-500/20 text-blue-200 ring-blue-300/30',
    priority: 'High',
    priorityClass: 'bg-orange-500/20 text-orange-200 ring-orange-300/30',
    avatar: 'https://i.pravatar.cc/80?img=12',
    comments: 4,
  },
  {
    key: 'TM-129',
    title: 'Design onboarding experience',
    status: 'In Review',
    statusClass: 'bg-amber-500/20 text-amber-200 ring-amber-300/30',
    priority: 'Medium',
    priorityClass: 'bg-violet-500/20 text-violet-200 ring-violet-300/30',
    avatar: 'https://i.pravatar.cc/80?img=47',
    comments: 7,
  },
  {
    key: 'TM-130',
    title: 'Set up analytics dashboard',
    status: 'Done',
    statusClass: 'bg-emerald-500/20 text-emerald-200 ring-emerald-300/30',
    priority: 'Low',
    priorityClass: 'bg-sky-500/20 text-sky-200 ring-sky-300/30',
    avatar: 'https://i.pravatar.cc/80?img=33',
    comments: 2,
  },
  {
    key: 'TM-131',
    title: 'Migrate database to v2 schema',
    status: 'Todo',
    statusClass: 'bg-slate-500/20 text-slate-200 ring-slate-300/30',
    priority: 'Urgent',
    priorityClass: 'bg-rose-500/20 text-rose-200 ring-rose-300/30',
    avatar: 'https://i.pravatar.cc/80?img=68',
    comments: 12,
  },
  {
    key: 'TM-132',
    title: 'Optimize image loading pipeline',
    status: 'In Progress',
    statusClass: 'bg-blue-500/20 text-blue-200 ring-blue-300/30',
    priority: 'Medium',
    priorityClass: 'bg-violet-500/20 text-violet-200 ring-violet-300/30',
    avatar: 'https://i.pravatar.cc/80?img=5',
    comments: 3,
  },
  {
    key: 'TM-133',
    title: 'Roll out role-based permissions',
    status: 'Todo',
    statusClass: 'bg-slate-500/20 text-slate-200 ring-slate-300/30',
    priority: 'High',
    priorityClass: 'bg-orange-500/20 text-orange-200 ring-orange-300/30',
    avatar: 'https://i.pravatar.cc/80?img=24',
    comments: 5,
  },
];

function StatusIcon({ status }: { status: string }) {
  if (status === 'Done') return <CheckCircle2 className="h-3 w-3" />;
  if (status === 'In Progress') return <Clock className="h-3 w-3" />;
  return <Circle className="h-3 w-3" />;
}

function TaskCard({ task }: { task: (typeof TASKS)[number] }) {
  return (
    <div className="rounded-xl border border-white/15 bg-white/5 p-4 shadow-xl shadow-black/20 backdrop-blur-md">
      <div className="flex items-center justify-between text-[10px] text-white/60">
        <span className="font-mono">{task.key}</span>
        <span className="flex items-center gap-1">
          <GitBranch className="h-3 w-3" />
          main
        </span>
      </div>
      <div className="mt-2 text-sm font-semibold text-white">{task.title}</div>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span
          className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium ring-1 ring-inset ${task.statusClass}`}
        >
          <StatusIcon status={task.status} />
          {task.status}
        </span>
        <span
          className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium ring-1 ring-inset ${task.priorityClass}`}
        >
          {task.priority}
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <img
            src={task.avatar}
            alt=""
            className="h-5 w-5 rounded-full ring-1 ring-white/30"
            loading="lazy"
          />
          <span className="text-[10px] text-white/70">assigned</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-white/60">
          <MessageSquare className="h-3 w-3" />
          {task.comments}
        </div>
      </div>
    </div>
  );
}

export default function TaskMeterAnimation() {
  const loop = [...TASKS, ...TASKS];
  return (
    <div className="relative h-[460px] w-full overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          maskImage:
            'linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)',
          background: 'transparent',
        }}
      />
      <div
        className="absolute left-1/2 top-0 w-[280px] -translate-x-1/2"
        style={{ transform: 'translateX(-50%) perspective(1000px) rotateX(8deg) rotateY(-4deg)' }}
      >
        <div className="flex flex-col gap-3 animate-task-meter-marquee will-change-transform">
          {loop.map((t, i) => (
            <TaskCard task={t} key={i} />
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute -right-10 top-10 h-32 w-32 rounded-full bg-fuchsia-400/30 blur-3xl animate-pulse-soft" />
      <div className="pointer-events-none absolute -left-10 bottom-10 h-32 w-32 rounded-full bg-violet-300/30 blur-3xl animate-pulse-soft" />
    </div>
  );
}
