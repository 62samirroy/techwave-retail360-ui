'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api } from '@/lib/api';
import { AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('Please provide your name, email, and password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.register({ name, email, phone, password });
      if (res.success) {
        window.dispatchEvent(new Event('auth-updated'));
        router.push('/account');
      } else {
        setError(res.message || 'Failed to create account.');
      }
    } catch (err: any) {
      setError('Failed to reach authentication services.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-12 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-serif font-bold text-brand-950">
          Create an Account
        </h1>
        <p className="text-xs text-brand-500">
          Join Royal Saree & Fashion for saved addresses and priority ordering
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 p-2.5 flex items-center gap-2 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleRegister} className="rounded-lg border border-brand-200 bg-white p-5 shadow-subtle space-y-3.5">
        <Input
          label="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Sunita Roy"
        />

        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="sunita.roy@example.com"
        />

        <Input
          label="Phone Number"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+91 9830012345"
        />

        <Input
          label="Password (min 6 characters)"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="••••••••"
        />

        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full mt-2"
          isLoading={loading}
        >
          Create Account
        </Button>

        <div className="pt-2 text-center text-xs text-brand-500 border-t border-brand-100">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-primary-600 hover:underline">
            Sign In
          </Link>
        </div>
      </form>
    </div>
  );
}
