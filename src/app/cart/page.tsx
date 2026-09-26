'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Trash2,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { api } from '@/lib/api';
import { CartData } from '@/types';
import { formatPrice } from '@/lib/utils';
import { APP_CONFIG } from '@/lib/constants';

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');

  const fetchCart = async () => {
    try {
      const res = await api.getCart();
      if (res.success && res.data) {
        setCart(res.data);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    setUpdatingId(itemId);
    try {
      const res = await api.updateCartItem(itemId, newQuantity);
      if (res.success) {
        await fetchCart();
        window.dispatchEvent(new Event('cart-updated'));
      } else {
        alert(res.message);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    setUpdatingId(itemId);
    try {
      const res = await api.removeCartItem(itemId);
      if (res.success) {
        await fetchCart();
        window.dispatchEvent(new Event('cart-updated'));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleClearCart = async () => {
    if (!confirm('Are you sure you want to empty your cart?')) return;
    try {
      await api.clearCart();
      await fetchCart();
      window.dispatchEvent(new Event('cart-updated'));
    } catch (e) {
      console.error(e);
    }
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    if (couponCode.toUpperCase().trim() === 'FESTIVE10' || couponCode.toUpperCase().trim() === 'ROYAL500') {
      setCouponApplied(true);
    } else {
      setCouponError('Invalid coupon. Try "FESTIVE10" or "ROYAL500".');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-stone-200 rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-4 p-4 rounded-2xl border border-stone-200 bg-white">
                <div className="h-24 w-20 rounded-xl bg-stone-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-stone-200" />
                  <div className="h-3 w-1/4 rounded bg-stone-100" />
                  <div className="h-5 w-24 rounded bg-stone-200 mt-2" />
                </div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-4 h-64 rounded-2xl border border-stone-200 bg-white p-6 space-y-3">
            <div className="h-5 w-32 rounded bg-stone-200" />
            <div className="h-3 w-full rounded bg-stone-100" />
            <div className="h-10 w-full rounded-xl bg-stone-200 mt-4" />
          </div>
        </div>
      </div>
    );
  }

  const items = cart?.items || [];
  const isEmpty = items.length === 0;

  const promoDiscount = couponApplied ? (couponCode.toUpperCase() === 'ROYAL500' ? 500 : Math.round((cart?.subtotal || 0) * 0.1)) : 0;
  const grandTotalWithPromo = Math.max(0, (cart?.grandTotal || 0) - promoDiscount);

  return (
    <div className="min-h-[75vh] max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 flex flex-col">
      <div className="flex items-center justify-between border-b border-stone-200 pb-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#540924]">
            Shopping Bag
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            {isEmpty ? 'Your bag is empty' : `${cart?.itemCount || 0} authentic sarees ready for checkout`}
          </p>
        </div>

        {!isEmpty && (
          <button
            onClick={handleClearCart}
            className="text-xs text-rose-600 hover:text-rose-700 font-semibold"
          >
            Clear Bag
          </button>
        )}
      </div>

      {isEmpty ? (
        <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-12 text-center max-w-lg mx-auto space-y-4 shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-[#540924] mx-auto border border-rose-100">
            <ShoppingBag className="w-7 h-7 text-[#540924]" />
          </div>
          <div>
            <h2 className="text-base font-serif font-bold text-stone-900">Your shopping bag is currently empty</h2>
            <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">Discover handcrafted silks, brocades, and festive designer sarees.</p>
          </div>
          <Link href="/shop" className="inline-block pt-2">
            <button className="rounded-full bg-[#540924] hover:bg-[#3d0517] text-white px-7 py-3 text-xs font-semibold shadow-sm transition-all">
              Start Shopping Sarees
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Items List */}
          <div className="lg:col-span-8 space-y-4">
            {/* Free Shipping Progress Indicator */}
            {cart && (
              <div className="rounded-2xl border border-[#d4af37]/30 bg-[#fdfbf7] p-3.5 text-xs shadow-xs">
                {cart.freeShippingRemaining > 0 ? (
                  <div className="space-y-1.5">
                    <p className="text-[#540924] font-medium flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-[#b48325]" />
                      <span>Add <strong className="text-[#540924]">{formatPrice(cart.freeShippingRemaining)}</strong> more for <strong className="text-[#b48325]">FREE Express Insured Shipping</strong>!</span>
                    </p>
                    <div className="h-2 w-full bg-stone-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#b48325] to-[#d4af37] transition-all duration-300"
                        style={{
                          width: `${Math.min(100, (cart.subtotal / cart.freeShippingThreshold) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-[#540924] font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#b48325]" />
                    <span>Congratulations! You have qualified for <strong>FREE Insured Express Shipping</strong>!</span>
                  </p>
                )}
              </div>
            )}

            {/* Cart Table / Cards */}
            <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-xs divide-y divide-stone-100">
              {items.map((item) => (
                <div key={item.id} className="p-4 flex gap-4 items-center">
                  {/* Thumbnail */}
                  <div className="relative h-20 w-16 shrink-0 rounded-xl overflow-hidden border border-stone-200 bg-stone-100">
                    <Image
                      src={item.product.images?.[0]?.url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'}
                      alt={item.product.name}
                      fill
                      className="object-cover object-top"
                    />
                  </div>

                  {/* Title & SKU */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/product/${item.product.id}`}
                      className="text-xs sm:text-sm font-serif font-bold text-stone-900 hover:text-[#540924] line-clamp-1 transition-colors"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-[10px] text-stone-400 font-mono mt-0.5">
                      SKU: {item.product.sku} • {item.product.category?.name || 'Saree'}
                    </p>
                    <p className="text-xs font-bold text-[#540924] mt-1">
                      {formatPrice(item.price)}
                    </p>
                  </div>

                  {/* Quantity Controller with Stock Cap */}
                  <div className="flex items-center rounded-xl border border-stone-300 bg-white shrink-0 shadow-2xs">
                    <button
                      disabled={item.quantity <= 1 || updatingId === item.id}
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      className="px-2.5 py-1 text-xs font-bold text-stone-600 hover:bg-stone-50 disabled:opacity-40"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-xs font-semibold text-stone-900 border-x border-stone-200">
                      {item.quantity}
                    </span>
                    <button
                      disabled={item.quantity >= item.product.stock || updatingId === item.id}
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      className="px-2.5 py-1 text-xs font-bold text-stone-600 hover:bg-stone-50 disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>

                  {/* Item Total */}
                  <div className="text-right shrink-0 w-20">
                    <p className="text-xs sm:text-sm font-bold text-stone-900">
                      {formatPrice(item.itemTotal)}
                    </p>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={updatingId === item.id}
                    title="Remove item"
                    className="text-stone-400 hover:text-rose-600 p-1.5 transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center text-xs text-stone-600 pt-2">
              <Link href="/shop" className="hover:text-[#540924] flex items-center gap-1 font-semibold">
                ← Continue Browsing Sarees
              </Link>
            </div>
          </div>

          {/* Order Summary Checkout Card */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-xs space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#540924] font-serif border-b border-stone-100 pb-2">
                Order Summary
              </h2>

              {/* Promo Code Input */}
              <div>
                <form onSubmit={handleApplyCoupon} className="flex gap-1.5">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Coupon (e.g. FESTIVE10)"
                    disabled={couponApplied}
                    className="flex-1 rounded-xl border border-stone-300 px-3 py-1.5 text-xs text-stone-900 uppercase focus:outline-none focus:ring-1 focus:ring-[#540924]"
                  />
                  <button
                    type="submit"
                    disabled={couponApplied || !couponCode.trim()}
                    className="rounded-xl bg-[#540924] hover:bg-[#3d0517] text-white px-3.5 py-1.5 text-xs font-semibold transition-all disabled:opacity-50"
                  >
                    {couponApplied ? 'Applied' : 'Apply'}
                  </button>
                </form>
                {couponApplied && (
                  <p className="text-[11px] text-[#540924] font-medium mt-1">
                    ✓ Promo applied! Discount of {formatPrice(promoDiscount)} applied.
                  </p>
                )}
                {couponError && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1">{couponError}</p>
                )}
              </div>

              {/* Cost Breakdown */}
              <div className="space-y-2 text-xs border-t border-stone-100 pt-3">
                <div className="flex justify-between text-stone-600">
                  <span>Bag Subtotal</span>
                  <span className="font-semibold text-stone-900">{formatPrice(cart?.subtotal)}</span>
                </div>

                {couponApplied && (
                  <div className="flex justify-between text-[#540924] font-medium">
                    <span>Festive Discount</span>
                    <span>- {formatPrice(promoDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-stone-600">
                  <span>Standard Shipping</span>
                  <span>{cart?.shippingFee === 0 ? <strong className="text-[#540924]">FREE</strong> : formatPrice(cart?.shippingFee)}</span>
                </div>

                <div className="flex justify-between text-stone-600">
                  <span>Applicable GST (5%)</span>
                  <span>{formatPrice(cart?.tax)}</span>
                </div>

                <div className="flex justify-between text-base font-bold text-stone-900 border-t border-stone-200 pt-3">
                  <span>Grand Total</span>
                  <span className="text-[#540924]">{formatPrice(grandTotalWithPromo)}</span>
                </div>
              </div>

              {/* Checkout CTA Button */}
              <Link href="/checkout" className="block pt-1">
                <button className="w-full rounded-full bg-[#540924] hover:bg-[#3d0517] text-white py-3.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all">
                  <span>Proceed to Secure Checkout</span>
                  <ArrowRight className="w-4 h-4 text-[#d4af37]" />
                </button>
              </Link>

              {/* Security Badges */}
              <div className="pt-2 text-center text-[10px] text-stone-400 space-y-1">
                <p className="flex items-center justify-center gap-1 font-medium text-stone-600">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Razorpay 256-Bit SSL Encrypted Checkout</span>
                </p>
                <p>Support for UPI, NetBanking, Credit &amp; Debit Cards</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
