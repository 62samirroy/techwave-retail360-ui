'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/navbar/Navbar';
import { Footer } from '@/components/footer/Footer';
import { CustomerAIChatModal } from '@/components/ai/CustomerAIChatModal';

export function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) {
    // Admin pages provide their own sidebar, topbar and business assistant
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <CustomerAIChatModal />
    </div>
  );
}
