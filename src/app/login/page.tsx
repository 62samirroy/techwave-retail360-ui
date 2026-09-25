'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, AlertCircle, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api } from '@/lib/api';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '';

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Google Identity Services (GSI) initialization
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (clientId && typeof window !== 'undefined') {
      const initGsi = () => {
        if ((window as any).google?.accounts?.id) {
          try {
            (window as any).google.accounts.id.initialize({
              client_id: clientId,
              callback: async (response: any) => {
                if (response.credential) {
                  setLoading(true);
                  setError('');

                  // Decode Google ID token payload on client side
                  let clientEmail = '';
                  let clientName = '';
                  let clientAvatar = '';
                  let clientSub = '';
                  try {
                    const parts = response.credential.split('.');
                    if (parts.length >= 2) {
                      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
                      const jsonPayload = decodeURIComponent(
                        window
                          .atob(base64)
                          .split('')
                          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                          .join('')
                      );
                      const payload = JSON.parse(jsonPayload);
                      clientEmail = payload.email || '';
                      clientName = payload.name || '';
                      clientAvatar = payload.picture || '';
                      clientSub = payload.sub || '';
                    }
                  } catch (decodeErr) {
                    console.warn('Could not pre-decode client token:', decodeErr);
                  }

                  const authRes = await api.loginWithGoogle({
                    email: clientEmail,
                    name: clientName,
                    avatarUrl: clientAvatar,
                    googleId: clientSub,
                    idToken: response.credential,
                  });

                  if (authRes.success && authRes.data?.user) {
                    setSuccessMsg('Signed in with Google successfully!');
                    handlePostLogin(authRes.data.user.role);
                  } else {
                    setError(authRes.message || 'Google authentication failed.');
                  }
                  setLoading(false);
                }
              },
            });

            const btnDiv = document.getElementById('googleLoginButtonDiv');
            if (btnDiv) {
              (window as any).google.accounts.id.renderButton(btnDiv, {
                theme: 'outline',
                size: 'large',
                width: 340,
                text: 'continue_with',
                shape: 'rectangular',
              });
            }
          } catch (e) {
            console.warn('Google GSI button initialization:', e);
          }
        }
      };

      if ((window as any).google) {
        initGsi();
      } else {
        const interval = setInterval(() => {
          if ((window as any).google) {
            clearInterval(interval);
            initGsi();
          }
        }, 300);
        return () => clearInterval(interval);
      }
    }
  }, []);

  // Post-login redirect based on user role
  const handlePostLogin = (role: 'CUSTOMER' | 'ADMIN') => {
    window.dispatchEvent(new Event('auth-updated'));
    if (role === 'ADMIN') {
      router.push('/admin');
    } else {
      router.push(redirectUrl || '/dashboard');
    }
  };

  // Email + Password Login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email || !password) {
      setError('Please provide your registered email and password.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.login({ email: email.trim().toLowerCase(), password });
      if (res.success && res.data?.user) {
        setSuccessMsg(`Welcome back, ${res.data.user.name}!`);
        handlePostLogin(res.data.user.role);
      } else {
        setError(res.message || 'Invalid email or password.');
      }
    } catch (err: any) {
      setError('Connection error with authentication service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-12 space-y-6">
      <div className="text-center space-y-1.5">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-900 text-white font-serif font-bold text-xl mx-auto shadow-md">
          R
        </div>
        <h1 className="text-2xl font-serif font-bold text-brand-950">
          Sign In
        </h1>
        <p className="text-xs text-brand-600">
          Welcome back to Royal Saree &amp; Fashion
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 flex items-center gap-2.5 text-xs text-rose-800 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 flex items-center gap-2.5 text-xs text-emerald-800 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="rounded-2xl border border-brand-200 bg-white p-6 sm:p-7 shadow-subtle space-y-5">
        {/* 1. Official Google Sign-In Button */}
        <div className="flex flex-col items-center justify-center space-y-2">
          <div id="googleLoginButtonDiv" className="min-h-[44px] flex items-center justify-center" />
        </div>

        {/* Divider */}
        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-brand-200" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-semibold">
            <span className="bg-white px-3 text-brand-400">or sign in with email</span>
          </div>
        </div>

        {/* 2. Email & Password Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="your.email@example.com"
            disabled={loading}
          />

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-brand-800">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-primary-600 hover:text-primary-700 hover:underline font-medium"
              >
                Forgot Password?
              </Link>
            </div>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full mt-2 font-medium"
            isLoading={loading}
          >
            Sign In
          </Button>
        </form>

        <div className="pt-3 text-center text-xs text-brand-600 border-t border-brand-100">
          Don&apos;t have an account yet?{' '}
          <Link href="/register" className="font-semibold text-primary-600 hover:text-primary-700 hover:underline">
            Create an account
          </Link>
        </div>
      </div>

      <div className="text-center text-[11px] text-brand-400 flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>Secure 256-bit encrypted authentication</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      }
    >
      <LoginForm />
    </React.Suspense>
  );
}
