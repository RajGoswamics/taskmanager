import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  UserCog,
  Settings,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/store/auth';
import { Logo, LogoMark } from '@/components/ui/logo';

const nav = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/projects', label: 'Projects', icon: FolderKanban },
  { to: '/app/tasks', label: 'My Tasks', icon: CheckSquare },
  { to: '/app/teams', label: 'Teams', icon: Users },
];

const adminNav = [{ to: '/app/members', label: 'Members', icon: UserCog }];

export default function Sidebar({ open }: { open: boolean }) {
  const user = useAuth((s) => s.user);
  return (
    <aside
      className={cn(
        'sticky top-0 flex h-screen flex-col border-r border-border bg-card/30 backdrop-blur-xl transition-all duration-300',
        open ? 'w-60' : 'w-0 -ml-px overflow-hidden lg:w-16'
      )}
    >
      <div className="flex h-14 items-center gap-2.5 px-4 border-b border-border">
        {open ? (
          <Logo size={28} showTagline />
        ) : (
          <LogoMark size={28} className="mx-auto" />
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 p-3 overflow-y-auto">
        <div className={cn('px-2 pb-1.5', !open && 'lg:hidden')}>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Workspace
          </span>
        </div>
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {open && <span>{item.label}</span>}
          </NavLink>
        ))}

        {user?.role === 'admin' && (
          <>
            <div className={cn('px-2 pb-1.5 pt-4', !open && 'lg:hidden')}>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Admin
              </span>
            </div>
            {adminNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )
                }
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {open && <span>{item.label}</span>}
              </NavLink>
            ))}
          </>
        )}

        <div className="mt-auto" />
        <NavLink
          to="/app/settings"
          className={({ isActive }) =>
            cn(
              'group flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            )
          }
        >
          <Settings className="h-4 w-4 shrink-0" />
          {open && <span>Settings</span>}
        </NavLink>
      </nav>

      {open && (
        <div className="m-3 rounded-lg border border-border bg-gradient-to-br from-violet-500/10 to-blue-500/10 p-3">
          <div className="flex items-center gap-2 text-xs">
            <Sparkles className="h-3.5 w-3.5 text-violet-400" />
            <span className="font-semibold">Pro tip</span>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            Press <kbd className="rounded bg-muted px-1 font-mono text-[10px]">⌘K</kbd> to quickly create
            tasks.
          </p>
        </div>
      )}
    </aside>
  );
}
