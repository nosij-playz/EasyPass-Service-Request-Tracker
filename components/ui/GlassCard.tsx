import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  variant?: 'light' | 'dark';
}

export const GlassCard = ({
  children,
  className,
  variant = 'light',
  ...props
}: GlassCardProps) => {
  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-3xl p-6',
        variant === 'light' ? 'glass-card' : 'glass-card-dark',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};
