'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Heart, MessageCircle, Check, Star } from 'lucide-react';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { Badge } from '@/components/ui/Badge';
import { cn, buildWhatsAppLink } from '@/lib/utils';
import { api } from '@/lib/api';

export interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    sku: string;
    price: number;
    discountPrice?: number | null;
    stock: number;
    category?: { name: string; slug: string } | string;
    isFeatured?: boolean;
    isBestseller?: boolean;
    rating?: number;
    images?: { url: string; altText?: string | null }[];
  };
  onAddToCart?: (productId: string) => Promise<void>;
  onWishlistToggle?: (productId: string) => Promise<void>;
}

export function ProductCard({ product, onAddToCart, onWishlistToggle }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const categoryName =
    typeof product.category === 'object' ? product.category?.name : product.category || 'Handloom Silk';

  const primaryImage =
    product.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600';

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 4;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock || isAdding) return;

    setIsAdding(true);
    try {
      if (onAddToCart) {
        await onAddToCart(product.id);
      } else {
        const res = await api.addToCart(product.id, 1);
        if (res.success) {
          window.dispatchEvent(new Event('cart-updated'));
        }
      }
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1800);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    try {
      if (onWishlistToggle) {
        await onWishlistToggle(product.id);
      } else {
        await api.toggleWishlist(product.id);
      }
    } catch (err) {
      setIsWishlisted(isWishlisted);
    }
  };

  const waMessage = `Namaste Royal Saree team, I am interested in: ${product.name} (SKU: ${product.sku}). Can you share more details?`;
  const whatsappUrl = buildWhatsAppLink(waMessage);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-brand-200/90 bg-white shadow-subtle hover:border-brand-300 hover:shadow-card transition-all duration-200">
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-brand-100">
        <Link href={`/product/${product.id}`} className="block h-full w-full">
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {product.isBestseller && (
            <Badge variant="royal" size="xs">
              Bestseller
            </Badge>
          )}
          {product.isFeatured && !product.isBestseller && (
            <Badge variant="primary" size="xs">
              Featured
            </Badge>
          )}
          {isLowStock && (
            <span className="rounded bg-rose-600/90 px-1.5 py-0.5 text-[9px] font-semibold text-white tracking-wide uppercase">
              Only {product.stock} left
            </span>
          )}
          {isOutOfStock && (
            <span className="rounded bg-brand-900/90 px-1.5 py-0.5 text-[9px] font-semibold text-white tracking-wide uppercase">
              Sold Out
            </span>
          )}
        </div>

        <div className="absolute top-2 right-2 flex flex-col gap-1.5 z-10">
          <button
            onClick={handleWishlist}
            aria-label="Save to wishlist"
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-colors',
              isWishlisted ? 'text-rose-600' : 'text-brand-500 hover:text-rose-500'
            )}
          >
            <Heart className={cn('h-3.5 w-3.5', isWishlisted && 'fill-rose-600')} />
          </button>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Inquire on WhatsApp"
            onClick={(e) => e.stopPropagation()}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm hover:bg-emerald-600 transition-colors"
          >
            <MessageCircle className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-3">
        <div className="flex items-center justify-between text-[11px] text-brand-500 mb-1">
          <span className="font-medium text-brand-500 truncate max-w-[70%]">
            {categoryName}
          </span>
          <div className="flex items-center gap-0.5 text-royal-600 font-semibold text-[10px]">
            <Star className="w-3 h-3 fill-royal-500 text-royal-500" />
            <span>{product.rating ? Number(product.rating).toFixed(1) : '5.0'}</span>
          </div>
        </div>

        <Link href={`/product/${product.id}`} className="group-hover:text-primary-700 transition-colors">
          <h3 className="line-clamp-1 text-xs font-semibold text-brand-900 leading-tight">
            {product.name}
          </h3>
        </Link>

        <p className="text-[10px] text-brand-400 mt-0.5 mb-2 font-mono">
          SKU: {product.sku}
        </p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-2 border-t border-brand-100">
          <PriceDisplay
            price={product.price}
            discountPrice={product.discountPrice}
            size="sm"
          />

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAdding}
            className={cn(
              'inline-flex items-center justify-center rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-150',
              justAdded
                ? 'bg-emerald-600 text-white'
                : isOutOfStock
                ? 'bg-brand-100 text-brand-400 cursor-not-allowed'
                : 'bg-brand-900 text-white hover:bg-brand-800 active:scale-95'
            )}
          >
            {justAdded ? (
              <>
                <Check className="w-3 h-3 mr-1" /> Added
              </>
            ) : isOutOfStock ? (
              'Sold Out'
            ) : (
              <>
                <ShoppingBag className="w-3 h-3 mr-1" /> Add
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
