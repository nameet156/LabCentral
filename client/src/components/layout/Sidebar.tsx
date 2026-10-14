import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Activity, BarChart3, ChevronLeft, LayoutDashboard, Users, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onToggleCollapse: () => void;
}

export default function Sidebar({ collapsed, mobileOpen, onCloseMobile, onToggleCollapse }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/reports', icon: BarChart3, label: 'Reports' },
    ...(user?.role === 'admin' ? [{ to: '/users', icon: Users, label: 'Users' }] : []),
  ];

  return (
    <motion.aside
      animate={{ width: collapsed ? 76 : 256 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-white/[0.08] bg-surface-900/95 shadow-2xl backdrop-blur-2xl transition-transform duration-200 md:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} max-md:!w-[280px] max-md:border-r max-md:border-white/10`}
    >
      <div className={`flex h-[72px] shrink-0 items-center border-b border-white/[0.08] ${collapsed ? 'justify-center px-2' : 'gap-3 px-5'}`}>
        <div className="glow-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-cyan-500 text-white">
          <Activity className="h-5 w-5" />
        </div>
        <div className={`min-w-0 flex-1 overflow-hidden transition-opacity duration-150 ${collapsed ? 'md:hidden' : ''}`}>
          <h1 className="truncate font-heading text-[15px] font-bold tracking-tight text-surface-50">LabCentral</h1>
          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-surface-400">Laboratory workspace</p>
        </div>
        <button
          type="button"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={onToggleCollapse}
          className={`hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg text-surface-400 transition hover:bg-surface-800 hover:text-surface-50 md:flex ${collapsed ? 'md:hidden' : ''}`}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button type="button" aria-label="Close navigation" onClick={onCloseMobile} className="ml-auto flex h-9 w-9 items-center justify-center rounded-lg text-surface-400 hover:bg-surface-800 hover:text-surface-50 md:hidden"><X className="h-4 w-4" /></button>
      </div>

      <nav aria-label="Primary navigation" className="flex-1 space-y-1.5 overflow-y-auto px-3 py-6">
        <p className={`mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-surface-500 ${collapsed ? 'md:hidden' : ''}`}>Workspace</p>
        {navItems.map(({ to, icon: Icon, label }, index) => {
          const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
          return (
            <motion.div key={to} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.16, delay: index * 0.035 }}>
            <NavLink key={to} to={to} onClick={onCloseMobile} onMouseEnter={() => setHoveredItem(to)} onMouseLeave={() => setHoveredItem(null)} onFocus={() => setHoveredItem(to)} onBlur={() => setHoveredItem(null)} aria-current={isActive ? 'page' : undefined} title={collapsed ? label : undefined}>
              <div className={`group relative flex min-h-11 items-center gap-3 overflow-hidden rounded-xl px-3 transition-colors duration-150 ${collapsed ? 'md:justify-center md:px-0' : ''} ${isActive ? 'nav-active' : 'text-surface-400 hover:text-surface-100'}`}>
                {isActive && <motion.div layoutId="sidebar-active" className="absolute inset-0 rounded-xl border border-primary-400/20 bg-gradient-to-r from-primary-500/20 to-cyan-400/[0.07] shadow-[inset_0_0_18px_rgba(45,91,255,0.08)]" transition={{ duration: 0.18 }} />}
                {!isActive && hoveredItem === to && <motion.div layoutId="sidebar-hover" className="absolute inset-0 rounded-xl bg-surface-800/75" transition={{ duration: 0.16 }} />}
                {isActive && <span className="absolute bottom-2 left-0 top-2 w-[2px] rounded-full bg-gradient-to-b from-primary-400 to-cyan-300" />}
                <motion.span className="relative z-10 flex shrink-0" animate={{ x: hoveredItem === to ? 2 : 0 }} transition={{ duration: 0.16 }}><Icon className="h-[18px] w-[18px]" /></motion.span>
                <span className={`relative z-10 truncate text-[13px] font-medium ${collapsed ? 'md:hidden' : ''}`}>{label}</span>
              </div>
            </NavLink>
            </motion.div>
          );
        })}
      </nav>

      <div className={`m-3 rounded-xl border border-white/[0.06] bg-surface-850/80 p-3 ${collapsed ? 'md:hidden' : ''}`}>
        <p className="text-[11px] font-medium text-surface-300">LabCentral LIMS</p>
        <p className="mt-1 text-[10px] text-surface-500">Sample operations workspace</p>
      </div>
    </motion.aside>
  );
}
