import React from 'react';
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function OrderStatusBadge({ status }: { status: string }) {
  const item = ORDER_STATUS_LABELS[status] || {
    label: status,
    color: 'bg-brand-100 text-brand-700 border-brand-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium border',
        item.color
      )}
    >
      {item.label}
    </span>
  );
}

export const StatusBadge = OrderStatusBadge;

export function PaymentStatusBadge({ status }: { status: string }) {
  const item = PAYMENT_STATUS_LABELS[status] || {
    label: status,
    color: 'bg-brand-100 text-brand-700 border-brand-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium border',
        item.color
      )}
    >
      {item.label}
    </span>
  );
}
