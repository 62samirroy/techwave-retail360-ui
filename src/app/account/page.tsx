'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AccountRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-purple-700 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-stone-500">Redirecting to customer dashboard...</p>
      </div>
    </div>
  );
}
