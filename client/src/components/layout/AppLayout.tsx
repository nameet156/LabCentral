import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { CursorGlow } from '@/components/ui/CursorGlow';

export default function AppLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative isolate min-h-screen">
      <CursorGlow intensity="subtle" />
      {isMobileDrawerOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-[2px] md:hidden"
          onClick={() => setIsMobileDrawerOpen(false)}
        />
      )}
      <Sidebar
        collapsed={isSidebarCollapsed}
        mobileOpen={isMobileDrawerOpen}
        onCloseMobile={() => setIsMobileDrawerOpen(false)}
        onToggleCollapse={() => setIsSidebarCollapsed((collapsed) => !collapsed)}
      />
      <div className={`min-h-screen transition-[margin] duration-200 ease-out ${isSidebarCollapsed ? 'md:ml-[76px]' : 'md:ml-64'}`}>
        <Topbar
          onToggleSidebar={() => setIsSidebarCollapsed((collapsed) => !collapsed)}
          onOpenMobileNav={() => setIsMobileDrawerOpen(true)}
        />
        <main className="relative z-10 px-6 pb-8 pt-5 max-md:px-4 max-md:pt-4">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: reduceMotion ? 0 : 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0.12 : 0.18, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
