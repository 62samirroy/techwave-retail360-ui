'use client';

import React from 'react';
import Link from 'next/link';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function AdminSidebar() {
  const pathname = usePathname();

  const links = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Products', href: '/admin/products', icon: Package },
    { label: 'Categories', href: '/admin/categories', icon: Layers },
    { label: 'Inventory & Alerts', href: '/admin/inventory', icon: Warehouse },
    { label: 'Orders & Shipments', href: '/admin/orders', icon: ShoppingBag },
    { label: 'Customers', href: '/admin/customers', icon: Users },
    { label: 'Reviews', href: '/admin/reviews', icon: Star },
    { label: 'Inquiries', href: '/admin/inquiries', icon: MessageSquare },
    { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { label: 'AI Business Stylist', href: '/admin/ai-assistant', icon: Sparkles, highlight: true },
    { label: 'Store Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <aside className="w-60 shrink-0 border-r border-stone-800/80 bg-[#14121A] text-stone-300 flex flex-col min-h-screen select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-stone-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-stone-950 font-bold shadow-md shadow-amber-500/10">
            <Crown className="w-4 h-4 fill-stone-950" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5">
              <span>Royal Saree</span>
              <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                PRO
              </span>
            </h2>
            <p className="text-[10px] text-stone-400 font-mono">Retail360 Suite</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-2 pb-1.5 pt-0.5 text-[10px] font-bold uppercase tracking-wider text-stone-500">
          Management
        </div>
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all',
                isActive
                  ? 'bg-purple-600/20 text-purple-200 border border-purple-500/30 font-semibold shadow-xs'
                  : link.highlight
                  ? 'text-amber-300 hover:bg-amber-500/10 hover:text-amber-200'
                  : 'text-stone-400 hover:bg-white/5 hover:text-stone-100'
              )}
            >
              <Icon
                className={cn(
                  'w-4 h-4 shrink-0 transition-colors',
                  isActive
                    ? 'text-purple-300'
                    : link.highlight
                    ? 'text-amber-400'
                    : 'text-stone-400 group-hover:text-stone-200'
                )}
              />
              <span className="truncate">{link.label}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400 shadow-xs shadow-purple-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Back to Storefront Link */}
      <div className="p-3 border-t border-stone-800/80 bg-black/20">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-stone-400 hover:bg-white/5 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit to Customer Store</span>
        </Link>
      </div>
    </aside>
  );
}
