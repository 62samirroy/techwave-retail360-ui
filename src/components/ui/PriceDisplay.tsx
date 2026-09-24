import React from 'react';
import { formatPrice, getDiscountPercentage } from '@/lib/utils';
import { cn } from '@/lib/utils';

export interface PriceDisplayProps {
  price?: number;
  amount?: number;
  discountPrice?: number | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PriceDisplay({
  price,
  amount,
  discountPrice,
  size = 'md',
  className,
}: PriceDisplayProps) {
  const actualPrice = (price !== undefined ? price : amount) || 0;
  const hasDiscount = discountPrice && discountPrice < actualPrice;
  const currentPrice = hasDiscount ? discountPrice : actualPrice;
  const discountPercent = hasDiscount ? getDiscountPercentage(actualPrice, discountPrice) : 0;

  const fontSizes = {
    sm: 'text-xs font-semibold',
    md: 'text-sm font-semibold',
    lg: 'text-base font-bold',
  };

  return (
    <div className={cn('flex items-center gap-1.5 flex-wrap', className)}>
      <span className={cn('text-brand-900 tracking-tight', fontSizes[size])}>
        {formatPrice(currentPrice)}
      </span>
      {hasDiscount && (
        <>
          <span className="text-xs text-brand-400 line-through">
            {formatPrice(actualPrice)}
          </span>
          <span className="text-[10px] font-bold text-royal-700 bg-royal-100/80 px-1.5 py-0.5 rounded">
            {discountPercent}% OFF
          </span>
        </>
      )}
    </div>
  );
}
