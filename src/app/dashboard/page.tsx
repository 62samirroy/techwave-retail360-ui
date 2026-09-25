'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
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
  Clock,
  CheckCircle2,
  Truck,
  ExternalLink,
  Plus,
  Trash2,
  Edit2,
  Bell,
  MessageCircle,
  AlertCircle,
  Key,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/ui/StatusBadge';
import { api } from '@/lib/api';
import { OrderData, UserSession, AddressData, NotificationData } from '@/types';
import { formatPrice, formatDate, buildWhatsAppLink } from '@/lib/utils';
import { APP_CONFIG } from '@/lib/constants';

type TabType =
  | 'overview'
  | 'orders'
  | 'track'
  | 'wishlist'
  | 'addresses'
  | 'profile'
  | 'settings';

function CustomerDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabType) || 'overview';

  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [user, setUser] = useState<UserSession | null>(null);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<AddressData[]>([]);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Selected Order for Details View Modal
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);

  // Tracking state
  const [trackOrderNumber, setTrackOrderNumber] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<OrderData | null>(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackError, setTrackError] = useState('');

  // Address modal state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressFormData, setAddressFormData] = useState({
    name: '',
    phone: '',
    streetAddress: '',
    city: '',
    state: '',
    pinCode: '',
    country: 'India',
    isDefault: false,
  });
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressError, setAddressError] = useState('');

  // Profile edit state
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    bio: '',
    avatarUrl: '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Action loading states
  const [movingWishlistId, setMovingWishlistId] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const meRes = await api.getMe();
        if (!meRes.success || !meRes.data?.user) {
          router.push('/login?redirect=/dashboard');
          return;
        }

        const currentUser = meRes.data.user;
        setUser(currentUser);
        setProfileForm({
          name: currentUser.name || '',
          phone: currentUser.phone || '',
          bio: currentUser.bio || '',
          avatarUrl: currentUser.avatarUrl || '',
        });

        // Parallel load of customer data
        const [ordersRes, wishRes, addrRes, notifRes] = await Promise.all([
          api.getOrders(),
          api.getWishlist(),
          api.getAddresses(),
          api.getNotifications(),
        ]);

        if (ordersRes.success && ordersRes.data?.orders) {
          setOrders(ordersRes.data.orders);
          if (ordersRes.data.orders.length > 0) {
            setTrackOrderNumber(ordersRes.data.orders[0].orderNumber);
            setTrackedOrder(ordersRes.data.orders[0]);
          }
        }

        if (wishRes.success && wishRes.data) {
          setWishlist(wishRes.data);
        }

        if (addrRes.success && addrRes.data) {
          setAddresses(addrRes.data);
        }

        if (notifRes.success && notifRes.data) {
          setNotifications(notifRes.data.notifications || []);
          setUnreadNotifsCount(notifRes.data.unreadCount || 0);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [router]);

  const handleLogout = async () => {
    await api.logout();
    window.dispatchEvent(new Event('auth-updated'));
    router.push('/');
  };

  // Move wishlist item to cart
  const handleMoveToCart = async (productId: string) => {
    setMovingWishlistId(productId);
    try {
      const res = await api.moveWishlistToCart(productId);
      if (res.success) {
        setWishlist((prev) => prev.filter((it) => it.productId !== productId));
        window.dispatchEvent(new Event('cart-updated'));
      }
    } catch (err) {
      console.error('Move to cart error:', err);
    } finally {
      setMovingWishlistId(null);
    }
  };

  // Remove from wishlist
  const handleRemoveWishlist = async (productId: string) => {
    try {
      const res = await api.toggleWishlist(productId);
      if (res.success) {
        setWishlist((prev) => prev.filter((it) => it.productId !== productId));
      }
    } catch (err) {
      console.error('Remove wishlist error:', err);
    }
  };

  // Address Handlers
  const handleOpenAddressModal = (addr?: AddressData) => {
    if (addr) {
      setEditingAddressId(addr.id);
      setAddressFormData({
        name: addr.name,
        phone: addr.phone,
        streetAddress: addr.streetAddress,
        city: addr.city,
        state: addr.state,
        pinCode: addr.pinCode,
        country: addr.country || 'India',
        isDefault: addr.isDefault,
      });
    } else {
      setEditingAddressId(null);
      setAddressFormData({
        name: user?.name || '',
        phone: user?.phone || '',
        streetAddress: '',
        city: '',
        state: '',
        pinCode: '',
        country: 'India',
        isDefault: addresses.length === 0,
      });
    }
    setAddressError('');
    setShowAddressModal(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressLoading(true);
    setAddressError('');

    try {
      if (editingAddressId) {
        const res = await api.updateAddress(editingAddressId, addressFormData);
        if (res.success && res.data) {
          setAddresses((prev) =>
            prev.map((a) => (a.id === editingAddressId ? res.data : addressFormData.isDefault ? { ...a, isDefault: false } : a))
          );
          setShowAddressModal(false);
        } else {
          setAddressError(res.message || 'Failed to update address.');
        }
      } else {
        const res = await api.createAddress(addressFormData);
        if (res.success && res.data) {
          setAddresses((prev) => {
            const list = addressFormData.isDefault ? prev.map((a) => ({ ...a, isDefault: false })) : [...prev];
            return [res.data, ...list];
          });
          setShowAddressModal(false);
        } else {
          setAddressError(res.message || 'Failed to save address.');
        }
      }
    } catch (err: any) {
      setAddressError('Network error while saving address.');
    } finally {
      setAddressLoading(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to delete this delivery address?')) return;
    try {
      const res = await api.deleteAddress(id);
      if (res.success) {
        setAddresses((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (err) {
      console.error('Delete address error:', err);
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      const res = await api.setDefaultAddress(id);
      if (res.success) {
        setAddresses((prev) =>
          prev.map((a) => ({ ...a, isDefault: a.id === id }))
        );
      }
    } catch (err) {
      console.error('Set default address error:', err);
    }
  };

  // Track Order Query
  const handleTrackSubmit = async (e?: React.FormEvent, customNum?: string) => {
    if (e) e.preventDefault();
    const queryNum = customNum || trackOrderNumber;
    if (!queryNum.trim()) return;

    setTrackLoading(true);
    setTrackError('');

    try {
      const res = await api.trackOrder(queryNum.trim());
      if (res.success && res.data) {
        setTrackedOrder(res.data);
      } else {
        setTrackError(res.message || 'No tracking details found for this Order ID.');
      }
    } catch (err: any) {
      setTrackError('Failed to fetch tracking data.');
    } finally {
      setTrackLoading(false);
    }
  };

  // Update Profile
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileSuccess('');
    setProfileError('');

    try {
      const res = await api.updateProfile(profileForm);
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        setProfileSuccess('Profile updated successfully!');
        window.dispatchEvent(new Event('auth-updated'));
      } else {
        setProfileError(res.message || 'Failed to update profile.');
      }
    } catch (err: any) {
      setProfileError('Failed to reach profile service.');
    } finally {
      setProfileLoading(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    setPasswordLoading(true);

    try {
      const res = await api.changePassword({ currentPassword, newPassword });
      if (res.success) {
        setPasswordSuccess('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError(res.message || 'Failed to change password.');
      }
    } catch (err: any) {
      setPasswordError('Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Notification actions
  const handleMarkNotificationRead = async (id: string) => {
    try {
      const res = await api.markNotificationRead(id);
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
        setUnreadNotifsCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {}
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      const res = await api.markAllNotificationsRead();
      if (res.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadNotifsCount(0);
      }
    } catch (err) {}
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-pulse">
        {/* Banner Skeleton */}
        <div className="rounded-3xl bg-stone-900/90 h-32 w-full p-6 flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-stone-800" />
          <div className="space-y-2 flex-1">
            <div className="h-5 w-48 rounded bg-stone-800" />
            <div className="h-3 w-64 rounded bg-stone-800" />
          </div>
        </div>
        {/* Tabs Skeleton */}
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-9 w-28 rounded-xl bg-stone-200" />
          ))}
        </div>
        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-white border border-stone-200 p-4 space-y-2">
              <div className="h-3 w-20 rounded bg-stone-200" />
              <div className="h-6 w-12 rounded bg-stone-200" />
            </div>
          ))}
        </div>
        {/* Orders Skeleton */}
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-44 rounded-2xl bg-white border border-stone-200 p-5 space-y-3">
              <div className="h-4 w-32 rounded bg-stone-200" />
              <div className="h-14 rounded-xl bg-stone-100" />
              <div className="h-3 w-48 rounded bg-stone-200" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Order tracking status steps definition
  const TRACKING_STEPS = [
    { key: 'PENDING', label: 'Order Placed' },
    { key: 'CONFIRMED', label: 'Confirmed' },
    { key: 'PROCESSING', label: 'Processing' },
    { key: 'PACKED', label: 'Packed' },
    { key: 'SHIPPED', label: 'Shipped' },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
    { key: 'DELIVERED', label: 'Delivered' },
  ];

  const getStepIndex = (status: string) => {
    const s = status.toUpperCase();
    const idx = TRACKING_STEPS.findIndex((st) => st.key === s);
    return idx >= 0 ? idx : 0;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Luxury VIP Customer Card Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#18131D] via-[#2A1F35] to-[#18131D] p-6 sm:p-8 text-white shadow-xl border border-purple-900/40">
        {/* Subtle decorative glow aura */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-purple-600/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-purple-600 to-indigo-700 text-white font-serif font-bold text-2xl sm:text-3xl overflow-hidden shrink-0 shadow-lg ring-2 ring-amber-400/40">
              {user?.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={user.name}
                  fill
                  unoptimized
                  referrerPolicy="no-referrer"
                  className="object-cover"
                />
              ) : (
                user?.name?.charAt(0)?.toUpperCase() || 'C'
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight">
                  {user?.name}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-[11px] font-semibold px-2.5 py-0.5 shadow-xs">
                  <span>★</span> VIP Patron Club
                </span>
                <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-medium px-2 py-0.5">
                  Verified Customer
                </span>
              </div>
              <p className="text-xs text-stone-300 font-mono flex flex-wrap items-center gap-2">
                <span>{user?.email}</span>
                {user?.phone && (
                  <>
                    <span className="text-stone-500">•</span>
                    <span>{user.phone}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {user?.role === 'ADMIN' && (
              <Link href="/admin">
                <Button variant="gold" size="sm" className="gap-1.5 text-xs font-semibold shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Portal</span>
                </Button>
              </Link>
            )}

            <Link href="/shop">
              <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold backdrop-blur-xs transition-all shadow-xs">
                <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />
                <span>Browse Sarees</span>
              </button>
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-stone-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 border-b border-stone-200 text-xs font-medium">
        {[
          { key: 'overview', label: 'Account Overview', icon: Sparkles },
          { key: 'orders', label: `My Orders (${orders.length})`, icon: Package },
          { key: 'track', label: 'Track Consignment', icon: Truck },
          { key: 'wishlist', label: `Wishlist (${wishlist.length})`, icon: Heart },
          { key: 'addresses', label: `Addresses (${addresses.length})`, icon: MapPin },
          { key: 'profile', label: 'Profile', icon: User },
          { key: 'settings', label: `Settings ${unreadNotifsCount > 0 ? `(${unreadNotifsCount})` : ''}`, icon: Bell },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabType)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all shrink-0 font-medium ${
                isActive
                  ? 'bg-purple-900 text-white font-bold shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-300' : 'text-stone-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ================================================================ */}
      {/* TAB 1: OVERVIEW */}
      {/* ================================================================ */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div
              onClick={() => setActiveTab('orders')}
              className="cursor-pointer rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xs hover:border-purple-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between text-stone-500 text-xs mb-1">
                <span className="font-semibold text-stone-600">Total Orders</span>
                <div className="p-1.5 rounded-lg bg-purple-50 text-purple-700 group-hover:scale-110 transition-transform">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-serif font-bold text-stone-900">{orders.length}</div>
              <span className="text-[11px] text-purple-700 font-medium">Inspect orders history →</span>
            </div>

            <div
              onClick={() => setActiveTab('wishlist')}
              className="cursor-pointer rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xs hover:border-rose-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between text-stone-500 text-xs mb-1">
                <span className="font-semibold text-stone-600">Wishlist</span>
                <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600 group-hover:scale-110 transition-transform">
                  <Heart className="w-4 h-4 fill-rose-600" />
                </div>
              </div>
              <div className="text-2xl font-serif font-bold text-stone-900">{wishlist.length}</div>
              <span className="text-[11px] text-rose-600 font-medium">Saved sarees →</span>
            </div>

            <div
              onClick={() => setActiveTab('addresses')}
              className="cursor-pointer rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xs hover:border-amber-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between text-stone-500 text-xs mb-1">
                <span className="font-semibold text-stone-600">Saved Addresses</span>
                <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700 group-hover:scale-110 transition-transform">
                  <MapPin className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-serif font-bold text-stone-900">{addresses.length}</div>
              <span className="text-[11px] text-amber-700 font-medium">Manage destinations →</span>
            </div>

            <div
              onClick={() => setActiveTab('settings')}
              className="cursor-pointer rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between text-stone-500 text-xs mb-1">
                <span className="font-semibold text-stone-600">Notifications</span>
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 group-hover:scale-110 transition-transform">
                  <Bell className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-serif font-bold text-stone-900">{unreadNotifsCount}</div>
              <span className="text-[11px] text-emerald-700 font-medium">Unread updates →</span>
            </div>
          </div>

          {/* Recent Order Spotlight */}
          {orders.length > 0 ? (
            <div className="rounded-2xl border border-stone-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-900">
                    Latest Order Placed
                  </span>
                  <OrderStatusBadge status={orders[0].status} />
                  <PaymentStatusBadge status={orders[0].paymentStatus} />
                </div>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-semibold text-purple-700 hover:underline flex items-center gap-1"
                >
                  <span>View All Orders</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-base font-bold text-stone-900 font-mono">
                    #{orders[0].orderNumber}
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Placed on {formatDate(orders[0].createdAt)} • Total: <strong className="text-stone-900 font-serif">{formatPrice(orders[0].total)}</strong>
                  </p>
                  <p className="text-xs text-stone-600 mt-1">
                    Delivering to: <span className="font-medium text-stone-800">{orders[0].customerName}, {orders[0].city}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setTrackOrderNumber(orders[0].orderNumber);
                      setTrackedOrder(orders[0]);
                      setActiveTab('track');
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-semibold border border-purple-200 transition-colors shadow-2xs"
                  >
                    <Truck className="w-3.5 h-3.5 text-purple-700" />
                    <span>Track Shipment</span>
                  </button>

                  <button
                    onClick={() => setSelectedOrder(orders[0])}
                    className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-semibold shadow-2xs transition-colors"
                  >
                    <span>View Details</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50/50 p-8 text-center space-y-3">
              <Package className="w-10 h-10 text-stone-400 mx-auto" />
              <div>
                <h3 className="text-sm font-bold text-stone-900">You haven&apos;t placed any orders yet</h3>
                <p className="text-xs text-stone-500 mt-1">
                  Discover our pure Kanjivaram and Banarasi silk collection crafted by master weavers.
                </p>
              </div>
              <Link href="/shop">
                <Button variant="primary" size="sm" className="mt-2">
                  Explore Saree Collection
                </Button>
              </Link>
            </div>
          )}

          {/* Quick Help & WhatsApp Card */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shrink-0 shadow-xs">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-emerald-950">Direct Bridal &amp; Saree Stylist Helpline</h4>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Have questions about blouse piece tailoring, custom color dying, or dispatch schedules?
                </p>
              </div>
            </div>
            <a
              href={buildWhatsAppLink(
                APP_CONFIG.supportPhone,
                `Hello Royal Saree & Fashion, I am ${user?.name} and need assistance with my account.`
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors shadow-2xs shrink-0">
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Chat on WhatsApp</span>
              </button>
            </a>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* TAB 2: MY ORDERS */}
      {/* ================================================================ */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-1">
            <div>
              <h2 className="text-base font-serif font-bold text-stone-900 tracking-tight">
                My Saree Orders &amp; Dispatches
              </h2>
              <p className="text-xs text-stone-500">
                Track your authentic handloom orders, live logistics stages, and verified invoices
              </p>
            </div>
            <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
              {orders.length} orders placed
            </span>
          </div>

          {orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => {
                // Compute 4-stage tracking progress
                const macroStage =
                  order.status === 'DELIVERED'
                    ? 3
                    : order.status === 'SHIPPED' || order.status === 'OUT_FOR_DELIVERY'
                    ? 2
                    : order.status === 'PROCESSING' || order.status === 'PACKED'
                    ? 1
                    : 0;

                return (
                  <div
                    key={order.id}
                    className="rounded-2xl border border-stone-200/90 bg-white overflow-hidden shadow-xs hover:shadow-md transition-all duration-200"
                  >
                    {/* Order Card Header */}
                    <div className="p-4 sm:p-5 bg-stone-50/70 border-b border-stone-200/90 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-mono text-xs font-bold bg-stone-900 text-amber-300 px-2.5 py-1 rounded-lg border border-stone-800 shadow-2xs">
                          #{order.orderNumber}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-stone-500">
                          <Clock className="w-3.5 h-3.5 text-stone-400" />
                          <span>{formatDate(order.createdAt)}</span>
                        </div>
                        {order.city && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-stone-600 bg-white px-2 py-0.5 rounded-full border border-stone-200">
                            <MapPin className="w-3 h-3 text-stone-400" />
                            <span>{order.city}, {order.state || 'India'}</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <OrderStatusBadge status={order.status} />
                        <PaymentStatusBadge status={order.paymentStatus} />
                      </div>
                    </div>

                    {/* Order Items Preview */}
                    <div className="p-4 sm:p-5 space-y-4">
                      <div className="space-y-2.5">
                        {order.items?.map((it, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-stone-50/50 border border-stone-100 hover:bg-stone-50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative h-14 w-11 rounded-lg overflow-hidden bg-stone-200 shrink-0 border border-stone-200 shadow-2xs">
                                {it.productImage ? (
                                  <Image
                                    src={it.productImage}
                                    alt={it.productName}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-stone-400">
                                    <Package className="w-5 h-5" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-stone-900 line-clamp-1">
                                  {it.productName}
                                </h4>
                                <p className="text-[11px] text-stone-500 font-mono mt-0.5">
                                  SKU: {it.productSku || 'RSF-SILK'} • Qty: {it.quantity} × {formatPrice(it.unitPrice)}
                                </p>
                              </div>
                            </div>
                            <div className="text-xs font-mono font-bold text-stone-900 shrink-0">
                              {formatPrice(it.total)}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* 4-Stage Live Delivery Progress Tracker */}
                      <div className="bg-stone-50/80 p-3.5 rounded-xl border border-stone-200/80">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-stone-700 mb-2">
                          <span className="flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5 text-purple-700" />
                            <span>Dispatch Milestone:</span>
                          </span>
                          <span className="font-mono text-purple-800 text-[11px]">
                            {order.carrier || 'Blue Dart Express'} {order.trackingNumber ? `(AWB: ${order.trackingNumber})` : '• In Preparation'}
                          </span>
                        </div>

                        {/* Progress Stepper Bar */}
                        <div className="grid grid-cols-4 gap-2 text-center">
                          {[
                            { label: 'Order Confirmed', idx: 0 },
                            { label: 'Atelier Packed', idx: 1 },
                            { label: 'In Transit', idx: 2 },
                            { label: 'Delivered', idx: 3 },
                          ].map((step) => {
                            const isDone = macroStage >= step.idx;
                            const isCurrent = macroStage === step.idx;
                            return (
                              <div key={step.idx} className="flex flex-col items-center">
                                <div
                                  className={`w-full h-1.5 rounded-full mb-1.5 transition-all ${
                                    isDone ? 'bg-purple-700' : 'bg-stone-200'
                                  }`}
                                />
                                <span
                                  className={`text-[10px] leading-tight ${
                                    isCurrent
                                      ? 'font-bold text-purple-900'
                                      : isDone
                                      ? 'font-semibold text-stone-800'
                                      : 'text-stone-400'
                                  }`}
                                >
                                  {step.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Bottom Order Summary & Actions */}
                      <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
                            Invoice Total ({order.items?.length || 1} items)
                          </span>
                          <span className="text-base font-serif font-bold text-stone-900">
                            {formatPrice(order.total)}
                          </span>
                          <span className="text-[10px] text-emerald-700 font-medium ml-2">
                            • Certified Handloom Dispatch
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => {
                              setTrackOrderNumber(order.orderNumber);
                              setTrackedOrder(order);
                              setActiveTab('track');
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-semibold border border-purple-200/80 transition-colors shadow-2xs"
                          >
                            <Truck className="w-3.5 h-3.5 text-purple-700" />
                            <span>Track Consignment</span>
                          </button>

                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-semibold shadow-2xs transition-colors"
                          >
                            <span>View Full Invoice</span>
                          </button>

                          <a
                            href={buildWhatsAppLink(
                              APP_CONFIG.supportPhone,
                              `Hi Royal Saree & Fashion, I need help with my Order #${order.orderNumber}.`
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 p-1.5 rounded-xl border border-emerald-300 text-emerald-700 hover:bg-emerald-50 transition-colors"
                            title="Direct WhatsApp Helpline"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-stone-200 bg-white p-12 text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center mx-auto">
                <Package className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-base font-serif font-bold text-stone-900">
                  No saree orders placed yet
                </h3>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  Discover our pure Kanjivaram silks, Organza drapes, and royal bridal couture woven by certified master artisans.
                </p>
              </div>
              <Link href="/shop">
                <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all">
                  <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />
                  <span>Explore Saree Collection</span>
                </button>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ================================================================ */}
      {/* TAB 3: TRACK ORDER */}
      {/* ================================================================ */}
      {activeTab === 'track' && (
        <div className="space-y-6">
          {/* Track Input Bar */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-2xs space-y-4">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-brand-900">
                Track Saree Consignment
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Enter your 5-digit Order ID to check live courier milestone progress
              </p>
            </div>

            <form onSubmit={handleTrackSubmit} className="flex gap-2 max-w-md">
              <input
                type="text"
                value={trackOrderNumber}
                onChange={(e) => setTrackOrderNumber(e.target.value)}
                placeholder="TW-ORD-10021"
                required
                className="flex-1 rounded-xl border border-stone-300 px-3.5 py-2 text-xs font-mono uppercase text-stone-900 focus:outline-hidden focus:border-brand-900"
              />
              <Button type="submit" variant="primary" size="sm" isLoading={trackLoading}>
                Track
              </Button>
            </form>

            {trackError && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-2.5 flex items-center gap-2 text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{trackError}</span>
              </div>
            )}
          </div>

          {/* Tracking Result Timeline */}
          {trackedOrder && (
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-subtle space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-brand-950">
                      #{trackedOrder.orderNumber}
                    </span>
                    <OrderStatusBadge status={trackedOrder.status} />
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Carrier: <strong>{trackedOrder.carrier || 'Blue Dart Express'}</strong>
                    {trackedOrder.trackingNumber && ` • AWB: ${trackedOrder.trackingNumber}`}
                  </p>
                </div>

                <div className="text-xs text-stone-600">
                  <span>Shipping to: <strong>{trackedOrder.shippingAddress}, {trackedOrder.city}</strong></span>
                </div>
              </div>

              {/* 7-Step Visual Timeline */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
                  {TRACKING_STEPS.map((step, idx) => {
                    const currentIdx = getStepIndex(trackedOrder.status);
                    const isPassed = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;

                    return (
                      <div
                        key={step.key}
                        className={`rounded-xl p-3 border text-center transition-all ${
                          isCurrent
                            ? 'border-brand-900 bg-brand-900 text-white shadow-xs'
                            : isPassed
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                            : 'border-stone-100 bg-stone-50/50 text-stone-400'
                        }`}
                      >
                        <div className="flex justify-center mb-1">
                          {isPassed ? (
                            <CheckCircle2 className={`w-4 h-4 ${isCurrent ? 'text-amber-300' : 'text-emerald-600'}`} />
                          ) : (
                            <Clock className="w-4 h-4 text-stone-300" />
                          )}
                        </div>
                        <div className="text-[11px] font-semibold leading-tight">{step.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Contact on WhatsApp for this tracked order */}
              <div className="pt-2 flex justify-end">
                <a
                  href={buildWhatsAppLink(
                    APP_CONFIG.supportPhone,
                    `Hello Royal Saree, I am inquiring about tracking for Order #${trackedOrder.orderNumber}.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Need Help with Delivery? Contact Support on WhatsApp</span>
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================================================================ */}
      {/* TAB 4: WISHLIST */}
      {/* ================================================================ */}
      {activeTab === 'wishlist' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-brand-900">
              Saved Wishlist
            </h2>
            <span className="text-xs text-stone-500">{wishlist.length} Items</span>
          </div>

          {wishlist.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {wishlist.map((item) => {
                const prod = item.product;
                const isOutOfStock = prod?.stock <= 0;
                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-2xs flex flex-col justify-between"
                  >
                    <div className="p-4 space-y-3">
                      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-stone-100">
                        {prod?.images?.[0]?.url && (
                          <Image
                            src={prod.images[0].url}
                            alt={prod.name}
                            fill
                            className="object-cover"
                          />
                        )}
                        {isOutOfStock && (
                          <div className="absolute inset-0 bg-black/50 backdrop-blur-2xs flex items-center justify-center">
                            <span className="bg-rose-600 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
                              Out of Stock
                            </span>
                          </div>
                        )}
                      </div>

                      <div>
                        <span className="text-[10px] font-semibold text-primary-600 uppercase tracking-wider">
                          {prod?.category?.name || 'Heritage Silk'}
                        </span>
                        <h4 className="text-xs font-bold text-stone-900 line-clamp-1">
                          {prod?.name}
                        </h4>
                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="text-sm font-bold text-brand-950 font-serif">
                            {formatPrice(prod?.discountPrice || prod?.price || 0)}
                          </span>
                          {prod?.discountPrice && (
                            <span className="text-xs text-stone-400 line-through">
                              {formatPrice(prod.price)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 pt-0 flex gap-2 border-t border-stone-100 mt-2">
                      <Button
                        variant="primary"
                        size="xs"
                        disabled={isOutOfStock || movingWishlistId === prod.id}
                        isLoading={movingWishlistId === prod.id}
                        onClick={() => handleMoveToCart(prod.id)}
                        className="flex-1 gap-1 text-xs"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Move to Cart</span>
                      </Button>

                      <button
                        onClick={() => handleRemoveWishlist(prod.id)}
                        className="p-2 rounded-lg border border-stone-200 text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Remove from wishlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50/50 p-10 text-center space-y-3">
              <Heart className="w-10 h-10 text-rose-300 mx-auto" />
              <div>
                <h3 className="text-sm font-bold text-stone-900">Your wishlist is empty</h3>
                <p className="text-xs text-stone-500 mt-1">
                  Save your favorite sarees to check stock updates and order anytime.
                </p>
              </div>
              <Link href="/shop">
                <Button variant="primary" size="sm">
                  Discover Sarees
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ================================================================ */}
      {/* TAB 5: SAVED ADDRESSES */}
      {/* ================================================================ */}
      {activeTab === 'addresses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-brand-900">
                Delivery Addresses
              </h2>
              <p className="text-xs text-stone-500">
                Saved shipping destinations for 1-click Razorpay checkout
              </p>
            </div>

            <Button
              variant="primary"
              size="xs"
              onClick={() => handleOpenAddressModal()}
              className="gap-1 text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Address</span>
            </Button>
          </div>

          {addresses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`rounded-2xl border p-5 shadow-2xs space-y-3 flex flex-col justify-between ${
                    addr.isDefault ? 'border-primary-300 bg-primary-50/30' : 'border-stone-200 bg-white'
                  }`}
                >
                  <div className="space-y-1.5 text-xs text-stone-700">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900 text-sm">{addr.name}</span>
                      {addr.isDefault && (
                        <span className="rounded-full bg-primary-100 text-primary-800 border border-primary-200 text-[10px] font-bold px-2.5 py-0.5">
                          Default Address
                        </span>
                      )}
                    </div>
                    <p className="text-stone-600 leading-relaxed">
                      {addr.streetAddress}, {addr.city}, {addr.state} — {addr.pinCode}, {addr.country}
                    </p>
                    <p className="text-stone-500 font-mono">Phone: {addr.phone}</p>
                  </div>

                  <div className="flex items-center justify-between border-t border-stone-100 pt-3 text-xs">
                    {!addr.isDefault ? (
                      <button
                        onClick={() => handleSetDefaultAddress(addr.id)}
                        className="text-primary-600 hover:underline font-medium text-[11px]"
                      >
                        Set as Default
                      </button>
                    ) : (
                      <span className="text-emerald-700 font-medium text-[11px]">Primary Destination</span>
                    )}

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenAddressModal(addr)}
                        className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors"
                        title="Edit address"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="p-1.5 rounded-lg border border-stone-200 text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete address"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50/50 p-10 text-center space-y-3">
              <MapPin className="w-10 h-10 text-stone-400 mx-auto" />
              <div>
                <h3 className="text-sm font-bold text-stone-900">No saved addresses found</h3>
                <p className="text-xs text-stone-500 mt-1">
                  Add your primary delivery address for smooth, fast checkout.
                </p>
              </div>
              <Button variant="primary" size="sm" onClick={() => handleOpenAddressModal()}>
                Add Address
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ================================================================ */}
      {/* TAB 6: PROFILE */}
      {/* ================================================================ */}
      {activeTab === 'profile' && (
        <div className="max-w-xl rounded-2xl border border-stone-200 bg-white p-6 shadow-subtle space-y-5">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-brand-900">
              Customer Profile
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Update your account details and contact preferences
            </p>
          </div>

          {profileSuccess && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 flex items-center gap-2 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{profileSuccess}</span>
            </div>
          )}

          {profileError && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-2.5 flex items-center gap-2 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Email Address</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2 text-xs text-stone-500 cursor-not-allowed"
              />
              <span className="text-[10px] text-stone-400">Email cannot be changed for security purposes.</span>
            </div>

            <Input
              label="Full Name"
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              required
              placeholder="e.g. Priya Sharma"
            />

            <Input
              label="Phone Number"
              value={profileForm.phone}
              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              placeholder="+91 9876543210"
            />

            <Input
              label="Profile Avatar Image URL"
              value={profileForm.avatarUrl}
              onChange={(e) => setProfileForm({ ...profileForm, avatarUrl: e.target.value })}
              placeholder="https://..."
            />

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">About / Bio</label>
              <textarea
                rows={2}
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                placeholder="Handloom enthusiast, wedding collector..."
                className="w-full rounded-xl border border-stone-200 px-3.5 py-2 text-xs text-stone-900 focus:outline-hidden focus:border-brand-900"
              />
            </div>

            <Button type="submit" variant="primary" size="md" isLoading={profileLoading} className="w-full">
              Save Profile Changes
            </Button>
          </form>
        </div>
      )}

      {/* ================================================================ */}
      {/* TAB 7: SETTINGS & NOTIFICATIONS */}
      {/* ================================================================ */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notifications Center */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-subtle space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-brand-900">
                  Notification Center
                </h3>
              </div>
              {unreadNotifsCount > 0 && (
                <button
                  onClick={handleMarkAllNotificationsRead}
                  className="text-xs text-primary-600 hover:underline font-semibold"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {notifications.length > 0 ? (
              <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`rounded-xl p-3 border text-xs space-y-1 transition-all ${
                      n.isRead ? 'border-stone-100 bg-stone-50/40 text-stone-600' : 'border-primary-200 bg-primary-50/30 text-stone-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-brand-950">{n.title}</span>
                      <span className="text-[10px] text-stone-400">{formatDate(n.createdAt)}</span>
                    </div>
                    <p className="text-stone-600 leading-relaxed">{n.message}</p>
                    <div className="flex items-center justify-between pt-1">
                      {n.link ? (
                        <Link href={n.link} className="text-primary-600 hover:underline text-[11px] font-medium">
                          View details →
                        </Link>
                      ) : <span />}
                      {!n.isRead && (
                        <button
                          onClick={() => handleMarkNotificationRead(n.id)}
                          className="text-[10px] text-stone-500 hover:text-stone-900"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-400 italic text-center py-6">
                No notifications yet. You will receive updates when your orders are confirmed and shipped!
              </p>
            )}
          </div>

          {/* Change Password Form */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-subtle space-y-4">
            <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
              <Key className="w-4 h-4 text-brand-800" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-900">
                Change Password
              </h3>
            </div>

            {passwordSuccess && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 flex items-center gap-2 text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-2.5 flex items-center gap-2 text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3">
              <Input
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                placeholder="••••••••"
              />

              <Input
                label="New Password (min 6 chars)"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="••••••••"
              />

              <Input
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
              />

              <Button type="submit" variant="primary" size="md" isLoading={passwordLoading} className="w-full mt-2">
                Update Password
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* ORDER DETAILS MODAL */}
      {/* ================================================================ */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-serif font-bold text-brand-950">
                    Order #{selectedOrder.orderNumber}
                  </h3>
                  <OrderStatusBadge status={selectedOrder.status} />
                  <PaymentStatusBadge status={selectedOrder.paymentStatus} />
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  Placed on {formatDate(selectedOrder.createdAt)}
                </p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="text-stone-400 hover:text-stone-700 p-1.5 rounded-full hover:bg-stone-100"
              >
                ✕
              </button>
            </div>

            {/* Products List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-900">
                Purchased Sarees ({selectedOrder.items?.length || 0})
              </h4>
              <div className="divide-y divide-stone-100 rounded-2xl border border-stone-200 overflow-hidden">
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="p-3.5 flex items-center justify-between gap-3 bg-white">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-stone-100 shrink-0">
                        {item.productImage && (
                          <Image src={item.productImage} alt={item.productName} fill className="object-cover" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-stone-900">{item.productName}</div>
                        <div className="text-[11px] text-stone-400 font-mono">
                          SKU: {item.productSku} • Qty: {item.quantity} × {formatPrice(item.unitPrice)}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs font-bold text-stone-900">
                      {formatPrice(item.total)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="rounded-2xl bg-stone-50 p-4 space-y-1.5 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span>{formatPrice(selectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Shipping Fee</span>
                <span>{selectedOrder.shippingFee === 0 ? 'FREE' : formatPrice(selectedOrder.shippingFee)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Handloom GST (5%)</span>
                <span>{formatPrice(selectedOrder.tax)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-brand-950 pt-2 border-t border-stone-200">
                <span>Total Amount</span>
                <span>{formatPrice(selectedOrder.total)}</span>
              </div>
            </div>

            {/* Delivery Address & Tracking */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="rounded-xl border border-stone-200 p-3.5 space-y-1">
                <span className="font-bold text-stone-900 block">Delivery Address:</span>
                <p className="text-stone-600">
                  {selectedOrder.customerName}<br />
                  {selectedOrder.shippingAddress}<br />
                  {selectedOrder.city}, {selectedOrder.state} - {selectedOrder.pinCode}<br />
                  Phone: {selectedOrder.customerPhone}
                </p>
              </div>

              <div className="rounded-xl border border-stone-200 p-3.5 space-y-1">
                <span className="font-bold text-stone-900 block">Logistics &amp; Payment:</span>
                <p className="text-stone-600">
                  Gateway: <strong>{selectedOrder.paymentMethod}</strong><br />
                  Carrier: <strong>{selectedOrder.carrier || 'Express'}</strong><br />
                  {selectedOrder.trackingNumber ? `AWB: ${selectedOrder.trackingNumber}` : 'AWB will be assigned upon dispatch'}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <a
                href={buildWhatsAppLink(
                  APP_CONFIG.supportPhone,
                  `Hello Royal Saree, I need assistance with Order #${selectedOrder.orderNumber}.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Need Help? Contact on WhatsApp</span>
              </a>

              <Button variant="secondary" size="sm" onClick={() => setSelectedOrder(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* ADD / EDIT ADDRESS MODAL */}
      {/* ================================================================ */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-brand-900">
                {editingAddressId ? 'Edit Delivery Address' : 'Add Delivery Address'}
              </h3>
              <button
                onClick={() => setShowAddressModal(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-full"
              >
                ✕
              </button>
            </div>

            {addressError && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-2.5 flex items-center gap-2 text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{addressError}</span>
              </div>
            )}

            <form onSubmit={handleSaveAddress} className="space-y-3">
              <Input
                label="Full Name / Recipient"
                value={addressFormData.name}
                onChange={(e) => setAddressFormData({ ...addressFormData, name: e.target.value })}
                required
                placeholder="e.g. Shalini Roy"
              />

              <Input
                label="Mobile Phone Number"
                type="tel"
                value={addressFormData.phone}
                onChange={(e) => setAddressFormData({ ...addressFormData, phone: e.target.value })}
                required
                placeholder="+91 9830012345"
              />

              <Input
                label="Street Address / House / Flat"
                value={addressFormData.streetAddress}
                onChange={(e) => setAddressFormData({ ...addressFormData, streetAddress: e.target.value })}
                required
                placeholder="e.g. 42 Park Street, Flat 3B"
              />

              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="City"
                  value={addressFormData.city}
                  onChange={(e) => setAddressFormData({ ...addressFormData, city: e.target.value })}
                  required
                  placeholder="Kolkata"
                />

                <Input
                  label="State"
                  value={addressFormData.state}
                  onChange={(e) => setAddressFormData({ ...addressFormData, state: e.target.value })}
                  required
                  placeholder="West Bengal"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="PIN Code"
                  value={addressFormData.pinCode}
                  onChange={(e) => setAddressFormData({ ...addressFormData, pinCode: e.target.value })}
                  required
                  placeholder="700016"
                />

                <Input
                  label="Country"
                  value={addressFormData.country}
                  onChange={(e) => setAddressFormData({ ...addressFormData, country: e.target.value })}
                  required
                  placeholder="India"
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={addressFormData.isDefault}
                  onChange={(e) => setAddressFormData({ ...addressFormData, isDefault: e.target.checked })}
                  className="rounded border-stone-300 text-brand-900 focus:ring-brand-900"
                />
                <span>Set as primary default delivery address</span>
              </label>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowAddressModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={addressLoading}
                  className="flex-1"
                >
                  Save Address
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CustomerDashboardPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-stone-50">
          <div className="w-8 h-8 border-2 border-purple-700 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CustomerDashboardContent />
    </React.Suspense>
  );
}
