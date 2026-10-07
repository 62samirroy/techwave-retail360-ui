'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Search,
  User as UserIcon,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  LogOut,
  ChevronDown,
  Bell,
  Heart,
  Phone,
  Truck,
  MapPin,
  Clock,
  Compass,
} from 'lucide-react';
import { APP_CONFIG } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [user, setUser] = useState<{ name: string; role: string; email: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  
  // Default static sub-navigation categories
  const [navCategories, setNavCategories] = useState([
    { label: 'All Sarees', href: '/shop' },
    { label: 'Flagship Stores', href: '/#stores' },
  ]);

  const refreshUserData = async () => {
    try {
      const res = await api.getMe();
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        try {
          const notifRes = await api.getNotifications();
          if (notifRes.success && notifRes.data) {
            setUnreadNotifs(notifRes.data.unreadCount || 0);
          }
        } catch (e) {}
      } else {
        setUser(null);
        setUnreadNotifs(0);
      }
    } catch (e) {
      setUser(null);
      setUnreadNotifs(0);
    }
  };

  const refreshCartData = async () => {
    try {
      const res = await api.getCart();
      if (res.success && res.data?.itemCount !== undefined) {
        setCartCount(res.data.itemCount);
      }
    } catch (e) {}
  };

  const refreshWishlistData = async () => {
    try {
      const res = await api.getWishlist();
      if (res.success && res.data?.items) {
        setWishlistCount(res.data.items.length);
      }
    } catch (e) {}
  };

  useEffect(() => {
    refreshUserData();
    refreshCartData();
    refreshWishlistData();

    const fetchNavCategories = async () => {
      try {
        const res = await api.getCategories();
        if (res.success && Array.isArray(res.data)) {
          const activeCats = res.data.filter((c: any) => c.status === 'ACTIVE');
          const explicitlySelected = activeCats
            .filter((c: any) => c.showInNavbar === true)
            .sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

          const selectedList = explicitlySelected.length > 0 
            ? explicitlySelected 
            : activeCats.slice(0, 8);

          const dynamicCats = selectedList
            .slice(0, 9)
            .map((c: any) => ({
              label: c.name,
              href: `/categories/${c.slug}`
            }));
            
          setNavCategories([
            { label: 'All Sarees', href: '/shop' },
            ...dynamicCats,
            { label: 'Flagship Stores', href: '/#stores' },
          ]);
        }
      } catch (e) {}
    };
    fetchNavCategories();

    const handleCartUpdate = () => refreshCartData();
    const handleAuthUpdate = () => refreshUserData();
    const handleWishlistUpdate = () => refreshWishlistData();
    const handleCategoriesUpdate = () => fetchNavCategories();

    window.addEventListener('cart-updated', handleCartUpdate);
    window.addEventListener('auth-updated', handleAuthUpdate);
    window.addEventListener('wishlist-updated', handleWishlistUpdate);
    window.addEventListener('categories-updated', handleCategoriesUpdate);

    return () => {
      window.removeEventListener('cart-updated', handleCartUpdate);
      window.removeEventListener('auth-updated', handleAuthUpdate);
      window.removeEventListener('wishlist-updated', handleWishlistUpdate);
      window.removeEventListener('categories-updated', handleCategoriesUpdate);
    };
  }, []);

  const handleLogout = async () => {
    await api.logout();
    setUser(null);
    window.dispatchEvent(new Event('auth-updated'));
    router.push('/');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full shadow-md font-sans">
      {/* 1. TOP ANNOUNCEMENT BAR (Deep Rich Wine) */}
      <div className="bg-[#3d0517] text-[#fef3c7] text-[11px] py-1.5 px-4 sm:px-6 border-b border-[#520921]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Announcement Text */}
          <div className="flex items-center gap-2 overflow-hidden truncate">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#d4af37] animate-pulse" />
            <p className="truncate font-medium text-[11px] tracking-wide text-rose-100">
              Free Express Insured Shipping Across India Above ₹1,999 • 100% Pure Silk Mark Certified Handlooms
            </p>
          </div>

          {/* Quick Header Utility Links */}
          <div className="hidden md:flex items-center gap-5 text-[11px] font-medium text-rose-200 shrink-0">
            <Link
              href="/track-order"
              className="flex items-center gap-1 hover:text-[#d4af37] transition-colors"
            >
              <Truck className="w-3 h-3 text-[#d4af37]" />
              <span>Track Order</span>
            </Link>
            <Link
              href="/#stores"
              className="flex items-center gap-1 hover:text-[#d4af37] transition-colors"
            >
              <MapPin className="w-3 h-3 text-[#d4af37]" />
              <span>Flagship Stores</span>
            </Link>
            <a
              href="tel:+919641145871"
              className="flex items-center gap-1 hover:text-[#d4af37] transition-colors"
            >
              <Phone className="w-3 h-3 text-[#d4af37]" />
              <span>+91 9641145871</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER ROW: Crisp White Luxury with Deep Royal Wine & Gold Accents */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-2 md:gap-4 lg:gap-8">
          {/* Mobile Menu Button & Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden rounded-lg p-1.5 sm:p-2 text-stone-700 hover:bg-stone-100 transition-colors"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>

            <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
              {/* Generated Royal Emblem Logo */}
              <div className="relative h-9 w-9 sm:h-12 sm:w-12 shrink-0 rounded-full overflow-hidden border-2 border-[#d4af37] shadow-sm bg-white p-0.5 group-hover:scale-105 transition-transform duration-300">
                <Image
                  src="/brand-logo.png"
                  alt="Royal Saree and Family Crest"
                  fill
                  className="object-contain p-0.5"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm sm:text-lg lg:text-2xl font-serif font-bold text-[#540924] tracking-tight sm:tracking-normal leading-none group-hover:text-[#3d0517] transition-colors whitespace-nowrap">
                  Royal Saree &amp; Family
                </span>
                <span className="hidden lg:block text-[10.5px] font-semibold tracking-[0.2em] text-[#b48325] uppercase mt-0.5">
                  A Retail 360° Venture • Pure Silks
                </span>
              </div>
            </Link>
          </div>

          {/* Prominent Centered Search Bar */}
          <div className="hidden md:flex flex-1 max-w-sm lg:max-w-xl mx-2">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pure silk sarees, kanjivaram, bridal..."
                className="w-full rounded-full border border-stone-300 bg-stone-50/70 hover:bg-white focus:bg-white pl-5 pr-24 py-2.5 text-xs text-stone-900 placeholder:text-stone-400 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#540924] focus:border-[#540924] transition-all"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 bottom-1 px-4 rounded-full bg-[#540924] hover:bg-[#3d0517] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all border border-[#d4af37]/40"
              >
                <Search className="w-3.5 h-3.5 text-[#d4af37]" />
                <span className="text-white hidden lg:inline">Search</span>
              </button>
            </form>
          </div>

          {/* Action Icons (Wishlist, Account, Cart) */}
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 shrink-0">
            {/* Mobile Search Toggle Icon */}
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="md:hidden flex items-center justify-center p-1.5 sm:p-2 rounded-full text-stone-700 hover:text-[#540924] hover:bg-stone-100 transition-colors"
              aria-label="Toggle mobile search"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            {/* Wishlist Link with Live Badge */}
            <Link
              href="/dashboard?tab=wishlist"
              aria-label="Wishlist"
              className="relative flex items-center justify-center p-1.5 sm:p-2 rounded-full text-stone-700 hover:text-[#540924] hover:bg-stone-100 transition-colors"
              title="Saved Wishlist"
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-stone-700 hover:text-[#540924] transition-colors" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#540924] px-1 text-[9.5px] font-bold text-white shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* User Account / Profile Dropdown */}
            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-1.5 sm:gap-2 rounded-full border border-stone-300 bg-stone-50 p-1 sm:px-3 sm:py-1.5 text-xs font-semibold text-stone-800 hover:bg-stone-100 transition-colors">
                  <div className="flex h-7 w-7 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-[#540924] text-[#d4af37] text-xs sm:text-[10px] font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:block max-w-[80px] sm:max-w-[100px] truncate font-medium text-stone-800">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="hidden sm:block w-3 h-3 text-stone-500 group-hover:rotate-180 transition-transform" />
                </button>

                <div className="absolute right-0 mt-1 w-52 rounded-xl border border-stone-200 bg-white py-2 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 text-stone-800">
                  <div className="px-4 py-2 border-b border-stone-100">
                    <p className="text-xs font-bold text-[#540924] truncate">{user.name}</p>
                    <p className="text-[10px] text-stone-500 truncate">{user.email}</p>
                  </div>

                  {user.role === 'ADMIN' && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#540924] hover:bg-rose-50"
                    >
                      <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
                      <span>Admin Control Center</span>
                    </Link>
                  )}

                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-4 py-2 text-xs text-stone-700 hover:bg-stone-50"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-stone-500" />
                    <span>My Profile</span>
                  </Link>

                  <Link
                    href="/dashboard?tab=orders"
                    className="flex items-center gap-2 px-4 py-2 text-xs text-stone-700 hover:bg-stone-50"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-stone-500" />
                    <span>My Orders</span>
                  </Link>

                  <Link
                    href="/dashboard?tab=wishlist"
                    className="flex items-center gap-2 px-4 py-2 text-xs text-stone-700 hover:bg-stone-50"
                  >
                    <Heart className="w-3.5 h-3.5 text-stone-500" />
                    <span>Saved Wishlist</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 border-t border-stone-100 mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 hover:border-[#540924] bg-stone-50 hover:bg-[#540924] hover:text-white px-2.5 py-1.5 sm:px-3.5 text-xs font-semibold text-stone-800 transition-all group"
              >
                <UserIcon className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-[#540924] group-hover:text-white transition-colors" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}

            {/* Shopping Bag / Cart */}
            <Link
              href="/cart"
              aria-label="Shopping Cart"
              className="relative flex items-center justify-center p-2.5 rounded-full bg-[#540924] hover:bg-[#3d0517] text-white shadow-sm transition-all"
            >
              <ShoppingBag className="w-4 h-4 text-[#d4af37]" />
              {cartCount > 0 ? (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#d4af37] px-1 text-[9.5px] font-bold text-[#540924] shadow-xs">
                  {cartCount}
                </span>
              ) : (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#d4af37] px-1 text-[9.5px] font-bold text-[#540924] shadow-xs">
                  0
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile Search Bar Display */}
        {mobileSearchOpen && (
          <div className="md:hidden px-4 pb-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sarees, silks, motifs..."
                className="w-full rounded-full border border-stone-300 bg-stone-50 pl-4 pr-10 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#540924]"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-full bg-[#540924] text-white flex items-center justify-center"
              >
                <Search className="w-3 h-3 text-[#d4af37]" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* 3. SUB-NAVIGATION CATEGORY BAR (Pure White Background with Distinct Deep Wine/Ruby Text) */}
      <nav className="hidden lg:block bg-white border-y border-stone-200/90 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <ul className="flex items-center justify-between gap-2 xl:gap-5 py-2.5 text-xs font-bold text-[#540924] w-full overflow-x-auto no-scrollbar">
            {navCategories.map((item) => (
              <li key={item.label} className="shrink-0">
                <Link
                  href={item.href}
                  className={cn(
                    'transition-all tracking-wider py-1.5 border-b-2 border-transparent uppercase text-[10.5px] xl:text-[11.5px] font-bold whitespace-nowrap block',
                    pathname === item.href
                      ? 'text-[#b48325] border-[#b48325]'
                      : 'text-[#540924] hover:text-[#b48325] hover:border-[#b48325]/50'
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* 4. MOBILE SLIDE-OUT MENU */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-stone-200 bg-white px-4 py-4 space-y-3 animate-in fade-in duration-200 shadow-xl">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#b48325]">
            Explore Collections
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {navCategories.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 rounded-lg bg-stone-50 hover:bg-emerald-50 hover:text-[#053728] text-stone-700 font-medium transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {user?.role === 'ADMIN' && (
            <div className="pt-2 border-t border-stone-100">
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 px-3 rounded-lg bg-[#053728] text-white text-xs font-semibold"
              >
                <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
                <span>Admin Dashboard</span>
              </Link>
            </div>
          )}

          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
            <Link
              href="/track-order"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#053728] font-medium"
            >
              Track Order
            </Link>
            <Link
              href="/#stores"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#053728] font-medium"
            >
              Our Stores
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#053728] font-medium"
            >
              Contact Us
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
