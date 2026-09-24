import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gold';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  leftIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'sm',
      isLoading = false,
      icon,
      leftIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

    const variants = {
      primary:
        'bg-primary-600 hover:bg-primary-700 text-white shadow-sm hover:shadow focus:ring-primary-500',
      secondary:
        'bg-brand-100 hover:bg-brand-200 text-brand-800 border border-brand-200 focus:ring-brand-400',
      outline:
        'border border-brand-300 hover:border-brand-400 bg-white hover:bg-brand-50 text-brand-700 focus:ring-brand-300 shadow-sm',
      ghost:
        'text-brand-600 hover:bg-brand-100/70 hover:text-brand-900 focus:ring-brand-300',
      danger:
        'bg-rose-600 hover:bg-rose-700 text-white shadow-sm focus:ring-rose-500',
      gold:
        'bg-royal-600 hover:bg-royal-700 text-white shadow-sm hover:shadow focus:ring-royal-500',
    };

    const sizes = {
      xs: 'text-xs px-2.5 py-1 gap-1.5 h-7',
      sm: 'text-xs font-medium px-3 py-1.5 gap-1.5 h-8',
      md: 'text-sm font-medium px-4 py-2 gap-2 h-9',
      lg: 'text-sm font-medium px-5 py-2.5 gap-2 h-10',
    };

    const displayedIcon = icon || leftIcon;

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : displayedIcon ? (
          <span className="shrink-0">{displayedIcon}</span>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
