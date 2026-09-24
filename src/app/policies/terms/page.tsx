import React from 'react';
import { APP_CONFIG } from '@/lib/constants';

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6 text-xs text-brand-800 leading-relaxed">
      <div className="border-b border-brand-200 pb-3">
        <h1 className="text-xl sm:text-2xl font-serif font-bold text-brand-950">
          Terms & Conditions
        </h1>
        <p className="text-xs text-brand-500">{APP_CONFIG.company} • Retail360 Platform</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-bold text-brand-900">1. Authenticity & Handloom Variations</h2>
        <p>
          Handcrafted sarees are woven on manual looms. Minor irregularities in weave texture, buta spacing, or selvedge are natural hallmarks of authentic human craftsmanship and should not be treated as manufacturing defects.
        </p>

        <h2 className="text-sm font-bold text-brand-900">2. Pricing & Invoicing</h2>
        <p>
          All product prices are quoted in Indian Rupees (INR) and are inclusive of standard 5% GST.
        </p>

        <h2 className="text-sm font-bold text-brand-900">3. Governing Jurisdiction</h2>
        <p>
          Any disputes arising from transactions on this platform shall be governed by the laws of India and subject to the jurisdiction of the courts in Kolkata, West Bengal.
        </p>
      </div>
    </div>
  );
}
