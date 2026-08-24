import { useAuth } from '@/context/AuthContext';
import { LogOut, Sun, Moon, Menu, Activity, LayoutDashboard, BarChart3, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

export default function Topbar() {
  const { user, logout } = useAuth();
  const [isDark, setIsDark] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const stored = localStorage.getItem('lims_theme');
    if (stored === 'light') {
      setIsDark(false);
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
      localStorage.setItem('lims_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.setItem('lims_theme', 'light');
    }
  };

  const roleColors: Record<string, string> = {
    admin: 'bg-primary-600/20 text-primary-400',
    technician: 'bg-status-in-progress/20 text-status-in-progress',
    viewer: 'bg-surface-600/30 text-surface-300',
  };

  return (
    <>
      <header className="sticky top-0 h-16 bg-surface-900/80 backdrop-blur-xl border-b border-surface-800 flex items-center justify-between px-6 z-20
                          max-md:px-4">
        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2 -ml-2 text-surface-400 hover:text-surface-200"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile logo */}
        <div className="md:hidden flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary-400" />
          <span className="font-heading font-bold text-sm">LabCentral</span>
        </div>

        {/* Left spacer for desktop */}
        <div className="max-md:hidden" />

        {/* Right section */}
        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-surface-400 hover:text-surface-200 hover:bg-surface-800 transition-colors"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
          </button>

          {/* User info */}
          <div className="flex items-center gap-3 pl-3 border-l border-surface-700">
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-semibold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="max-sm:hidden">
              <p className="text-sm font-medium text-surface-200 leading-tight">{user?.name}</p>
              <span className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-full mt-0.5 ${roleColors[user?.role || 'viewer']}`}>
                {user?.role}
              </span>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-lg text-surface-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile nav overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <nav className="absolute left-0 top-0 h-full w-64 bg-surface-900 border-r border-surface-800 p-4 pt-20 space-y-1"
               onClick={(e) => e.stopPropagation()}>
            <NavLink to="/" className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
              ${isActive ? 'text-primary-400 bg-primary-600/15' : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/50'}`}>
              <LayoutDashboard className="w-5 h-5" /> Dashboard
            </NavLink>
            <NavLink to="/reports" className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
              ${isActive ? 'text-primary-400 bg-primary-600/15' : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/50'}`}>
              <BarChart3 className="w-5 h-5" /> Reports
            </NavLink>
            {user?.role === 'admin' && (
              <NavLink to="/users" className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive ? 'text-primary-400 bg-primary-600/15' : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/50'}`}>
                <Users className="w-5 h-5" /> Users
              </NavLink>
            )}
          </nav>
        </div>
      )}
    </>
  );
}

