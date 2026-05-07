import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import TaskFormDialog from '../tasks/TaskFormDialog';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [taskDialog, setTaskDialog] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar open={sidebarOpen} />
      <div className="flex flex-1 flex-col min-w-0">
        <Topbar onToggleSidebar={() => setSidebarOpen((p) => !p)} onNewTask={() => setTaskDialog(true)} />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1400px] px-4 py-6 md:px-6 md:py-8">
            <Outlet />
          </div>
        </main>
      </div>
      <TaskFormDialog open={taskDialog} onOpenChange={setTaskDialog} />
    </div>
  );
}
