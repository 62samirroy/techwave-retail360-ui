import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Award, Heart, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { APP_CONFIG } from '@/lib/constants';

export default function AboutPage() {
  return (
    <div className="min-h-[75vh] max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-10 flex flex-col">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#b48325] bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
          Heritage Handlooms • Modern Commerce
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#540924]">
          About Royal Saree &amp; Family
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 max-w-xl mx-auto leading-relaxed">
          A Retail 360° enterprise celebrating generational Indian weaving traditions through authentic sourcing, certified pure zari, and transparent artisan commerce.
        </p>
      </div>

      {/* Main Story Image */}
      <div className="relative aspect-[16/9] w-full rounded-3xl overflow-hidden border border-stone-200 shadow-md">
        <Image
          src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1200"
          alt="Artisanal Handloom Weaving"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#630f2c]/85 via-[#7d173c]/30 to-transparent flex items-end p-6 sm:p-8">
          <p className="text-white text-xs sm:text-base font-serif">
            Directly supporting master weaver clusters across Kanchipuram, Varanasi, Chanderi, and Kutch.
          </p>
        </div>
      </div>

      {/* Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs space-y-2">
          <Award className="w-5 h-5 text-[#b48325]" />
          <h3 className="text-xs font-serif font-bold text-stone-900">Uncompromised Purity</h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            Every bridal and festive drape undergoes rigorous testing for silk density and real tested gold/silver electroplated zari. Silk Mark certified.
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs space-y-2">
          <Heart className="w-5 h-5 text-rose-600" />
          <h3 className="text-xs font-serif font-bold text-stone-900">Artisan First</h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            By eliminating multiple layers of intermediaries, our weavers receive dignified compensation while customers enjoy fair luxury pricing.
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs space-y-2">
          <Sparkles className="w-5 h-5 text-[#540924]" />
          <h3 className="text-xs font-serif font-bold text-stone-900">Heritage Craftsmanship</h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            Handcrafted with love on generational pit looms with verifiable GI tagging and genuine Silk Mark trust.
          </p>
        </div>
      </div>

      {/* Corporate Tagline & Info */}
      <div className="rounded-3xl border border-stone-200 bg-[#FAF8F5] p-8 text-center space-y-3">
        <p className="text-xs font-serif font-bold text-[#540924]">
          Royal Saree &amp; Family • A Retail 360° Handloom Showcase
        </p>
        <p className="text-xs text-stone-500 max-w-lg mx-auto">
          Delivering the finest pure silk sarees across India and worldwide with insured express shipping.
        </p>
        <div className="pt-2">
          <Link href="/shop">
            <button className="rounded-full bg-[#540924] hover:bg-[#3d0517] text-white px-7 py-3 text-xs font-semibold shadow-sm transition-all inline-flex items-center gap-2">
              <span>Explore Collection</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#d4af37]" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
