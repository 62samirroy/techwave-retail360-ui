import React from 'react';
import { APP_CONFIG } from '@/lib/constants';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6 text-xs text-brand-800 leading-relaxed">
      <div className="border-b border-brand-200 pb-3">
        <h1 className="text-xl sm:text-2xl font-serif font-bold text-brand-950">
          Privacy Policy
        </h1>
        <p className="text-xs text-brand-500">Last Updated: September 2026</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-bold text-brand-900">1. Information We Collect</h2>
        <p>
          We collect personal identification details such as your name, email address, phone number, and delivery address strictly to fulfill customer orders, generate shipping labels, and communicate order tracking updates.
        </p>

        <h2 className="text-sm font-bold text-brand-900">2. Payment Security</h2>
        <p>
          We never store your credit/debit card numbers, UPI PINs, or net-banking passwords. All payment transactions are securely handled through Razorpay with 256-bit SSL encryption.
        </p>

        <h2 className="text-sm font-bold text-brand-900">3. Artificial Intelligence & Data Isolation</h2>
        <p>
          Our AI Shopping and Business Assistants adhere strictly to tenant data isolation. Customer inquiries never expose private order details or credentials to third parties.
        </p>
      </div>
    </div>
  );
}
