import React from 'react';
import { cn } from '@/lib/utils';

interface AlponaDesignProps {
  className?: string;
  variant?: 'banner' | 'divider' | 'compact';
  title?: string;
  subtitle?: string;
}

export function AlponaDesign({
  className,
  variant = 'banner',
  title = 'পবিত্র আলপনা • Traditional Handloom Sacred Art',
  subtitle = 'Inspired by centuries of auspicious rice-paste motifs drawn by artisans to celebrate prosperity & purity',
}: AlponaDesignProps) {
  if (variant === 'divider') {
    return (
      <div className={cn('w-full flex items-center justify-center py-4 my-2 overflow-hidden select-none', className)}>
        <div className="flex items-center w-full max-w-4xl px-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#d4af37]/40 to-[#d4af37]/80" />
          <div className="px-4 text-[#540924] flex items-center gap-2">
            {/* Left Kalka/Paisley motif */}
            <svg className="w-8 h-8 text-[#b48325]" viewBox="0 0 100 100" fill="currentColor">
              <path d="M50 10 C30 25 15 50 25 75 C32 92 60 95 72 80 C82 68 82 45 70 32 C58 20 54 12 50 10 Z M50 30 C58 40 65 55 60 70 C56 78 42 78 36 70 C30 55 40 40 50 30 Z" />
            </svg>
            {/* Center Sacred Lotus */}
            <svg className="w-10 h-10 text-[#540924]" viewBox="0 0 100 100" fill="currentColor">
              <circle cx="50" cy="50" r="12" fill="#d4af37" />
              <path d="M50 15 C45 30 45 42 50 48 C55 42 55 30 50 15 Z" />
              <path d="M50 85 C45 70 45 58 50 52 C55 58 55 70 50 85 Z" />
              <path d="M15 50 C30 45 42 45 48 50 C42 55 30 55 15 50 Z" />
              <path d="M85 50 C70 45 58 45 52 50 C58 55 70 55 85 50 Z" />
              <path d="M25 25 C38 32 45 42 47 47 C42 45 32 38 25 25 Z" />
              <path d="M75 25 C62 32 55 42 53 47 C58 45 68 38 75 25 Z" />
              <path d="M25 75 C38 68 45 58 47 53 C42 55 32 62 25 75 Z" />
              <path d="M75 75 C62 68 55 58 53 53 C58 55 68 62 75 75 Z" />
            </svg>
            {/* Right Kalka/Paisley motif */}
            <svg className="w-8 h-8 text-[#b48325] scale-x-[-1]" viewBox="0 0 100 100" fill="currentColor">
              <path d="M50 10 C30 25 15 50 25 75 C32 92 60 95 72 80 C82 68 82 45 70 32 C58 20 54 12 50 10 Z M50 30 C58 40 65 55 60 70 C56 78 42 78 36 70 C30 55 40 40 50 30 Z" />
            </svg>
          </div>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent via-[#d4af37]/40 to-[#d4af37]/80" />
        </div>
      </div>
    );
  }

  return (
    <section className={cn('relative w-full overflow-hidden my-6 select-none', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative rounded-3xl bg-gradient-to-r from-[#FAF8F5] via-[#FFF9F2] to-[#FAF8F5] border border-[#d4af37]/30 shadow-xs px-6 py-8 sm:px-10 sm:py-10 text-center overflow-hidden">
          
          {/* Subtle Watermark Mandala in Background */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-5">
            <svg className="w-[500px] h-[500px] text-[#540924]" viewBox="0 0 200 200" fill="currentColor">
              <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
              <circle cx="100" cy="100" r="70" fill="none" stroke="currentColor" strokeWidth="2" />
              <circle cx="100" cy="100" r="45" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="100" cy="100" r="20" fill="currentColor" />
            </svg>
          </div>

          {/* Top Traditional Alpona Header Band */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-12 sm:w-24 bg-gradient-to-r from-transparent to-[#b48325]" />
            <span className="text-[10.5px] uppercase tracking-[0.25em] font-serif font-bold text-[#b48325]">
              ✦ TRADITIONAL ALPONA ARTISTRY ✦
            </span>
            <div className="h-px w-12 sm:w-24 bg-gradient-to-l from-transparent to-[#b48325]" />
          </div>

          {/* Main Title & Story */}
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#540924] mb-2 tracking-tight">
            {title}
          </h3>
          <p className="max-w-2xl mx-auto text-xs sm:text-sm text-stone-600 font-normal leading-relaxed mb-6">
            {subtitle}
          </p>

          {/* Intricate Handcrafted Vector Alpona (Alpana) Artwork Ribbon */}
          <div className="w-full flex items-center justify-center overflow-x-auto py-2">
            <div className="flex items-center gap-4 sm:gap-8 shrink-0 px-2">
              
              {/* Rice Sheaf (Dhaner Shis) Border Left */}
              <div className="hidden md:flex items-center gap-1.5 opacity-80">
                {[...Array(6)].map((_, i) => (
                  <svg key={i} className="w-4 h-8 text-[#b48325]" viewBox="0 0 20 40" fill="currentColor">
                    <path d="M10 0 C7 10 3 20 10 40 C17 20 13 10 10 0 Z" />
                    <circle cx="10" cy="8" r="2" fill="#540924" />
                  </svg>
                ))}
              </div>

              {/* Left Conch (Shankha) & Kalka (Paisley) */}
              <div className="flex items-center gap-2">
                <svg className="w-9 h-9 sm:w-11 sm:h-11 text-[#b48325] transition-transform hover:scale-110" viewBox="0 0 100 100" fill="currentColor">
                  <path d="M50 5 C25 22 10 50 20 78 C28 95 62 98 76 82 C88 68 88 42 74 28 C60 14 55 7 50 5 Z M50 28 C60 38 68 55 62 72 C58 80 42 80 36 72 C28 55 38 38 50 28 Z" />
                  <circle cx="50" cy="50" r="6" fill="#540924" />
                </svg>
                <div className="w-2 h-2 rounded-full bg-[#d4af37]" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#540924]" />
              </div>

              {/* Central Sacred Lotus (Padma) Mandala */}
              <div className="relative flex items-center justify-center p-3 rounded-full bg-white/80 border border-[#d4af37]/40 shadow-xs">
                <svg className="w-16 h-16 sm:w-20 sm:h-20 text-[#540924]" viewBox="0 0 120 120" fill="none">
                  {/* Central Core */}
                  <circle cx="60" cy="60" r="14" fill="#d4af37" />
                  <circle cx="60" cy="60" r="6" fill="#540924" />
                  
                  {/* 8 Lotus Petals */}
                  <path d="M60 10 C54 28 54 44 60 50 C66 44 66 28 60 10 Z" fill="#540924" />
                  <path d="M60 110 C54 92 54 76 60 70 C66 76 66 92 60 110 Z" fill="#540924" />
                  <path d="M10 60 C28 54 44 54 50 60 C44 66 28 66 10 60 Z" fill="#540924" />
                  <path d="M110 60 C92 54 76 54 70 60 C76 66 92 66 110 60 Z" fill="#540924" />

                  {/* Diagonal Petals */}
                  <path d="M25 25 C40 34 50 48 53 53 C48 50 34 40 25 25 Z" fill="#b48325" />
                  <path d="M95 25 C80 34 70 48 67 53 C72 50 86 40 95 25 Z" fill="#b48325" />
                  <path d="M25 95 C40 86 50 72 53 67 C48 70 34 80 25 95 Z" fill="#b48325" />
                  <path d="M95 95 C80 86 70 72 67 67 C72 70 86 80 95 95 Z" fill="#b48325" />

                  {/* Sacred Rice Dots Ring */}
                  <circle cx="60" cy="22" r="2.5" fill="#d4af37" />
                  <circle cx="60" cy="98" r="2.5" fill="#d4af37" />
                  <circle cx="22" cy="60" r="2.5" fill="#d4af37" />
                  <circle cx="98" cy="60" r="2.5" fill="#d4af37" />
                  <circle cx="33" cy="33" r="2" fill="#540924" />
                  <circle cx="87" cy="33" r="2" fill="#540924" />
                  <circle cx="33" cy="87" r="2" fill="#540924" />
                  <circle cx="87" cy="87" r="2" fill="#540924" />
                </svg>
              </div>

              {/* Right Conch (Shankha) & Kalka (Paisley) */}
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#540924]" />
                <div className="w-2 h-2 rounded-full bg-[#d4af37]" />
                <svg className="w-9 h-9 sm:w-11 sm:h-11 text-[#b48325] scale-x-[-1] transition-transform hover:scale-110" viewBox="0 0 100 100" fill="currentColor">
                  <path d="M50 5 C25 22 10 50 20 78 C28 95 62 98 76 82 C88 68 88 42 74 28 C60 14 55 7 50 5 Z M50 28 C60 38 68 55 62 72 C58 80 42 80 36 72 C28 55 38 38 50 28 Z" />
                  <circle cx="50" cy="50" r="6" fill="#540924" />
                </svg>
              </div>

              {/* Rice Sheaf (Dhaner Shis) Border Right */}
              <div className="hidden md:flex items-center gap-1.5 opacity-80">
                {[...Array(6)].map((_, i) => (
                  <svg key={i} className="w-4 h-8 text-[#b48325]" viewBox="0 0 20 40" fill="currentColor">
                    <path d="M10 0 C7 10 3 20 10 40 C17 20 13 10 10 0 Z" />
                    <circle cx="10" cy="8" r="2" fill="#540924" />
                  </svg>
                ))}
              </div>

            </div>
          </div>

          {/* Auspicious Footnote */}
          <div className="mt-4 flex items-center justify-center gap-2 text-[11px] font-serif text-[#b48325]">
            <span>সৌম্য ও কল্যাণময় ঐতিহ্য</span>
            <span>•</span>
            <span className="font-sans font-medium text-stone-600">Pure Auspicious Handcraft for Weddings &amp; Festivals</span>
            <span>•</span>
            <span>মঙ্গলকামনা</span>
          </div>

        </div>
      </div>
    </section>
  );
}
