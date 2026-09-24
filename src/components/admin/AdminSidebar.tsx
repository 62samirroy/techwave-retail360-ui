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
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function AdminSidebar() {
  const pathname = usePathname();

  const links = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Products', href: '/admin/products', icon: Package },
    { label: 'Categories', href: '/admin/categories', icon: Layers },
    { label: 'Inventory & Alerts', href: '/admin/inventory', icon: Warehouse },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { label: 'Customers', href: '/admin/customers', icon: Users },
    { label: 'Inquiries', href: '/admin/inquiries', icon: MessageSquare },
    { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { label: 'AI Business Assistant', href: '/admin/ai-assistant', icon: Sparkles, highlight: true },
    { label: 'Store Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <aside className="w-56 shrink-0 border-r border-brand-800 bg-brand-950 text-brand-300 flex flex-col min-h-screen">
      {/* Brand Header */}
      <div className="p-3 border-b border-brand-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-royal-500 text-brand-950 font-bold text-xs">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white leading-tight">Admin Portal</h2>
            <p className="text-[10px] text-royal-400 font-mono">Retail360 v1.0</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors',
                isActive
                  ? 'bg-primary-600 text-white font-semibold shadow-xs'
                  : link.highlight
                  ? 'text-royal-300 hover:bg-brand-900 hover:text-royal-200'
                  : 'text-brand-300 hover:bg-brand-900 hover:text-white'
              )}
            >
              <Icon className={cn('w-3.5 h-3.5 shrink-0', link.highlight && !isActive && 'text-royal-400')} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Back to Storefront Link */}
      <div className="p-2 border-t border-brand-800">
        <Link
          href="/"
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-brand-400 hover:bg-brand-900 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit to Customer Store</span>
        </Link>
      </div>
    </aside>
  );
}
