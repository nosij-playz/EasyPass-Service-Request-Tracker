import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface GradientButtonProps extends HTMLMotionProps<'button'> {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  isLoading?: boolean;
}

export const GradientButton = ({
  children,
  className,
  variant = 'primary',
  isLoading,
  ...props
}: GradientButtonProps) => {
  const variants = {
    primary: 'gradient-button shadow-primary',
    secondary: 'bg-slate-200 text-slate-800 hover:bg-slate-300 shadow-sm',
    danger: 'bg-gradient-to-r from-red-500 to-pink-600 text-white hover:shadow-danger',
    success: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-success',
    ghost: 'bg-transparent border border-slate-200 text-slate-600 hover:bg-slate-50',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'relative px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2',
        variants[variant],
        className
      )}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        children
      )}
    </motion.button>
  );
};
