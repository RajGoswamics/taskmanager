import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name = '') {
  return name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function formatDate(date: string | Date | null | undefined) {
  if (!date) return '';
  const d = new Date(date);
  if (isToday(d)) return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';
  return format(d, 'MMM d, yyyy');
}

export function formatRelative(date: string | Date | null | undefined) {
  if (!date) return '';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function isOverdue(date: string | Date | null | undefined, status?: string) {
  if (!date || status === 'done' || status === 'cancelled') return false;
  return isPast(new Date(date));
}

export const STATUS_LABELS: Record<string, string> = {
  backlog: 'Backlog',
  todo: 'Todo',
  in_progress: 'In Progress',
  in_review: 'In Review',
  done: 'Done',
  cancelled: 'Cancelled',
};

export const PRIORITY_LABELS: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export const STATUS_COLORS: Record<string, string> = {
  backlog: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
  todo: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
  in_progress: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  in_review: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  done: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  cancelled: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
};

export const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  medium: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
  high: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  urgent: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
};
