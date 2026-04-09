import { type ReactNode, type CSSProperties } from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  hover?: boolean;
  delay?: number;
  padding?: string;
  glow?: boolean;
  onClick?: () => void;
}

export function GlassCard({
  children,
  className = '',
  style,
  hover = true,
  delay = 0,
  padding = '16px',
  glow = false,
  onClick,
}: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={hover ? {
        y: -2,
        transition: { duration: 0.2 },
      } : undefined}
      onClick={onClick}
      className={className}
      style={{
        background: 'linear-gradient(145deg, #141414 0%, #0e0e0e 100%)',
        border: '1px solid rgba(255, 215, 0, 0.06)',
        borderRadius: '14px',
        padding,
        boxShadow: glow
          ? '0 2px 8px rgba(0,0,0,0.3), 0 0 16px rgba(255,215,0,0.04), inset 0 1px 0 rgba(255,255,255,0.02)'
          : '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.02)',
        cursor: onClick ? 'pointer' : undefined,
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}
