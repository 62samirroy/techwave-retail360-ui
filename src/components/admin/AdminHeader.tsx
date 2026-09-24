'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, LogOut, Bell, ExternalLink } from 'lucide-react';
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
    <header className="h-12 border-b border-brand-200 bg-white px-4 flex items-center justify-between shadow-subtle shrink-0">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-brand-900">
          Royal Saree & Fashion
        </span>
        <span className="rounded bg-brand-100 text-brand-600 px-1.5 py-0.2 text-[10px] font-medium uppercase">
          Live Store Data
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1 text-xs text-brand-600 hover:text-primary-700 transition-colors"
        >
          <span>View Storefront</span>
          <ExternalLink className="w-3 h-3" />
        </Link>

        <div className="h-4 w-px bg-brand-200" />

        <div className="flex items-center gap-2 text-xs">
          <div className="h-6 w-6 rounded-full bg-primary-100 text-primary-800 flex items-center justify-center font-bold text-[10px]">
            {adminUser?.name ? adminUser.name.charAt(0) : 'A'}
          </div>
          <span className="font-medium text-brand-800 hidden sm:inline truncate max-w-[120px]">
            {adminUser?.name || 'Administrator'}
          </span>
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="text-brand-400 hover:text-rose-600 p-1 rounded transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
