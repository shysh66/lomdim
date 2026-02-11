import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'game' | 'zone-a' | 'zone-b';
}

export const Card = ({ children, className, onClick, variant = 'default' }: CardProps) => {
  const variants = {
    default: 'bg-white shadow-lg',
    game: 'bg-white shadow-xl hover:shadow-2xl',
    'zone-a': 'bg-gradient-to-br from-yellow-100 to-orange-100 shadow-lg',
    'zone-b': 'bg-gradient-to-br from-purple-100 to-blue-100 shadow-lg',
  };

  return (
    <motion.div
      whileHover={onClick ? { scale: 1.02, y: -4 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      className={cn(
        'rounded-3xl p-6',
        variants[variant],
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};
