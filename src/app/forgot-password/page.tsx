'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, AlertCircle, KeyRound, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<'REQUEST' | 'VERIFY' | 'SUCCESS'>('REQUEST');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Step 1: Request Reset Code
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please provide your registered email address.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.forgotPassword(cleanEmail);
      if (res.success) {
        setStep('VERIFY');
        setSuccessMsg(res.message || 'Verification code has been dispatched to your email.');
      } else {
        setError(res.message || 'Unable to find an account with that email.');
      }
    } catch (err: any) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify Code & Set New Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanCode = code.trim();
    if (!cleanCode || cleanCode.length < 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match. Please verify.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.resetPassword({
        email: email.trim().toLowerCase(),
        code: cleanCode,
        newPassword,
      });

      if (res.success) {
        setStep('SUCCESS');
        setSuccessMsg(res.message || 'Password has been updated successfully!');
      } else {
        setError(res.message || 'Failed to reset password. Please check the code.');
      }
    } catch (err: any) {
      setError('Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-12 space-y-6">
      <div className="text-center space-y-1">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-900 text-white font-serif font-bold text-base mx-auto shadow-sm">
          <KeyRound className="w-5 h-5 text-gold-400" />
        </div>
        <h1 className="text-xl font-serif font-bold text-brand-950">
          Reset Password
        </h1>
        <p className="text-xs text-brand-500">
          {step === 'REQUEST' && 'Enter your registered email address to receive a secure reset code'}
          {step === 'VERIFY' && 'Enter the 6-digit code from your email and your new password'}
          {step === 'SUCCESS' && 'Your account security credentials have been updated'}
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 p-2.5 flex items-center gap-2 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-2.5 flex items-center gap-2 text-xs text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="rounded-xl border border-brand-200 bg-white p-6 shadow-subtle space-y-4">
        {step === 'REQUEST' && (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <Input
              label="Registered Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your.email@example.com"
            />

            <Button type="submit" variant="primary" size="md" className="w-full" isLoading={loading}>
              Send Verification Code
            </Button>

            <div className="text-center pt-2">
              <Link href="/login" className="text-xs text-primary-600 hover:underline flex items-center justify-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Sign In</span>
              </Link>
            </div>
          </form>
        )}

        {step === 'VERIFY' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs text-stone-600 flex items-center justify-between">
              <span className="truncate">{email}</span>
              <button
                type="button"
                onClick={() => { setStep('REQUEST'); setError(''); setSuccessMsg(''); }}
                className="text-primary-600 hover:underline font-medium text-[11px] shrink-0"
              >
                Change Email
              </button>
            </div>

            <Input
              label="6-Digit Verification Code"
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
              required
              placeholder="e.g. 123456"
              className="text-center font-mono tracking-widest text-lg font-bold"
            />

            <div className="rounded-lg bg-amber-50 border border-amber-200 p-2.5 text-center text-[11px] text-amber-800">
              Check your <strong>Spam / Junk folder</strong> in Gmail if the reset code does not appear in your Primary inbox.
            </div>

            <Input
              label="New Password (min 6 characters)"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="••••••••"
            />

            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
            />

            <Button type="submit" variant="primary" size="md" className="w-full" isLoading={loading}>
              Set New Password
            </Button>

            <div className="flex justify-between items-center text-xs pt-1">
              <button
                type="button"
                onClick={handleRequestCode}
                className="text-primary-600 hover:underline text-[11px]"
              >
                Resend Code
              </button>
              <Link href="/login" className="text-stone-500 hover:underline text-[11px] flex items-center gap-1">
                <ArrowLeft className="w-3 h-3" />
                <span>Sign In</span>
              </Link>
            </div>
          </form>
        )}

        {step === 'SUCCESS' && (
          <div className="text-center space-y-4 py-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-brand-900">Password Reset Completed</h3>
              <p className="text-xs text-brand-500 leading-relaxed">
                Your password has been successfully updated. You can now sign in with your new credentials.
              </p>
            </div>
            <Link href="/login" className="block pt-2">
              <Button variant="primary" size="md" className="w-full">
                Sign In to Account
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
