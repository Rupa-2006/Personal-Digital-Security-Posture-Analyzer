import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  variant?: 'default' | 'cyan' | 'purple' | 'red' | 'warning';
  className?: string;
  delay?: number;
}

const borderMap = {
  default: 'neon-border',
  cyan: 'neon-border-cyan',
  purple: 'neon-border-purple',
  red: 'neon-border-red',
  warning: 'neon-border-red',
};

export default function GlowCard({ children, variant = 'default', className = '', delay = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`glass-card rounded-lg border p-5 ${borderMap[variant]} ${className}`}
    >
      {children}
    </motion.div>
  );
}
