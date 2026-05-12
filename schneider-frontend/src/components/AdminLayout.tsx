import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { logout } from '@/features/auth/api/auth';
import { NotificationCenter } from './NotificationCenter';
import { Button } from './ui/button';
import { ThemeToggle } from './ThemeToggle';
import { LayoutDashboard, LogOut, Map, ShieldAlert, Zap, Presentation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AdminLayout = () => {
  const { user, logout: clearStore } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      clearStore();
      navigate('/login');
    }
  };

  const navItems = [
    { label: 'Command Center', icon: LayoutDashboard, path: '/admin/dashboard' },
    { label: 'Live Map', icon: Map, path: '/admin/map' },
  ];

  return (
    <div className="flex min-h-screen w-full bg-slate-950 text-slate-50 overflow-hidden">
      {/* Sidebar Navigation - Dark Command Center Theme */}
      <aside className="fixed inset-y-0 left-0 z-50 flex w-16 md:w-64 flex-col border-r border-slate-800 bg-slate-900/80 backdrop-blur-2xl">
        <div className="flex h-16 items-center justify-center md:justify-start md:px-6 border-b border-slate-800">
          <div className="h-8 w-8 rounded-md bg-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.5)]">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="hidden md:block ml-3 font-bold text-lg tracking-tight text-white">Schneider HQ</span>
        </div>
        
        <div className="flex-1 overflow-auto py-6">
          <nav className="flex flex-col gap-2 px-3">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Button 
                  key={item.path}
                  variant="ghost" 
                  className={`justify-start gap-3 h-11 transition-all duration-300 ${isActive ? 'bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 hover:text-blue-300' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
                  onClick={() => navigate(item.path)}
                >
                  <item.icon className={`h-5 w-5 ${isActive ? 'text-blue-400' : ''}`} />
                  <span className="hidden md:block font-medium">{item.label}</span>
                  {isActive && (
                    <motion.div layoutId="activeNav" className="absolute left-0 w-1 h-8 bg-blue-500 rounded-r-full" />
                  )}
                </Button>
              );
            })}
            
            <div className="mt-8 mb-4 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:block">
              System Settings
            </div>
            
            <Button variant="ghost" className="justify-start gap-3 h-11 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 cursor-not-allowed opacity-50">
              <ShieldAlert className="h-5 w-5" />
              <span className="hidden md:block font-medium">Access Control</span>
            </Button>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800 flex flex-col gap-2 bg-slate-900/50">
          <div className="hidden md:flex items-center gap-3 px-2 mb-2">
            <div className="h-9 w-9 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 font-bold border border-blue-500/30">
              {user?.name.charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium leading-none text-slate-200">{user?.name}</span>
              <span className="text-xs text-blue-400 mt-1 flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                System Admin
              </span>
            </div>
          </div>
          <Button variant="ghost" className="justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-950/50 h-10 mt-2" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            <span className="hidden md:block">Disconnect</span>
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col pl-16 md:pl-64">
        {/* Top Header */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950/80 backdrop-blur-2xl px-6 shadow-sm">
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-950/50 border border-blue-900/50 text-blue-400 text-xs font-semibold uppercase tracking-wider">
               <Presentation className="h-3 w-3" />
               Demo Presentation Mode
             </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <NotificationCenter />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
          <AnimatePresence mode="wait">
            <Outlet />
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
