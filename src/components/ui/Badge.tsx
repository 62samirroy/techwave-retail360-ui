import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'royal' | 'success' | 'danger' | 'warning' | 'outline';
  size?: 'xs' | 'sm';
}

export function Badge({
  className,
  variant = 'default',
  size = 'xs',
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default: 'bg-brand-100 text-brand-700 border-brand-200',
    primary: 'bg-primary-50 text-primary-700 border-primary-200',
    royal: 'bg-royal-50 text-royal-800 border-royal-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    outline: 'bg-transparent text-brand-600 border-brand-300',
  };

  const sizes = {
    xs: 'text-[10px] px-1.5 py-0.5 font-medium',
    sm: 'text-xs px-2 py-0.5 font-medium',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded border font-medium uppercase tracking-wider',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
