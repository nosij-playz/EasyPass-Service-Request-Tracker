import React from 'react';

interface LoadingSkeletonProps {
  className?: string;
}

export const LoadingSkeleton = ({ className }: LoadingSkeletonProps) => {
  return (
    <div
      className={cn(
        "animate-pulse bg-slate-200 rounded-xl",
        className
      )}
    />
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
