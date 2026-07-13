import React from 'react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusConfigs: Record<string, { color: string; label: string; icon: string }> = {
  submitted: {
    color: 'bg-blue-100 text-blue-700 border-blue-200 shadow-blue-200',
    label: 'Submitted',
    icon: '📩',
  },
  'in_progress': {
    color: 'bg-amber-100 text-amber-700 border-amber-200 shadow-amber-200',
    label: 'In Progress',
    icon: '⚙️',
  },
  completed: {
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200 shadow-emerald-200',
    label: 'Completed',
    icon: '✅',
  },
  cancelled: {
    color: 'bg-slate-100 text-slate-700 border-slate-200 shadow-slate-200',
    label: 'Cancelled',
    icon: '❌',
  },
};

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const config = statusConfigs[status.toLowerCase()] || statusConfigs.submitted;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border shadow-sm',
        config.color,
        className
      )}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </motion.div>
  );
};
