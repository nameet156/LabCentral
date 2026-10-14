import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { SpotlightCard } from '@/components/ui/primitives';

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  order?: number;
}

export function StatCard({ label, value, icon: Icon, color, bgColor, order = 0 }: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 220;
    const startValue = 0;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setDisplayValue(Math.floor(progress * (value - startValue) + startValue));
      if (progress < 1) window.requestAnimationFrame(step);
      else setDisplayValue(value);
    };
    window.requestAnimationFrame(step);
  }, [value]);

  return (
    <SpotlightCard className="glass-card group relative overflow-hidden rounded-xl p-4 sm:p-5">
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18, delay: order * 0.04 }} className="relative z-10">
      <div className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full bg-primary-500/[0.06] blur-2xl transition-opacity duration-150 group-hover:opacity-100" />
      <div className="relative flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-surface-400">{label}</p>
          <p className="mt-2 font-heading text-[32px] font-semibold leading-none tracking-tight text-surface-50 tabular-nums">{displayValue}</p>
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] ${bgColor} ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      </motion.div>
    </SpotlightCard>
  );
}
