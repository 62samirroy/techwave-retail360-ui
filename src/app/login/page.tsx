'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, User, Lock, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api } from '@/lib/api';
import { DEMO_CREDENTIALS, APP_CONFIG } from '@/lib/constants';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e?: React.FormEvent, customCreds?: { email: string; pass: string }) => {
    if (e) e.preventDefault();
    setError('');

    const targetEmail = customCreds ? customCreds.email : email;
    const targetPassword = customCreds ? customCreds.pass : password;

    if (!targetEmail || !targetPassword) {
      setError('Please provide your registered email and password.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.login({ email: targetEmail, password: targetPassword });
      if (res.success && res.data?.user) {
        window.dispatchEvent(new Event('auth-updated'));
        if (res.data.user.role === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push('/account');
        }
      } else {
        setError(res.message || 'Invalid email or password.');
      }
    } catch (err: any) {
      setError('Connection error with authentication service.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAdmin = () => {
    setEmail(DEMO_CREDENTIALS.admin.email);
    setPassword(DEMO_CREDENTIALS.admin.password);
    handleLogin(undefined, { email: DEMO_CREDENTIALS.admin.email, pass: DEMO_CREDENTIALS.admin.password });
  };

  const handleDemoCustomer = () => {
    setEmail(DEMO_CREDENTIALS.customer.email);
    setPassword(DEMO_CREDENTIALS.customer.password);
    handleLogin(undefined, { email: DEMO_CREDENTIALS.customer.email, pass: DEMO_CREDENTIALS.customer.password });
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-12 space-y-6">
      <div className="text-center space-y-1">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-900 text-white font-serif font-bold text-base mx-auto shadow-sm">
          R
        </div>
        <h1 className="text-xl font-serif font-bold text-brand-950">
          Sign In to Your Account
        </h1>
        <p className="text-xs text-brand-500">
          Access your saree orders, wishlist, and fast checkout
        </p>
      </div>

      {/* 1-Click Quick Demo Login Box */}
      <div className="rounded-lg border border-royal-200 bg-royal-50/80 p-3.5 space-y-2.5">
        <div className="flex items-center gap-1.5 text-royal-900 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-royal-600" />
          <span>Quick 1-Click Demo Evaluation Accounts:</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="gold"
            size="xs"
            onClick={handleDemoAdmin}
            className="w-full gap-1"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Store Admin</span>
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="xs"
            onClick={handleDemoCustomer}
            className="w-full gap-1 border-royal-300"
          >
            <User className="w-3.5 h-3.5 text-royal-700" />
            <span>Customer Demo</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 p-2.5 flex items-center gap-2 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={(e) => handleLogin(e)} className="rounded-lg border border-brand-200 bg-white p-5 shadow-subtle space-y-4">
        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="your.email@example.com"
        />

        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs">
            <label className="font-medium text-brand-700">Password</label>
            <Link href="/forgot-password" className="text-primary-600 hover:underline text-[11px]">
              Forgot password?
            </Link>
          </div>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full"
          isLoading={loading}
        >
          Sign In
        </Button>

        <div className="pt-2 text-center text-xs text-brand-500 border-t border-brand-100">
          Don&apos;t have an account yet?{' '}
          <Link href="/register" className="font-semibold text-primary-600 hover:underline">
            Create an account
          </Link>
        </div>
      </form>
    </div>
  );
}
