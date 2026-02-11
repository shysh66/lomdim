import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
  showLabel?: boolean;
  color?: 'blue' | 'green' | 'yellow' | 'purple';
}

export const ProgressBar = ({
  value,
  max,
  className,
  showLabel = false,
  color = 'blue',
}: ProgressBarProps) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
  };

  return (
    <div className={cn('w-full', className)}>
      <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={cn('h-full rounded-full', colors[color])}
        />
      </div>
      {showLabel && (
        <p className="text-sm text-gray-600 mt-1 text-center">
          {value} / {max}
        </p>
      )}
    </div>
  );
};
