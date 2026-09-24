import React from 'react';
import { Truck } from 'lucide-react';
import { APP_CONFIG } from '@/lib/constants';

export default function ShippingPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div className="border-b border-brand-200 pb-3">
        <h1 className="text-xl sm:text-2xl font-serif font-bold text-brand-950">
          Shipping & Delivery Policy
        </h1>
        <p className="text-xs text-brand-500">Effective Date: September 2026 • Royal Saree & Fashion</p>
      </div>

      <div className="prose prose-sm text-brand-800 space-y-4 text-xs leading-relaxed">
        <h2 className="text-sm font-bold text-brand-900">1. Pan-India Express Delivery</h2>
        <p>
          At <strong>{APP_CONFIG.demoStore}</strong>, we take extreme care in packaging your heirloom handloom sarees. All shipments are dispatched using our verified logistics partners: Blue Dart Air, DTDC Premium, and Delhivery Express.
        </p>

        <h2 className="text-sm font-bold text-brand-900">2. Shipping Charges</h2>
        <p>
          • <strong>Free Express Shipping:</strong> Available on all orders with a cart value equal to or exceeding <strong>₹{APP_CONFIG.freeShippingThreshold}</strong>.
          <br />
          • <strong>Standard Shipping:</strong> A flat delivery charge of <strong>₹{APP_CONFIG.standardShippingFee}</strong> applies to orders below ₹{APP_CONFIG.freeShippingThreshold}.
        </p>

        <h2 className="text-sm font-bold text-brand-900">3. Estimated Dispatch & Transit Timelines</h2>
        <p>
          • Orders placed before 2:00 PM IST are inspected and dispatched within 24 business hours.
          <br />
          • Metro cities (Delhi, Mumbai, Kolkata, Bengaluru, Chennai, Hyderabad): 2 to 4 business days.
          <br />
          • Tier-2, Tier-3 cities & Rest of India: 4 to 6 business days.
        </p>

        <h2 className="text-sm font-bold text-brand-900">4. Live Tracking & Tamper-Proof Packaging</h2>
        <p>
          As soon as your parcel is scanned at the sorting hub, a real-time tracking number (AWB) is shared via SMS, Email, and in your store account. Each saree is sealed in moisture-resistant, tamper-evident festive boxes with an authenticity inspection certificate.
        </p>
      </div>
    </div>
  );
}
