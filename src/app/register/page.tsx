'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api } from '@/lib/api';
import { AlertCircle, CheckCircle2, ShieldCheck, Mail, ArrowLeft, RefreshCw, KeyRound } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();

  // Registration step: 'FORM' (enter details) | 'VERIFY' (enter email OTP)
  const [step, setStep] = useState<'FORM' | 'VERIFY'>('FORM');

  // Form fields (Name, Email, Password - phone completely removed as requested)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for resending email code
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Google Identity Services (GSI) initialization for 1-Click Registration
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
                    setSuccessMsg('Account created with Google successfully! Redirecting...');
                    window.dispatchEvent(new Event('auth-updated'));
                    router.push('/dashboard');
                  } else {
                    setError(authRes.message || 'Google registration failed.');
                  }
                  setLoading(false);
                }
              },
            });

            const btnDiv = document.getElementById('googleRegisterButtonDiv');
            if (btnDiv) {
              (window as any).google.accounts.id.renderButton(btnDiv, {
                theme: 'outline',
                size: 'large',
                width: 340,
                text: 'signup_with',
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

  // Step 1: Send Email Verification Code
  const handleSendVerificationCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || !cleanEmail || !password) {
      setError('Please provide your name, email, and password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.sendRegisterCode({ name: cleanName, email: cleanEmail });
      if (res.success) {
        setStep('VERIFY');
        setCountdown(60);
        setCode(''); // Input is kept completely blank so user must manually type from their email
        setSuccessMsg(res.message || `A 6-digit verification code was sent to ${cleanEmail}. Please check your inbox.`);
      } else {
        setError(res.message || 'Failed to send verification code. Please verify your email.');
      }
    } catch (err: any) {
      setError('Connection error with authentication service.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify Code and Finalize Account Creation
  const handleVerifyAndCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanCode = code.trim();
    if (!cleanCode || cleanCode.length < 6) {
      setError('Please enter the 6-digit verification code sent to your email.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.verifyRegisterCode({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        code: cleanCode,
      });

      if (res.success && res.data?.user) {
        setSuccessMsg('Email verified! Your customer account has been created.');
        window.dispatchEvent(new Event('auth-updated'));
        router.push('/dashboard');
      } else {
        setError(res.message || 'Invalid or expired verification code. Please check your inbox.');
      }
    } catch (err: any) {
      setError('Verification service temporarily unavailable.');
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
          Create an Account
        </h1>
        <p className="text-xs text-brand-600">
          Join Royal Saree &amp; Fashion for order tracking, saved addresses, and wishlist
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
        {step === 'FORM' ? (
          <>
            {/* 1. Official Google Sign-Up Button */}
            <div className="flex flex-col items-center justify-center space-y-2">
              <div id="googleRegisterButtonDiv" className="min-h-[44px] flex items-center justify-center" />
            </div>

            {/* Divider */}
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-brand-200" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-semibold">
                <span className="bg-white px-3 text-brand-400">or register with email</span>
              </div>
            </div>

            {/* 2. Customer Registration Form (Only Name, Email, Password) */}
            <form onSubmit={handleSendVerificationCode} className="space-y-3.5">
              <Input
                label="Full Name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Priya Sharma"
                disabled={loading}
              />

              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your.email@example.com"
                disabled={loading}
              />

              <Input
                label="Create Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Minimum 6 characters"
                disabled={loading}
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full mt-2 font-medium"
                isLoading={loading}
              >
                Send Verification Code
              </Button>
            </form>
          </>
        ) : (
          /* STEP 2: Email OTP Verification */
          <form onSubmit={handleVerifyAndCreateAccount} className="space-y-4">
            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-700 flex items-center justify-between">
              <div>
                <span className="text-stone-500 block text-[11px]">Verification code sent to:</span>
                <span className="font-semibold text-stone-900">{email}</span>
              </div>
              <button
                type="button"
                onClick={() => { setStep('FORM'); setError(''); setSuccessMsg(''); }}
                className="text-primary-600 hover:text-primary-700 hover:underline font-medium text-xs flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-brand-800 mb-1.5 text-center">
                Enter 6-Digit Code Received in Your Email
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="Enter 6-digit code"
                maxLength={6}
                required
                className="w-full tracking-widest text-center text-xl font-mono font-bold rounded-lg border border-stone-300 py-3 text-stone-900 focus:outline-hidden focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                disabled={loading}
                autoFocus
              />
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-center mt-2 space-y-1">
                <p className="text-xs text-amber-900 font-medium">
                  📬 Code sent! Please check your email inbox
                </p>
                <p className="text-[11px] text-amber-700 leading-normal">
                  In Gmail, please check your <strong>Spam</strong> or <strong>Junk</strong> folder. Mark it as <em>&quot;Not Spam&quot;</em> so future emails arrive directly in your Primary inbox.
                </p>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full font-medium"
              isLoading={loading}
            >
              Verify &amp; Create Account
            </Button>

            <div className="text-center text-xs text-stone-500 pt-1">
              {countdown > 0 ? (
                <span>Resend code in {countdown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleSendVerificationCode}
                  className="text-primary-600 hover:underline font-semibold flex items-center justify-center gap-1.5 mx-auto"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Resend Verification Code</span>
                </button>
              )}
            </div>
          </form>
        )}

        <div className="pt-3 text-center text-xs text-brand-600 border-t border-brand-100">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-primary-600 hover:text-primary-700 hover:underline">
            Sign In
          </Link>
        </div>
      </div>

      <div className="text-center text-[11px] text-brand-400 flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>Your email is verified before account creation</span>
      </div>
    </div>
  );
}
