import { useAuth } from '@/context/AuthContext';
import { BarChart3, ChevronDown, LayoutDashboard, LogOut, Menu, Moon, Sun, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface TopbarProps {
  onToggleSidebar: () => void;
  onOpenMobileNav: () => void;
}

export default function Topbar({ onToggleSidebar, onOpenMobileNav }: TopbarProps) {
  const { user, logout } = useAuth();
  const [isDark, setIsDark] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const stored = localStorage.getItem('lims_theme');
    if (stored === 'light') {
      setIsDark(false);
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('light', !next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('lims_theme', next ? 'dark' : 'light');
  };

  const page = location.pathname.startsWith('/reports')
    ? { title: 'Reports', icon: BarChart3 }
    : location.pathname.startsWith('/users')
      ? { title: 'User management', icon: Users }
      : { title: 'Sample tracker', icon: LayoutDashboard };
  const PageIcon = page.icon;

  const roleColors: Record<string, string> = {
    admin: 'bg-primary-500/15 text-primary-300',
    technician: 'bg-status-in-progress-bg text-status-in-progress',
    viewer: 'bg-surface-700/50 text-surface-300',
  };

  return (
    <header className="sticky top-3 z-20 mx-4 flex h-14 items-center justify-between rounded-2xl border border-white/[0.08] bg-surface-900/85 px-3 shadow-[0_12px_32px_rgba(0,0,0,0.16)] backdrop-blur-2xl sm:mx-6 sm:px-4 max-md:top-2 max-md:mx-3">
      <div className="flex min-w-0 items-center gap-2">
        <button type="button" aria-label="Open navigation menu" onClick={onOpenMobileNav} className="flex h-9 w-9 items-center justify-center rounded-xl text-surface-300 transition hover:bg-surface-800 hover:text-surface-50 md:hidden">
          <Menu className="h-[18px] w-[18px]" />
        </button>
        <button type="button" aria-label="Collapse or expand sidebar" title="Collapse or expand sidebar" onClick={onToggleSidebar} className="hidden h-9 w-9 items-center justify-center rounded-xl text-surface-400 transition hover:bg-surface-800 hover:text-surface-50 md:flex">
          <Menu className="h-[18px] w-[18px]" />
        </button>
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-500/10 text-primary-300 md:hidden"><PageIcon className="h-4 w-4" /></span>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-surface-100">{page.title}</p>
            <p className="hidden text-[10px] text-surface-500 sm:block">Laboratory operations</p>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <button type="button" onClick={toggleTheme} aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'} title={isDark ? 'Switch to light mode' : 'Switch to dark mode'} className="flex h-9 w-9 items-center justify-center rounded-xl text-surface-300 transition hover:bg-surface-800 hover:text-primary-300 focus-visible:ring-2 focus-visible:ring-primary-500">
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <div className="mx-1 h-6 w-px bg-surface-700" />
        <div className="flex items-center gap-2.5 rounded-xl px-1.5 py-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-primary-300/20 bg-gradient-to-br from-primary-500 to-cyan-600 text-xs font-bold text-white shadow-[0_0_18px_rgba(45,91,255,0.18)]">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="hidden min-w-0 sm:block">
            <p className="max-w-32 truncate text-xs font-medium leading-tight text-surface-100">{user?.name}</p>
            <span className={`mt-1 inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-semibold capitalize ${roleColors[user?.role || 'viewer']}`}>{user?.role}</span>
          </div>
          <ChevronDown className="hidden h-3.5 w-3.5 text-surface-500 sm:block" />
        </div>
        <button type="button" onClick={logout} aria-label="Log out" title="Log out" className="flex h-9 w-9 items-center justify-center rounded-xl text-surface-400 transition hover:bg-status-rejected-bg hover:text-status-rejected focus-visible:ring-2 focus-visible:ring-status-rejected">
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
