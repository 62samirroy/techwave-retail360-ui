'use client';

import React from 'react';

export function ProductCardSkeleton() {
  return (
    <div className="relative flex flex-col overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-xs animate-pulse">
      {/* Saree Image Frame Skeleton */}
      <div className="relative aspect-[3/4.2] w-full bg-gradient-to-b from-stone-100 to-stone-200/70 overflow-hidden">
        {/* Top Badges Skeleton */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          <div className="h-4 w-20 rounded-full bg-stone-300/70" />
        </div>

        {/* Top-Right Action Buttons Skeleton */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5">
          <div className="h-8 w-8 rounded-full bg-stone-300/70 shadow-xs" />
          <div className="h-8 w-8 rounded-full bg-stone-300/70 shadow-xs" />
        </div>

        {/* Shimmer sweep effect */}
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      </div>

      {/* Details Body Skeleton */}
      <div className="flex flex-1 flex-col p-4 space-y-2.5">
        {/* Category & Rating */}
        <div className="flex items-center justify-between">
          <div className="h-3 w-24 rounded bg-stone-200" />
          <div className="h-3.5 w-10 rounded bg-stone-200" />
        </div>

        {/* Title */}
        <div className="space-y-1.5 pt-0.5">
          <div className="h-4 w-5/6 rounded bg-stone-200" />
          <div className="h-3.5 w-3/5 rounded bg-stone-200" />
        </div>

        {/* SKU Meta */}
        <div className="h-2.5 w-20 rounded bg-stone-100" />

        {/* Price & Add to Bag */}
        <div className="mt-auto pt-3 border-t border-stone-100 flex items-center justify-between">
          <div className="space-y-1">
            <div className="h-4 w-16 rounded bg-stone-200" />
            <div className="h-2.5 w-12 rounded bg-stone-100" />
          </div>
          <div className="h-7 w-20 rounded-full bg-stone-200" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
