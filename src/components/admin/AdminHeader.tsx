'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, ExternalLink, Database } from 'lucide-react';
import { api } from '@/lib/api';

export function AdminHeader() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    api.getMe().then((res) => {
      if (res.success && res.data?.user) {
        setAdminUser(res.data.user);
      }
    });
  }, []);

  const handleLogout = async () => {
    await api.logout();
    router.push('/login');
  };

  return (
    <header className="h-14 border-b border-stone-200/90 bg-white/95 backdrop-blur-md px-6 flex items-center justify-between shadow-xs shrink-0 select-none">
      <div className="flex items-center gap-3">
        <span className="font-serif text-sm font-bold text-stone-900 tracking-tight">
          Royal Saree &amp; Fashion
        </span>
        <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 text-[11px] font-medium text-emerald-800">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>PostgreSQL Active</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-purple-700 bg-stone-100/70 hover:bg-stone-100 px-3 py-1.5 rounded-full transition-all"
        >
          <span>Live Storefront</span>
          <ExternalLink className="w-3 h-3" />
        </Link>

        <div className="h-4 w-px bg-stone-200" />

        <div className="flex items-center gap-2.5 text-xs">
          <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {adminUser?.name ? adminUser.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="font-semibold text-stone-900 leading-tight truncate max-w-[130px]">
              {adminUser?.name || 'Administrator'}
            </span>
            <span className="text-[10px] text-stone-500 font-mono">Store Manager</span>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="text-stone-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-colors ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
