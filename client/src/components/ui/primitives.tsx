import { useEffect, type ButtonHTMLAttributes, type ComponentType, type HTMLAttributes, type InputHTMLAttributes, type PointerEvent as ReactPointerEvent, type ReactNode, type SelectHTMLAttributes } from 'react';
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';

const MotionButton = motion.button as unknown as ComponentType<any>;
const MotionDiv = motion.div as unknown as ComponentType<any>;

const buttonStyles: Record<string, string> = {
  primary: 'ui-btn-primary magnetic-btn',
  secondary: 'ui-btn-secondary',
  ghost: 'ui-btn-ghost',
  danger: 'ui-btn-danger',
};

export function MagneticButton({ className = '', disabled = false, style, onPointerMove, onPointerLeave, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 260, damping: 18, mass: 0.3 });
  const springY = useSpring(y, { stiffness: 260, damping: 18, mass: 0.3 });

  const handlePointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    onPointerMove?.(event);
    if (reduceMotion || disabled || event.pointerType === 'touch') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    x.set(Math.max(-6, Math.min(6, ((event.clientX - bounds.left - bounds.width / 2) / Math.max(bounds.width / 2, 1)) * 6)));
    y.set(Math.max(-6, Math.min(6, ((event.clientY - bounds.top - bounds.height / 2) / Math.max(bounds.height / 2, 1)) * 6)));
  };

  const handlePointerLeave = (event: ReactPointerEvent<HTMLButtonElement>) => {
    onPointerLeave?.(event);
    x.set(0);
    y.set(0);
  };

  return (
    <MotionButton
      {...props}
      disabled={disabled}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{ ...style, x: springX, y: springY }}
      whileTap={reduceMotion || disabled ? undefined : { scale: 0.97 }}
      className={`ui-btn ui-btn-primary magnetic-btn ${className}`}
    />
  );
}

export function Button({ variant = 'primary', className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof buttonStyles }) {
  if (variant === 'primary') return <MagneticButton className={className} {...props} />;
  return <button className={`ui-btn ${buttonStyles[variant]} ${className}`} {...props} />;
}

interface SpotlightCardProps extends HTMLAttributes<HTMLDivElement> {
  disabled?: boolean;
}

export function SpotlightCard({ className = '', disabled = false, onPointerMove, onPointerLeave, ...props }: SpotlightCardProps) {
  const reduceMotion = useReducedMotion();
  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    onPointerMove?.(event);
    if (disabled || reduceMotion || event.pointerType === 'touch') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--spot-x', `${event.clientX - bounds.left}px`);
    event.currentTarget.style.setProperty('--spot-y', `${event.clientY - bounds.top}px`);
  };
  const handlePointerLeave = (event: ReactPointerEvent<HTMLDivElement>) => {
    onPointerLeave?.(event);
    event.currentTarget.style.removeProperty('--spot-x');
    event.currentTarget.style.removeProperty('--spot-y');
  };

  return (
    <MotionDiv
      {...props}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      whileHover={disabled || reduceMotion ? undefined : { y: -3 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className={`spotlight-card ${disabled ? 'spotlight-card-disabled' : ''} ${className}`}
    />
  );
}

export function Card({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <SpotlightCard className={`ui-card ${className}`} {...props} />;
}

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`ui-input ${className}`} {...props} />;
}

export function Select({ className = '', ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`ui-select ${className}`} {...props} />;
}

const badgeStyles: Record<string, string> = {
  neutral: 'ui-badge-neutral',
  blue: 'ui-badge-blue',
  cyan: 'ui-badge-cyan',
  success: 'ui-badge-success',
  warning: 'ui-badge-warning',
  danger: 'ui-badge-danger',
};

export function Badge({ tone = 'neutral', className = '', ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: keyof typeof badgeStyles }) {
  return <span className={`ui-badge ${badgeStyles[tone]} ${className}`} {...props} />;
}

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className = '' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="ui-modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
          <motion.section role="dialog" aria-modal="true" aria-label={title} className={`ui-modal ${className}`} initial={{ opacity: 0, y: 8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6, scale: 0.98 }} transition={{ duration: 0.18 }}>
            {children}
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Skeleton({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden="true" className={`ui-skeleton ${className}`} {...props} />;
}
