import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { logout } from '@/features/auth/api/auth';
import { NotificationCenter } from './NotificationCenter';
import { Button } from './ui/button';
import { ThemeToggle } from './ThemeToggle';
import { LayoutDashboard, LogOut, Briefcase, Wallet } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

export const AppShell = () => {
  const { user, logout: clearStore } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      clearStore();
      navigate('/login');
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Sidebar Navigation */}
      <aside className="fixed inset-y-0 left-0 z-50 flex w-16 md:w-64 flex-col border-r border-border bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-center md:justify-start md:px-6 border-b border-border">
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <span className="hidden md:block ml-3 font-bold text-lg tracking-tight">Schneider</span>
        </div>
        
        <div className="flex-1 overflow-auto py-4">
          <nav className="flex flex-col gap-2 px-2">
            <Button variant="ghost" className="justify-start gap-3" onClick={() => navigate('/dashboard')}>
              <LayoutDashboard className="h-5 w-5" />
              <span className="hidden md:block">Dashboard</span>
            </Button>
            {user?.roles.includes('customer') && (
              <Button variant="ghost" className="justify-start gap-3" onClick={() => navigate('/dashboard/services')}>
                <Briefcase className="h-5 w-5" />
                <span className="hidden md:block">Services</span>
              </Button>
            )}
            {user?.roles.includes('technician') && (
              <Button variant="ghost" className="justify-start gap-3" onClick={() => navigate('/technician/earnings')}>
                <Wallet className="h-5 w-5" />
                <span className="hidden md:block">Earnings</span>
              </Button>
            )}
          </nav>
        </div>

        <div className="p-4 border-t border-border flex flex-col gap-2">
          <div className="hidden md:flex items-center gap-3 px-2 mb-2">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              {user?.name.charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium leading-none">{user?.name}</span>
              <span className="text-xs text-muted-foreground">{user?.roles[0]}</span>
            </div>
          </div>
          <Button variant="ghost" className="justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
            <span className="hidden md:block">Logout</span>
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col pl-16 md:pl-64">
        {/* Top Header */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-end gap-4 border-b border-border bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl px-6">
          <ThemeToggle />
          <NotificationCenter />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <Outlet />
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
