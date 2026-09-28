'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Layers,
  Warehouse,
  ShoppingBag,
  Users,
  MessageSquare,
  BarChart3,
  Sparkles,
  Settings,
  ArrowLeft,
  Crown,
  Star,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function AdminSidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  const links = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Homepage CMS', href: '/admin/homepage', icon: Sparkles, highlight: true },
    { label: 'Products', href: '/admin/products', icon: Package },
    { label: 'Categories', href: '/admin/categories', icon: Layers },
    { label: 'Inventory & Alerts', href: '/admin/inventory', icon: Warehouse },
    { label: 'Orders & Shipments', href: '/admin/orders', icon: ShoppingBag },
    { label: 'Customers', href: '/admin/customers', icon: Users },
    { label: 'Reviews', href: '/admin/reviews', icon: Star },
    { label: 'Inquiries', href: '/admin/inquiries', icon: MessageSquare },
    { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { label: 'AI Business Stylist', href: '/admin/ai-assistant', icon: Sparkles },
    { label: 'Store Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-stone-200/90 bg-white text-stone-800 flex flex-col min-h-screen select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-stone-200/90 flex items-center justify-between bg-stone-50/60">
        <Link href="/admin" className="flex items-center gap-2.5 group">
          <div className="relative h-10 w-10 shrink-0 rounded-xl overflow-hidden border border-[#d4af37]/40 shadow-sm bg-[#540924]">
            <Image
              src="/brand-logo.png"
              alt="Royal Saree & Family Logo"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="text-xs font-serif font-bold text-[#540924] tracking-tight flex items-center gap-1">
              <span>Royal Saree &amp; Family</span>
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-[#540924]/10 text-[#540924] font-bold border border-[#540924]/20">
                Admin Suite
              </span>
              <span className="text-[9.5px] text-stone-400 font-mono">v2.4</span>
            </div>
          </div>
        </Link>
        {onClose && (
          <button 
            onClick={onClose} 
            className="lg:hidden p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-2.5 pb-2 pt-1 text-[10px] font-bold uppercase tracking-wider text-stone-400 font-serif">
          Store Operations
        </div>
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all',
                isActive
                  ? 'bg-rose-50/90 text-[#540924] border border-rose-200 font-semibold shadow-xs'
                  : link.highlight
                  ? 'text-amber-900 bg-amber-50/80 border border-amber-300/70 hover:bg-amber-100/80 font-semibold'
                  : 'text-stone-600 hover:bg-stone-100/80 hover:text-stone-900'
              )}
            >
              <Icon
                className={cn(
                  'w-4 h-4 shrink-0 transition-colors',
                  isActive
                    ? 'text-[#540924]'
                    : link.highlight
                    ? 'text-amber-600'
                    : 'text-stone-400 group-hover:text-stone-700'
                )}
              />
              <span className="truncate">{link.label}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#540924] shadow-xs shadow-[#540924]/40" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Back to Storefront Link */}
      <div className="p-3 border-t border-stone-200/90 bg-stone-50/60">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors border border-transparent hover:border-stone-200"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-stone-500" />
          <span>Exit to Customer Store</span>
        </Link>
      </div>
    </aside>
  );
}
