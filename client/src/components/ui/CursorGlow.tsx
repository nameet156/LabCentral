import { useEffect, type CSSProperties } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';

interface CursorGlowProps {
  intensity?: 'subtle' | 'strong';
}

export function CursorGlow({ intensity = 'subtle' }: CursorGlowProps) {
  const prefersReducedMotion = useReducedMotion();
  const hasCoarsePointer = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
  const x = useMotionValue(50);
  const y = useMotionValue(50);
  const springX = useSpring(x, { stiffness: 78, damping: 24, mass: 0.9 });
  const springY = useSpring(y, { stiffness: 78, damping: 24, mass: 0.9 });

  useEffect(() => {
    if (prefersReducedMotion) return;
    const pointerQuery = window.matchMedia('(pointer: coarse)');
    if (pointerQuery.matches) return;

    const move = (event: PointerEvent) => {
      x.set((event.clientX / Math.max(window.innerWidth, 1)) * 100);
      y.set((event.clientY / Math.max(window.innerHeight, 1)) * 100);
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, [prefersReducedMotion, x, y]);

  if (prefersReducedMotion || hasCoarsePointer) return null;

  return (
    <motion.div
      aria-hidden="true"
      className={`cursor-glow cursor-glow-${intensity}`}
      style={{ '--mx': springX, '--my': springY } as CSSProperties}
    />
  );
}
