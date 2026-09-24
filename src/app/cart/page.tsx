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
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  const items = cart?.items || [];
  const isEmpty = items.length === 0;

  const promoDiscount = couponApplied ? (couponCode.toUpperCase() === 'ROYAL500' ? 500 : Math.round((cart?.subtotal || 0) * 0.1)) : 0;
  const grandTotalWithPromo = Math.max(0, (cart?.grandTotal || 0) - promoDiscount);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex items-center justify-between border-b border-brand-200 pb-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-brand-950">
            Shopping Cart
          </h1>
          <p className="text-xs text-brand-500">
            {isEmpty ? 'Your bag is empty' : `${cart?.itemCount || 0} authentic sarees ready for checkout`}
          </p>
        </div>

        {!isEmpty && (
          <button
            onClick={handleClearCart}
            className="text-xs text-rose-600 hover:text-rose-700 font-medium"
          >
            Clear Cart
          </button>
        )}
      </div>

      {isEmpty ? (
        <div className="rounded-lg border border-dashed border-brand-200 bg-brand-50/50 p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm border border-brand-200 mx-auto text-brand-400">
            <ShoppingBag className="w-6 h-6 text-brand-500" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-brand-900">Your shopping cart is currently empty</h2>
            <p className="text-xs text-brand-500 mt-1">Discover handcrafted silks, brocades, and festive designer sarees.</p>
          </div>
          <Link href="/shop">
            <Button variant="primary" size="md">
              Start Shopping Sarees
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Items List */}
          <div className="lg:col-span-8 space-y-4">
            {/* Free Shipping Progress Indicator */}
            {cart && (
              <div className="rounded-lg border border-royal-200 bg-royal-50/80 p-3 text-xs">
                {cart.freeShippingRemaining > 0 ? (
                  <div className="space-y-1.5">
                    <p className="text-royal-900 font-medium flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-royal-600" />
                      <span>Add <strong>{formatPrice(cart.freeShippingRemaining)}</strong> more for <strong>FREE Express Shipping</strong>!</span>
                    </p>
                    <div className="h-1.5 w-full bg-royal-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-royal-600 transition-all duration-300"
                        style={{
                          width: `${Math.min(100, (cart.subtotal / cart.freeShippingThreshold) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-emerald-800 font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Congratulations! You have qualified for <strong>FREE Insured Express Shipping</strong>!</span>
                  </p>
                )}
              </div>
            )}

            {/* Cart Table / Cards */}
            <div className="rounded-lg border border-brand-200 bg-white overflow-hidden shadow-subtle divide-y divide-brand-100">
              {items.map((item) => (
                <div key={item.id} className="p-3 sm:p-4 flex gap-3 sm:gap-4 items-center">
                  {/* Thumbnail */}
                  <div className="relative h-20 w-16 shrink-0 rounded overflow-hidden border border-brand-200 bg-brand-100">
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
                      className="text-xs font-semibold text-brand-900 hover:text-primary-700 line-clamp-1"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-[10px] text-brand-400 font-mono mt-0.5">
                      SKU: {item.product.sku} • {item.product.category?.name || 'Saree'}
                    </p>
                    <p className="text-xs font-semibold text-brand-900 mt-1">
                      {formatPrice(item.price)}
                    </p>
                  </div>

                  {/* Quantity Controller with Stock Cap */}
                  <div className="flex items-center rounded border border-brand-300 bg-white shrink-0">
                    <button
                      disabled={item.quantity <= 1 || updatingId === item.id}
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      className="px-2 py-0.5 text-xs font-bold text-brand-600 hover:bg-brand-50 disabled:opacity-40"
                    >
                      -
                    </button>
                    <span className="px-2.5 py-0.5 text-xs font-semibold text-brand-900 border-x border-brand-200">
                      {item.quantity}
                    </span>
                    <button
                      disabled={item.quantity >= item.product.stock || updatingId === item.id}
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      className="px-2 py-0.5 text-xs font-bold text-brand-600 hover:bg-brand-50 disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>

                  {/* Item Total */}
                  <div className="text-right shrink-0 w-20">
                    <p className="text-xs font-bold text-brand-950">
                      {formatPrice(item.itemTotal)}
                    </p>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={updatingId === item.id}
                    title="Remove item"
                    className="text-brand-400 hover:text-rose-600 p-1 transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center text-xs text-brand-600 pt-2">
              <Link href="/shop" className="hover:text-primary-700 flex items-center gap-1 font-medium">
                ← Continue Browsing Sarees
              </Link>
            </div>
          </div>

          {/* Order Summary Checkout Card */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-lg border border-brand-200 bg-white p-4 shadow-subtle space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-brand-900 border-b border-brand-100 pb-2">
                Order Summary
              </h2>

              {/* Promo Code Input */}
              <div>
                <form onSubmit={handleApplyCoupon} className="flex gap-1.5">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Coupon code (e.g. FESTIVE10)"
                    disabled={couponApplied}
                    className="flex-1 rounded-md border border-brand-300 px-2.5 py-1 text-xs text-brand-900 uppercase focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                  <Button
                    type="submit"
                    size="xs"
                    variant={couponApplied ? 'secondary' : 'primary'}
                    disabled={couponApplied || !couponCode.trim()}
                  >
                    {couponApplied ? 'Applied' : 'Apply'}
                  </Button>
                </form>
                {couponApplied && (
                  <p className="text-[11px] text-emerald-700 font-medium mt-1">
                    ✓ Promo applied! Discount of {formatPrice(promoDiscount)} applied.
                  </p>
                )}
                {couponError && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1">{couponError}</p>
                )}
              </div>

              {/* Cost Breakdown */}
              <div className="space-y-2 text-xs border-t border-brand-100 pt-3">
                <div className="flex justify-between text-brand-600">
                  <span>Bag Subtotal</span>
                  <span className="font-semibold text-brand-900">{formatPrice(cart?.subtotal)}</span>
                </div>

                {couponApplied && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Festive Discount</span>
                    <span>- {formatPrice(promoDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-brand-600">
                  <span>Standard Shipping</span>
                  <span>{cart?.shippingFee === 0 ? <strong className="text-emerald-700">FREE</strong> : formatPrice(cart?.shippingFee)}</span>
                </div>

                <div className="flex justify-between text-brand-600">
                  <span>Applicable GST (5%)</span>
                  <span>{formatPrice(cart?.tax)}</span>
                </div>

                <div className="flex justify-between text-sm font-bold text-brand-950 border-t border-brand-200 pt-2">
                  <span>Grand Total</span>
                  <span className="text-primary-700">{formatPrice(grandTotalWithPromo)}</span>
                </div>
              </div>

              {/* Checkout CTA Button */}
              <Link href="/checkout" className="block pt-1">
                <Button variant="primary" size="md" className="w-full gap-2">
                  <span>Proceed to Secure Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>

              {/* Security Badges */}
              <div className="pt-2 text-center text-[10px] text-brand-400 space-y-1">
                <p className="flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Razorpay Test Mode 256-Bit SSL Encrypted</span>
                </p>
                <p>Support for UPI, NetBanking, Credit & Debit Cards</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
