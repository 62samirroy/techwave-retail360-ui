import React from 'react';
import { cn } from '@/lib/utils';
import { PackageOpen, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export function LoadingSpinner({
  className,
  message,
}: {
  className?: string;
  message?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-10 gap-2', className)}>
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-200 border-t-primary-600" />
      {message && <p className="text-xs text-brand-500 font-mono">{message}</p>}
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="relative flex flex-col overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-xs animate-pulse">
          <div className="relative aspect-[3/4.2] w-full bg-stone-200/70 overflow-hidden">
            <div className="absolute top-2.5 left-2.5 h-4 w-16 rounded-full bg-stone-300/80" />
            <div className="absolute top-2.5 right-2.5 h-8 w-8 rounded-full bg-stone-300/80" />
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          </div>
          <div className="flex flex-1 flex-col p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="h-2.5 w-20 rounded bg-stone-200" />
              <div className="h-3 w-8 rounded bg-stone-200" />
            </div>
            <div className="h-3.5 w-4/5 rounded bg-stone-200" />
            <div className="h-2.5 w-16 rounded bg-stone-100" />
            <div className="mt-auto pt-2.5 border-t border-stone-100 flex items-center justify-between">
              <div className="h-3.5 w-14 rounded bg-stone-200" />
              <div className="h-6 w-16 rounded-xl bg-stone-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({
  title = 'No items found',
  description = 'Try changing your search terms or filters.',
  icon,
  action,
}: {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-brand-200 bg-brand-50/50 p-8 text-center my-4">
      <div className="rounded-full bg-white p-2.5 shadow-subtle border border-brand-200 text-brand-400 mb-3">
        {icon || <PackageOpen className="w-5 h-5 text-brand-500" />}
      </div>
      <h4 className="text-xs font-semibold text-brand-800 uppercase tracking-wide">{title}</h4>
      <p className="text-xs text-brand-500 max-w-sm mt-1 mb-4">{description}</p>
      {action && (
        <Button variant="outline" size="xs" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

export function ErrorState({
  message = 'An unexpected error occurred.',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-rose-200 bg-rose-50/40 p-6 text-center my-4">
      <AlertCircle className="w-5 h-5 text-rose-500 mb-2" />
      <p className="text-xs font-medium text-rose-900 mb-3">{message}</p>
      {onRetry && (
        <Button variant="outline" size="xs" onClick={onRetry} icon={<RefreshCw className="w-3 h-3" />}>
          Try Again
        </Button>
      )}
    </div>
  );
}
