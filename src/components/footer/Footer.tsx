import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import { APP_CONFIG, DEMO_CREDENTIALS } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="border-t border-[#3A2F42] bg-[#211B26] text-stone-300 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: Brand & Tagline */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#9333EA] text-white font-serif font-bold text-xs">
                R
              </div>
              <span className="text-sm font-serif font-bold text-white tracking-wide">
                Royal Saree &amp; Fashion
              </span>
            </div>
            <p className="text-[11px] text-stone-400 leading-relaxed">
              Curated masterweaver authentic handlooms, pure Kanjivaram zari, and heirloom Banarasi silks.
            </p>
            <div className="pt-2">
              <span className="inline-block rounded border border-brand-700 bg-brand-800/80 px-2.5 py-1 text-[10px] font-semibold text-royal-400">
                Powered by TechWave Retail360
              </span>
              <p className="text-[10px] text-brand-400 mt-1">
                {APP_CONFIG.company} • {APP_CONFIG.tagline}
              </p>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">
              Collections
            </h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <Link href="/shop" className="hover:text-white transition-colors">
                  All Sarees & Fashion
                </Link>
              </li>
              <li>
                <Link href="/categories/kanjivaram-silk" className="hover:text-white transition-colors">
                  Pure Kanjivaram Silk
                </Link>
              </li>
              <li>
                <Link href="/categories/banarasi-brocade" className="hover:text-white transition-colors">
                  Banarasi Brocade & Kadwa
                </Link>
              </li>
              <li>
                <Link href="/categories/organza-floral" className="hover:text-white transition-colors">
                  Organza & Scallop Floral
                </Link>
              </li>
              <li>
                <Link href="/categories/party-cocktail-wear" className="hover:text-white transition-colors">
                  Cocktail & Ready-to-Wear
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Care & Policies */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">
              Support & Policies
            </h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <Link href="/track-order" className="hover:text-white transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/policies/shipping" className="hover:text-white transition-colors">
                  Shipping & Delivery Policy
                </Link>
              </li>
              <li>
                <Link href="/policies/refund" className="hover:text-white transition-colors">
                  7-Day Return & Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/policies/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/policies/terms" className="hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Demo Access */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">
              Contact & Headquarters
            </h4>
            <div className="space-y-2 text-[11px]">
              <p className="flex items-center gap-2 text-brand-300">
                <Phone className="w-3.5 h-3.5 text-royal-400 shrink-0" />
                <span>{APP_CONFIG.phone}</span>
              </p>
              <p className="flex items-center gap-2 text-brand-300">
                <Mail className="w-3.5 h-3.5 text-royal-400 shrink-0" />
                <span className="truncate">{APP_CONFIG.email}</span>
              </p>
              <p className="flex items-start gap-2 text-brand-400">
                <MapPin className="w-3.5 h-3.5 text-royal-400 shrink-0 mt-0.5" />
                <span className="text-[10px] leading-tight">{APP_CONFIG.address}</span>
              </p>
            </div>

            {/* Quick Demo Credentials Box */}
            <div className="rounded-xl border border-[#3A2F42] bg-white/5 p-3 mt-2">
              <p className="text-[10px] font-semibold text-purple-300 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Quick Demo Accounts:
              </p>
              <p className="text-[10px] text-stone-300 mt-1 font-mono">
                Admin: {DEMO_CREDENTIALS.admin.email} (pw: admin123)
              </p>
              <p className="text-[10px] text-stone-300 font-mono">
                Customer: {DEMO_CREDENTIALS.customer.email} (pw: customer123)
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-[#3A2F42] flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-400 gap-2">
          <p>© {new Date().getFullYear()} {APP_CONFIG.demoStore} • Built by {APP_CONFIG.company}</p>
          <p className="flex items-center gap-1">
            Engineered with pride for Indian Retail &amp; D2C Commerce
          </p>
        </div>
      </div>
    </footer>
  );
}
