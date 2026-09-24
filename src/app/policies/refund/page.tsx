import React from 'react';
import { RotateCcw } from 'lucide-react';
import { APP_CONFIG } from '@/lib/constants';

export default function RefundPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div className="border-b border-brand-200 pb-3">
        <h1 className="text-xl sm:text-2xl font-serif font-bold text-brand-950">
          7-Day Return, Exchange & Refund Policy
        </h1>
        <p className="text-xs text-brand-500">Royal Saree & Fashion • Customer Assurance</p>
      </div>

      <div className="prose prose-sm text-brand-800 space-y-4 text-xs leading-relaxed">
        <h2 className="text-sm font-bold text-brand-900">1. Hassle-Free 7-Day Window</h2>
        <p>
          We want you to be completely satisfied with your handloom drape. You may request a return or exchange within <strong>7 days</strong> of delivery.
        </p>

        <h2 className="text-sm font-bold text-brand-900">2. Eligibility Conditions</h2>
        <p>
          • The saree must be in its original unused condition, with all tags, folding creases, and unstitched blouse piece intact.
          <br />
          • Sarees where the blouse piece has been cut or customized by your tailor cannot be accepted for return.
        </p>

        <h2 className="text-sm font-bold text-brand-900">3. Doorstep Reverse Pickup</h2>
        <p>
          We schedule a doorstep reverse pickup from your registered address free of charge. You do not need to visit courier offices.
        </p>

        <h2 className="text-sm font-bold text-brand-900">4. Rapid Refund Settlement</h2>
        <p>
          Once received at our facility and verified for quality, 100% of the purchase amount is processed back to your original payment mode (UPI, NetBanking, Card) within 24 to 48 business hours.
        </p>
      </div>
    </div>
  );
}
