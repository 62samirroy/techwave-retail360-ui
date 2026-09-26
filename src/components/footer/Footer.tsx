'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Heart,
  Sparkles,
  Award,
  Truck,
  RotateCcw,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import { APP_CONFIG, DEMO_CREDENTIALS } from '@/lib/constants';

export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="border-t border-[#480922] bg-[#380419] text-rose-200/90 text-xs font-sans">
      {/* 1. SLIM FOOTER CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-7">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          {/* Column 1: Brand & Hallmark */}
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="relative h-9 w-9 shrink-0 rounded-full overflow-hidden border border-[#d4af37] bg-white p-0.5 shadow-sm">
                <Image
                  src="/brand-logo.png"
                  alt="Royal Saree and Family"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-serif font-bold text-white tracking-wide leading-tight">
                  Royal Saree &amp; Family
                </span>
                <span className="text-[9px] font-semibold tracking-[0.2em] text-[#d4af37] uppercase">
                  A Retail 360° Venture • Pure Silks
                </span>
              </div>
            </div>

            <p className="text-[11px] text-rose-200/80 leading-relaxed max-w-xs">
              Authentic handlooms woven by master artisans across Kanchipuram and Varanasi with tested pure zari.
            </p>

            <div className="inline-flex items-center gap-2 rounded-md border border-[#520921] bg-[#480922]/50 px-2.5 py-1 text-[10px]">
              <Award className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
              <span className="text-white font-medium">Silk Mark Certified Pure Natural Silk</span>
            </div>
          </div>

          {/* Column 2: Collections */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#d4af37] mb-2 font-serif">
              Collections
            </h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <Link href="/categories/kanjivaram-silk" className="hover:text-white transition-colors">
                  Pure Kanchipuram Silks
                </Link>
              </li>
              <li>
                <Link href="/categories/banarasi-brocade" className="hover:text-white transition-colors">
                  Banarasi Kadwa Brocades
                </Link>
              </li>
              <li>
                <Link href="/categories/organza-floral" className="hover:text-white transition-colors">
                  Hand-Painted Organza
                </Link>
              </li>
              <li>
                <Link href="/shop?featured=true" className="hover:text-white transition-colors">
                  Heritage Bridal Edit
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Care & Policies */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#d4af37] mb-2 font-serif">
              Support
            </h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <Link href="/track-order" className="hover:text-white transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/policies/shipping" className="hover:text-white transition-colors">
                  Shipping &amp; Delivery Policy
                </Link>
              </li>
              <li>
                <Link href="/policies/refund" className="hover:text-white transition-colors">
                  7-Day Return &amp; Exchange
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Our Weavers
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Concierge & Newsletter */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#d4af37] font-serif">
              VIP Updates
            </h4>
            <form onSubmit={handleSubscribe} className="flex gap-1.5">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address..."
                className="w-full rounded-md border border-rose-300/30 bg-[#2d0213] px-3 py-1.5 text-xs text-white placeholder:text-rose-200/50 focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
              />
              <button
                type="submit"
                className="rounded-md bg-[#d4af37] hover:bg-[#b48325] text-[#380419] font-bold px-3 py-1.5 text-xs transition-all shrink-0"
              >
                Join
              </button>
            </form>
            {subscribed && (
              <p className="text-[10.5px] text-[#d4af37] flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Subscribed to VIP drops!
              </p>
            )}

            <div className="text-[11px] text-rose-200/80 pt-1 space-y-1">
              <p className="flex items-center gap-1.5">
                <Phone className="w-3 h-3 text-[#d4af37] shrink-0" />
                <span>{APP_CONFIG.phone}</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Mail className="w-3 h-3 text-[#d4af37] shrink-0" />
                <span className="truncate">{APP_CONFIG.email}</span>
              </p>
            </div>
          </div>
        </div>

        {/* 2. BOTTOM COPYRIGHT & TRUST BADGES */}
        <div className="mt-5 pt-3 border-t border-[#480922] flex flex-col sm:flex-row items-center justify-between text-[10.5px] text-rose-200/60 gap-2">
          <p>© {new Date().getFullYear()} Royal Saree &amp; Family • Powered by Retail 360°. All rights reserved.</p>
          <div className="flex items-center gap-3 text-[10.5px]">
            <span>100% Insured Delivery</span>
            <span className="text-[#d4af37]">•</span>
            <span>Razorpay Verified</span>
            <span className="text-[#d4af37]">•</span>
            <span>UPI &amp; Cards</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
