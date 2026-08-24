import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, BarChart3, Users, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

export default function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/reports', icon: BarChart3, label: 'Reports' },
    ...(user?.role === 'admin' ? [{ to: '/users', icon: Users, label: 'Users' }] : []),
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-surface-900 border-r border-surface-800 flex flex-col z-30
                       max-md:hidden">
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-surface-800">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center glow-primary">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-heading font-bold text-surface-100 tracking-tight">LabCentral</h1>
          <p className="text-[10px] text-surface-500 font-medium uppercase tracking-widest">LIMS</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = item.to === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.to);

          return (
            <NavLink key={item.to} to={item.to}>
              <div className="relative">
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-primary-600/15 rounded-lg"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <div className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                  ${isActive ? 'text-primary-400' : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/50'}`}>
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              </div>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-surface-800">
        <p className="text-xs text-surface-500 text-center">v1.0.3 • LabCentral LIMS</p>
      </div>
    </aside>
  );
}

