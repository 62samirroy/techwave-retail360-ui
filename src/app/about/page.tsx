import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Award, Heart, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { APP_CONFIG } from '@/lib/constants';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-royal-700 bg-royal-100/70 px-2.5 py-0.5 rounded">
          Heritage Handlooms • Modern Commerce
        </span>
        <h1 className="text-2xl sm:text-4xl font-serif font-bold text-brand-950">
          About Royal Saree & Fashion
        </h1>
        <p className="text-xs sm:text-sm text-brand-600 max-w-xl mx-auto leading-relaxed">
          Celebrating generational Indian weaving traditions through authentic sourcing, certified pure zari, and transparent artisan commerce powered by {APP_CONFIG.company}.
        </p>
      </div>

      {/* Main Story Image */}
      <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden border border-brand-200 shadow-md">
        <Image
          src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1200"
          alt="Artisanal Handloom Weaving"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950/80 via-transparent to-transparent flex items-end p-6">
          <p className="text-white text-xs sm:text-sm font-serif">
            Directly supporting master weaver clusters across Kanchipuram, Varanasi, Chanderi, and Kutch.
          </p>
        </div>
      </div>

      {/* Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border border-brand-200 bg-white p-4 shadow-subtle space-y-2">
          <Award className="w-5 h-5 text-royal-600" />
          <h3 className="text-xs font-bold text-brand-900">Uncompromised Purity</h3>
          <p className="text-xs text-brand-500 leading-relaxed">
            Every bridal and festive drape undergoes rigorous testing for silk density and real tested gold/silver electroplated zari.
          </p>
        </div>

        <div className="rounded-lg border border-brand-200 bg-white p-4 shadow-subtle space-y-2">
          <Heart className="w-5 h-5 text-rose-600" />
          <h3 className="text-xs font-bold text-brand-900">Artisan First</h3>
          <p className="text-xs text-brand-500 leading-relaxed">
            By eliminating multiple layers of intermediaries, our weavers receive dignified compensation while customers enjoy fair luxury pricing.
          </p>
        </div>

        <div className="rounded-lg border border-brand-200 bg-white p-4 shadow-subtle space-y-2">
          <Sparkles className="w-5 h-5 text-primary-600" />
          <h3 className="text-xs font-bold text-brand-900">TechWave Retail360</h3>
          <p className="text-xs text-brand-500 leading-relaxed">
            Empowered by next-generation AI inventory tracking, conversational assistance, and instantaneous Razorpay payments.
          </p>
        </div>
      </div>

      {/* Corporate Tagline & Info */}
      <div className="rounded-lg border border-brand-200 bg-brand-50 p-6 text-center space-y-2">
        <p className="text-xs font-semibold text-brand-900">
          {APP_CONFIG.company} • Tagline: {APP_CONFIG.tagline}
        </p>
        <p className="text-xs text-brand-500 max-w-lg mx-auto">
          TechWave Retail360 is built as a reusable, scalable commerce and business management architecture for small, medium, and D2C businesses across India.
        </p>
        <div className="pt-2">
          <Link href="/shop">
            <Button variant="primary" size="sm" className="gap-1.5">
              <span>Explore Collection</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
