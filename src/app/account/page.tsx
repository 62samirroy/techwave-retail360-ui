'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  ShoppingBag,
  Heart,
  MapPin,
  LogOut,
  Package,
  ArrowRight,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/ui/StatusBadge';
import { api } from '@/lib/api';
import { OrderData, UserSession } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';

export default function AccountPage() {
  const router = useRouter();

  const [user, setUser] = useState<UserSession | null>(null);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'wishlist'>('orders');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAccountData() {
      try {
        const meRes = await api.getMe();
        if (!meRes.success || !meRes.data?.user) {
          router.push('/login');
          return;
        }
        setUser(meRes.data.user);

        const [orderRes, wishRes] = await Promise.all([
          api.getOrders(),
          api.getWishlist(),
        ]);

        if (orderRes.success && orderRes.data?.orders) {
          setOrders(orderRes.data.orders);
        }

        if (wishRes.success && wishRes.data) {
          setWishlist(wishRes.data);
        }
      } catch (err) {
        console.error('Account load error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAccountData();
  }, [router]);

  const handleLogout = async () => {
    await api.logout();
    window.dispatchEvent(new Event('auth-updated'));
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Profile Card */}
      <div className="rounded-xl border border-brand-200 bg-white p-5 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-800 font-bold text-lg">
            {user?.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-brand-950">{user?.name}</h1>
              <span className="rounded bg-brand-100 text-brand-700 text-[10px] font-semibold px-2 py-0.5">
                {user?.role}
              </span>
            </div>
            <p className="text-xs text-brand-500">{user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {user?.role === 'ADMIN' && (
            <Link href="/admin">
              <Button variant="gold" size="xs" className="gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Portal</span>
              </Button>
            </Link>
          )}

          <Button variant="outline" size="xs" onClick={handleLogout} className="text-rose-600 gap-1">
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3 space-y-1">
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-semibold transition-colors ${
              activeTab === 'orders'
                ? 'bg-primary-600 text-white'
                : 'text-brand-700 hover:bg-brand-100'
            }`}
          >
            <span className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              <span>My Orders</span>
            </span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-mono">
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('wishlist')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-semibold transition-colors ${
              activeTab === 'wishlist'
                ? 'bg-primary-600 text-white'
                : 'text-brand-700 hover:bg-brand-100'
            }`}
          >
            <span className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              <span>Saved Wishlist</span>
            </span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-mono">
              {wishlist.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs font-semibold transition-colors ${
              activeTab === 'profile'
                ? 'bg-primary-600 text-white'
                : 'text-brand-700 hover:bg-brand-100'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile & Addresses</span>
          </button>
        </div>

        {/* Tab Content Panes */}
        <div className="lg:col-span-9">
          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-brand-900 border-b border-brand-200 pb-2">
                Order History & Status
              </h2>

              {orders.length > 0 ? (
                <div className="space-y-3">
                  {orders.map((o) => (
                    <div
                      key={o.id}
                      className="rounded-lg border border-brand-200 bg-white p-4 shadow-subtle space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-100 pb-2.5 text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-brand-950 font-mono text-sm">
                              #{o.orderNumber}
                            </span>
                            <OrderStatusBadge status={o.status} />
                            <PaymentStatusBadge status={o.paymentStatus} />
                          </div>
                          <p className="text-[11px] text-brand-400 mt-0.5">
                            Placed on {formatDate(o.createdAt)}
                          </p>
                        </div>
                        <span className="font-bold text-brand-950 text-sm">
                          {formatPrice(o.total)}
                        </span>
                      </div>

                      {/* Items */}
                      <div className="space-y-1 text-xs text-brand-700">
                        {o.items?.map((it) => (
                          <div key={it.id} className="flex justify-between items-center py-1">
                            <span className="truncate max-w-[80%] font-medium">
                              {it.quantity} × {it.productName}
                            </span>
                            <span className="text-brand-500 font-mono">{formatPrice(it.total)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Card Actions */}
                      <div className="pt-2 border-t border-brand-100 flex items-center justify-between text-xs">
                        <span className="text-brand-500 text-[11px]">
                          Destination: {o.city}, {o.state}
                        </span>
                        <Link href={`/track-order?orderId=${o.orderNumber}`}>
                          <Button variant="outline" size="xs" className="gap-1">
                            <span>Track Order</span>
                            <ArrowRight className="w-3 h-3" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-brand-200 bg-brand-50/50 p-8 text-center text-xs space-y-2">
                  <Package className="w-6 h-6 text-brand-400 mx-auto" />
                  <p className="font-semibold text-brand-800">You haven&apos;t placed any orders yet.</p>
                  <Link href="/shop">
                    <Button variant="primary" size="xs">
                      Explore Sarees
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* WISHLIST TAB */}
          {activeTab === 'wishlist' && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-brand-900 border-b border-brand-200 pb-2">
                Saved Sarees ({wishlist.length})
              </h2>

              {wishlist.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {wishlist.map((it) => (
                    <div
                      key={it.id}
                      className="rounded-lg border border-brand-200 bg-white p-3 flex gap-3 items-center shadow-2xs"
                    >
                      <div className="relative h-16 w-14 rounded overflow-hidden bg-brand-100 shrink-0">
                        {it.product?.images?.[0]?.url && (
                          <img
                            src={it.product.images[0].url}
                            alt={it.product.name}
                            className="object-cover h-full w-full"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/product/${it.product.id}`}
                          className="text-xs font-semibold text-brand-900 hover:text-primary-700 truncate block"
                        >
                          {it.product.name}
                        </Link>
                        <p className="text-xs font-bold text-primary-700 mt-1">
                          {formatPrice(it.product.discountPrice || it.product.price)}
                        </p>
                      </div>
                      <Link href={`/product/${it.product.id}`}>
                        <Button variant="primary" size="xs">
                          View
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-brand-200 bg-brand-50/50 p-8 text-center text-xs space-y-2">
                  <Heart className="w-6 h-6 text-brand-400 mx-auto" />
                  <p className="font-semibold text-brand-800">Your wishlist is currently empty.</p>
                  <Link href="/shop">
                    <Button variant="outline" size="xs">
                      Discover Handlooms
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="rounded-lg border border-brand-200 bg-white p-5 shadow-subtle space-y-4 text-xs">
              <h2 className="text-sm font-bold uppercase tracking-wider text-brand-900 border-b border-brand-200 pb-2">
                Personal Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="font-semibold text-brand-700">Full Name</span>
                  <p className="text-brand-900 mt-0.5">{user?.name}</p>
                </div>
                <div>
                  <span className="font-semibold text-brand-700">Email Address</span>
                  <p className="text-brand-900 mt-0.5">{user?.email}</p>
                </div>
                <div>
                  <span className="font-semibold text-brand-700">Phone Number</span>
                  <p className="text-brand-900 mt-0.5">{user?.phone || 'Not provided'}</p>
                </div>
                <div>
                  <span className="font-semibold text-brand-700">Account Role</span>
                  <p className="text-brand-900 mt-0.5">{user?.role}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
