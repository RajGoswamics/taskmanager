import { Link, useNavigate } from 'react-router-dom';
import { Bell, Menu, Moon, Plus, Search, Sun, LogOut, User as UserIcon, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/store/auth';
import { getInitials } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function Topbar({
  onToggleSidebar,
  onNewTask,
}: {
  onToggleSidebar: () => void;
  onNewTask: () => void;
}) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl">
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onToggleSidebar}>
        <Menu className="h-4 w-4" />
      </Button>

      <div className="relative hidden md:block">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search tasks, projects…" className="h-8 w-72 pl-8 text-sm" />
        <kbd className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline-block">
          ⌘K
        </kbd>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <Button onClick={onNewTask} variant="gradient" size="sm" className="hidden sm:inline-flex">
          <Plus className="h-3.5 w-3.5" /> New Task
        </Button>
        <Button onClick={onNewTask} variant="gradient" size="icon" className="sm:hidden h-8 w-8">
          <Plus className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <Button variant="ghost" size="icon" className="relative h-8 w-8">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-rose-500" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-1 flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-0.5">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
              </div>
              <Badge variant="outline" className="mt-2 capitalize w-fit text-[10px]">
                {user?.role}
              </Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/app/settings">
                <UserIcon className="h-4 w-4" /> Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/app/settings">
                <Settings className="h-4 w-4" /> Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
              <LogOut className="h-4 w-4" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
