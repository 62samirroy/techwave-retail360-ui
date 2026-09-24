'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
} from 'lucide-react';
import { APP_CONFIG } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState<{ name: string; role: string; email: string } | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const refreshUserData = async () => {
    try {
      const res = await api.getMe();
      if (res.success && res.data?.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch (e) {
      setUser(null);
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

  useEffect(() => {
    refreshUserData();
    refreshCartData();

    const handleCartUpdate = () => refreshCartData();
    const handleAuthUpdate = () => refreshUserData();

    window.addEventListener('cart-updated', handleCartUpdate);
    window.addEventListener('auth-updated', handleAuthUpdate);

    return () => {
      window.removeEventListener('cart-updated', handleCartUpdate);
      window.removeEventListener('auth-updated', handleAuthUpdate);
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
      setSearchOpen(false);
    }
  };

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Shop All', href: '/shop' },
    { label: 'Kanjivaram Silk', href: '/categories/kanjivaram-silk' },
    { label: 'Banarasi Brocade', href: '/categories/banarasi-brocade' },
    { label: 'Track Order', href: '/track-order' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <>
      {/* Main Navbar */}
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#EAE6DF] shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden rounded-full p-2 text-stone-700 hover:bg-stone-200/60"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <Link href="/" className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#211B26] text-white font-serif font-bold text-base shadow-sm">
                  R
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold tracking-tight text-[#211B26] font-serif leading-tight">
                    Royal Saree & Fashion
                  </span>
                  <span className="text-[9px] font-medium tracking-widest text-[#9333EA] uppercase">
                    Handloom & Bridal Couture
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-7">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'text-xs font-medium transition-colors hover:text-[#9333EA]',
                    pathname === link.href ? 'text-[#9333EA] font-semibold' : 'text-stone-700'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Action Icons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                aria-label="Search sarees"
                className="rounded-full p-2 text-brand-700 hover:bg-brand-100 transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>

              <Link
                href="/cart"
                aria-label="Cart"
                className="relative rounded-full p-2 text-brand-700 hover:bg-brand-100 transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-600 px-1 text-[10px] font-bold text-white shadow-sm">
                    {cartCount}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="relative group">
                  <button className="flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-800 hover:bg-brand-100 transition-colors">
                    <UserIcon className="w-3.5 h-3.5 text-primary-600" />
                    <span className="max-w-[80px] truncate">{user.name.split(' ')[0]}</span>
                    <ChevronDown className="w-3 h-3 text-brand-400" />
                  </button>

                  <div className="absolute right-0 mt-1 w-48 rounded-md border border-brand-200 bg-white py-1 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                    <div className="px-3 py-1.5 border-b border-brand-100">
                      <p className="text-xs font-semibold text-brand-900 truncate">{user.name}</p>
                      <p className="text-[10px] text-brand-500 truncate">{user.email}</p>
                    </div>

                    {user.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 px-3 py-1.5 text-xs text-brand-700 hover:bg-primary-50 hover:text-primary-700"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-royal-600" />
                        Admin Dashboard
                      </Link>
                    )}

                    <Link
                      href="/account"
                      className="flex items-center gap-2 px-3 py-1.5 text-xs text-brand-700 hover:bg-brand-50"
                    >
                      <UserIcon className="w-3.5 h-3.5" />
                      My Orders & Profile
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Link href="/login">
                    <Button variant="outline" size="xs">
                      Sign In
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {searchOpen && (
            <div className="py-2 pb-3 border-t border-brand-100 animate-in fade-in duration-150">
              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-brand-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Kanjivaram, Banarasi, Organza, Red Sarees, SKUs..."
                    className="w-full rounded-md border border-brand-300 pl-8 pr-3 py-1.5 text-xs text-brand-900 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    autoFocus
                  />
                </div>
                <Button type="submit" size="xs" variant="primary">
                  Search
                </Button>
              </form>
            </div>
          )}
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-brand-200 bg-white px-4 py-3 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'block py-1.5 text-xs font-medium rounded px-2',
                  pathname === link.href ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-brand-800'
                )}
              >
                {link.label}
              </Link>
            ))}
            {user?.role === 'ADMIN' && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 text-xs font-semibold text-royal-700 bg-royal-50 rounded px-2"
              >
                ★ Admin Control Center
              </Link>
            )}
          </div>
        )}
      </header>
    </>
  );
}
