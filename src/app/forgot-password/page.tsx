'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-12 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-serif font-bold text-brand-950">
          Reset Password
        </h1>
        <p className="text-xs text-brand-500">
          Enter your registered email address to receive password reset instructions
        </p>
      </div>

      <div className="rounded-lg border border-brand-200 bg-white p-5 shadow-subtle space-y-4">
        {submitted ? (
          <div className="text-center space-y-3 py-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="text-sm font-semibold text-brand-900">Reset Link Sent</h3>
            <p className="text-xs text-brand-500 leading-relaxed">
              If an account exists for <strong>{email}</strong>, a secure password reset link has been dispatched to your inbox.
            </p>
            <Link href="/login">
              <Button variant="outline" size="xs">
                Back to Sign In
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your.email@example.com"
            />

            <Button type="submit" variant="primary" size="md" className="w-full">
              Send Reset Link
            </Button>

            <div className="text-center pt-2">
              <Link href="/login" className="text-xs text-primary-600 hover:underline flex items-center justify-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Sign In</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
