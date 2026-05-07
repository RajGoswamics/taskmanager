import { Link } from 'react-router-dom';
import { CalendarDays, MoreHorizontal, Trash2, Pencil } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  cn,
  formatDate,
  getInitials,
  isOverdue,
  PRIORITY_COLORS,
  STATUS_COLORS,
  STATUS_LABELS,
} from '@/lib/utils';
import type { Task } from '@/types';

export default function TaskRow({
  task,
  onEdit,
  onDelete,
  showProject = true,
}: {
  task: Task;
  onEdit?: (t: Task) => void;
  onDelete?: (t: Task) => void;
  showProject?: boolean;
}) {
  const overdue = isOverdue(task.dueDate, task.status);
  return (
    <div className="group flex items-center gap-3 border-b border-border px-4 py-2.5 hover:bg-accent/40 transition-colors">
      <div className="flex shrink-0 items-center gap-2">
        <span className={cn('rounded border px-1.5 py-0.5 text-[10px] font-medium', STATUS_COLORS[task.status])}>
          {STATUS_LABELS[task.status]}
        </span>
        <span className={cn('rounded border px-1.5 py-0.5 text-[10px] capitalize', PRIORITY_COLORS[task.priority])}>
          {task.priority}
        </span>
      </div>

      {showProject && typeof task.project === 'object' && (
        <div className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
          <span className="h-2 w-2 rounded-sm" style={{ background: task.project.color }} />
          <span className="font-mono">{task.project.key}</span>
        </div>
      )}

      <Link to={`/app/tasks/${task._id}`} className="min-w-0 flex-1 truncate text-sm font-medium hover:underline">
        {task.title}
      </Link>

      {task.dueDate && (
        <div
          className={cn(
            'flex shrink-0 items-center gap-1 text-xs',
            overdue ? 'text-rose-400' : 'text-muted-foreground'
          )}
        >
          <CalendarDays className="h-3 w-3" />
          {formatDate(task.dueDate)}
        </div>
      )}

      {task.assignee ? (
        <Avatar className="h-6 w-6 shrink-0">
          <AvatarImage src={task.assignee.avatar} />
          <AvatarFallback className="text-[10px]">{getInitials(task.assignee.name)}</AvatarFallback>
        </Avatar>
      ) : (
        <div className="h-6 w-6 shrink-0 rounded-full border border-dashed border-border" />
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit?.(task)}>
            <Pencil className="h-3.5 w-3.5" /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onDelete?.(task)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
