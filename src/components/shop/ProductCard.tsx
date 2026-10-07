'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Heart, MessageCircle, Check, Star, Loader2 } from 'lucide-react';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { Badge } from '@/components/ui/Badge';
import { cn, buildWhatsAppLink, formatImageUrl } from '@/lib/utils';
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

export const ProductCard = React.memo(function ProductCard({
  product,
  onAddToCart,
  onWishlistToggle,
}: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const categoryName =
    typeof product.category === 'object' ? product.category?.name : product.category || 'Handloom Silk';

  const primaryImage = formatImageUrl(
    product.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600'
  );

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 4;

  // Calculate discount percentage if discountPrice is provided
  const discountPercent =
    product.discountPrice && product.price > product.discountPrice
      ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
      : null;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock || isAdding || justAdded) return;

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
      setTimeout(() => setJustAdded(false), 2000);
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

  const waMessage = `Namaste Royal Saree & Family team, I am interested in: ${product.name}. Can you share fabric details & draping photos?`;
  const whatsappUrl = buildWhatsAppLink(waMessage);

  return (
    <div className="h-full group relative flex flex-col overflow-hidden rounded-2xl border border-stone-200/90 bg-white transition-all duration-300 hover:border-[#540924]/50 hover:shadow-[0_16px_36px_rgba(84,9,36,0.14)] hover:-translate-y-1">
      {/* Product Image Frame */}
      <div className="relative aspect-[3/4.2] w-full overflow-hidden bg-stone-100">
        <Link href={`/product/${product.id}`} className="block h-full w-full">
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-106"
          />
        </Link>

        {/* Subtle Dark Gradient Overlay on Hover */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-stone-950/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Top-Left Status & Craft Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {product.isBestseller && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#540924]/95 backdrop-blur-xs text-[#d4af37] border border-[#d4af37]/40 px-2.5 py-0.5 text-[9.5px] font-bold tracking-wider uppercase shadow-xs">
              <span>★</span> Bestseller
            </span>
          )}
          {discountPercent && (
            <span className="inline-flex items-center rounded-full bg-[#b48325] text-white font-bold px-2 py-0.5 text-[9.5px] tracking-wide shadow-xs">
              {discountPercent}% OFF
            </span>
          )}
          {product.isFeatured && !product.isBestseller && (
            <span className="rounded-full bg-[#540924] text-[#fbf6ec] border border-[#d4af37]/30 px-2.5 py-0.5 text-[9px] font-bold tracking-wider uppercase shadow-xs">
              Heritage Edit
            </span>
          )}
          {isLowStock && (
            <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[9px] font-bold text-white tracking-wider uppercase shadow-xs">
              Only {product.stock} Left
            </span>
          )}
          {isOutOfStock && (
            <span className="rounded-full bg-stone-900/90 text-stone-200 px-2.5 py-0.5 text-[9px] font-bold tracking-wider uppercase shadow-xs">
              Sold Out
            </span>
          )}
        </div>

        {/* Top-Right Floating Actions: Wishlist & WhatsApp (Inquiry hidden until hover) */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-10">
          <button
            onClick={handleWishlist}
            aria-label="Save to wishlist"
            title="Save to Wishlist"
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow-md backdrop-blur-md transition-all hover:bg-white hover:scale-105 active:scale-90',
              isWishlisted ? 'text-rose-600' : 'text-stone-500 hover:text-rose-600'
            )}
          >
            <Heart className={cn('h-3.5 w-3.5 transition-transform', isWishlisted && 'fill-rose-600 scale-110')} />
          </button>
          
          {/* WhatsApp Inquiry button: Hidden by default, visible only on hover */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Inquire on WhatsApp"
            title="Inquire with Saree Stylist"
            onClick={(e) => e.stopPropagation()}
            className="opacity-0 group-hover:opacity-100 flex h-8 w-8 items-center justify-center rounded-full bg-[#540924] text-[#d4af37] shadow-md hover:bg-[#3d0517] hover:scale-105 active:scale-90 transition-all duration-200 border border-[#d4af37]/30"
          >
            <MessageCircle className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {/* Card Details Body (Clean & Minimal: Category, Rating, Title, Price & Hover Add) */}
      <div className="flex flex-1 flex-col p-3 sm:p-3.5">
        {/* Category & Star Rating */}
        <div className="flex items-center justify-between text-[11px] mb-1">
          <span className="text-[10px] uppercase tracking-widest font-semibold text-[#b48325] truncate max-w-[70%]">
            {categoryName}
          </span>
          <div className="flex items-center gap-1 font-semibold text-[10.5px] text-stone-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{product.rating ? Number(product.rating).toFixed(1) : '5.0'}</span>
          </div>
        </div>

        {/* Product Title */}
        <Link href={`/product/${product.id}`} className="group-hover:text-[#540924] transition-colors mb-2">
          <h3 className="line-clamp-1 text-sm font-serif font-bold text-stone-900 leading-snug">
            {product.name}
          </h3>
        </Link>

        {/* Bottom Price and Add-To-Bag Action Bar */}
        <div className="mt-auto flex items-center justify-between gap-2 pt-2 border-t border-stone-100 min-h-[36px]">
          <div>
            <PriceDisplay
              price={product.price}
              discountPrice={product.discountPrice}
              size="sm"
            />
          </div>

          {/* Add Button: Slides in from left to right on card hover */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAdding || justAdded}
            className={cn(
              'inline-flex items-center justify-center rounded-xl px-3 py-1.5 text-xs font-semibold tracking-wide shadow-xs transition-all duration-300 ease-out shrink-0',
              'opacity-100 sm:opacity-0 sm:-translate-x-3 sm:group-hover:opacity-100 sm:group-hover:translate-x-0',
              justAdded
                ? 'bg-[#540924] text-white shadow-[#540924]/20 !opacity-100 !translate-x-0'
                : isAdding
                ? 'bg-[#3d0517] text-white cursor-wait !opacity-100 !translate-x-0'
                : isOutOfStock
                ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                : 'bg-[#540924] hover:bg-[#3d0517] text-white hover:shadow-md active:scale-95 border border-[#d4af37]/30'
            )}
          >
            {isAdding ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin text-[#d4af37]" />
                <span>Adding...</span>
              </>
            ) : justAdded ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1 stroke-[2.5]" /> Added
              </>
            ) : isOutOfStock ? (
              'Sold Out'
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 mr-1 text-[#d4af37]" /> Add
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
});
