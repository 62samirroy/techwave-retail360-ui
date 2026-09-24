'use client';

import React, { useState } from 'react';
import { Sparkles, Send, Loader2, Bot, Check, ArrowRight, CornerDownLeft } from 'lucide-react';
import { api } from '@/lib/api';
import { ProductData } from '@/types';

interface ProductAiAskProps {
  product: ProductData;
}

export function ProductAiAsk({ product }: ProductAiAskProps) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [activePrompt, setActivePrompt] = useState<string | null>(null);

  const suggestedPrompts = [
    {
      label: '👗 Blouse & Neckline Ideas',
      query: `What blouse color, fabric, and neckline would look most flattering with this ${product.name}?`,
    },
    {
      label: '💍 Jewelry & Accessories',
      query: `What jewelry (temple gold, kundan, polki, or pearls) and bag pair best with this ${product.name}?`,
    },
    {
      label: '✨ Draping Styles & Occasion',
      query: `What is the best draping style for this ${product.name} for an evening wedding vs day reception?`,
    },
    {
      label: '🧼 Fabric Care & Storage',
      query: `How should I clean, store, and preserve the pure zari and fabric of this ${product.name}?`,
    },
  ];

  const handleAsk = async (queryText?: string) => {
    const textToAsk = (queryText || question).trim();
    if (!textToAsk || loading) return;

    setLoading(true);
    setResponse(null);

    // Contextualized question with full saree product metadata
    const contextualMessage = `[Product Context: "${product.name}", Category: "${product.category?.name || 'Handloom Silk'}", Price: ₹${product.price}, SKU: "${product.sku}", Details: "${product.shortDescription || product.description}"] Customer Query: ${textToAsk}`;

    try {
      const res = await api.chatCustomerAI(contextualMessage);
      if (res.success && res.data?.message) {
        setResponse(res.data.message);
      } else {
        // Fallback intelligent styling response tailored to this specific saree
        setResponse(generateSmartStylingAdvice(product, textToAsk));
      }
    } catch (err) {
      // Offline / Network fallback
      setResponse(generateSmartStylingAdvice(product, textToAsk));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[#ECE7DF] bg-gradient-to-br from-[#FAF8F5] via-white to-[#F6F3EE] p-5 shadow-xs transition-all hover:border-[#9333EA]/30">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#211B26] text-amber-200 shadow-sm">
            <Sparkles className="h-4 w-4 text-[#C084FC]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-sm font-bold text-[#211B26]">
                Ask AI Stylist About This Saree
              </h3>
              <span className="rounded-full bg-[#9333EA]/10 px-2 py-0.5 text-[9.5px] font-semibold text-[#9333EA] border border-[#9333EA]/20">
                Instant Advice
              </span>
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Personalized styling, blouse pairings, jewellery &amp; care for <span className="font-medium text-[#211B26]">{product.name}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Suggested Quick Question Pills */}
      <div className="flex flex-wrap gap-1.5 mb-3.5 pt-1">
        {suggestedPrompts.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setActivePrompt(p.label);
              setQuestion(p.query);
              handleAsk(p.query);
            }}
            disabled={loading}
            className={`rounded-full px-3 py-1 text-[11px] font-medium transition-all ${
              activePrompt === p.label
                ? 'bg-[#211B26] text-white shadow-xs'
                : 'bg-white hover:bg-stone-50 text-stone-700 border border-stone-200/80 hover:border-stone-300'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk();
        }}
        className="relative flex items-center"
      >
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={`Ask about drape, blouse color, jewellery, or care...`}
          disabled={loading}
          className="w-full rounded-xl border border-stone-200/90 bg-white py-2.5 pl-3.5 pr-10 text-xs text-stone-800 placeholder-stone-400 shadow-2xs focus:border-[#211B26] focus:outline-hidden focus:ring-1 focus:ring-[#211B26] disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="absolute right-1.5 flex h-7 w-7 items-center justify-center rounded-lg bg-[#211B26] text-white hover:bg-[#342b3d] disabled:opacity-40 transition-colors shadow-2xs"
          aria-label="Send question to AI stylist"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <ArrowRight className="h-3.5 w-3.5" />
          )}
        </button>
      </form>

      {/* AI Stylist Response Area */}
      {loading && (
        <div className="mt-3.5 flex items-center gap-2.5 rounded-xl bg-white/80 p-3.5 border border-stone-100 text-xs text-stone-600 animate-pulse">
          <Loader2 className="h-4 w-4 animate-spin text-[#9333EA]" />
          <span>Stylist AI is curating recommendations for {product.name}...</span>
        </div>
      )}

      {response && !loading && (
        <div className="mt-3.5 rounded-xl bg-white p-4 border border-[#ECE7DF] shadow-xs animate-in fade-in duration-300">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-stone-100">
            <Bot className="h-4 w-4 text-[#9333EA]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#211B26]">
              Royal AI Stylist Recommendation
            </span>
          </div>
          <div className="text-xs text-stone-700 leading-relaxed space-y-2 whitespace-pre-line font-sans">
            {response}
          </div>
          <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-400">
            <span>✨ Tailored to {product.category?.name || 'Silk Handloom'} Weave</span>
            <button
              onClick={() => {
                setResponse(null);
                setQuestion('');
                setActivePrompt(null);
              }}
              className="text-[#9333EA] hover:underline font-medium"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Client-side expert fashion stylist fallback engine
function generateSmartStylingAdvice(product: ProductData, query: string): string {
  const lower = query.toLowerCase();
  const name = product.name;
  const cat = product.category?.name || 'Handloom Silk';

  if (lower.includes('blouse') || lower.includes('neckline')) {
    return `For ${name} (${cat}):
• Blouse Fabric: Pure raw silk or heavy brocade with matching gold zari work.
• Contrast Colors: Rich contrasting tones (Deep Emerald, Wine, or Antique Gold) make the weave stand out dramatically.
• Neckline Advice: Sweetheart or deep round neckline with elbow-length sleeves featuring border zari placement for timeless regal poise.`;
  }

  if (lower.includes('jewelry') || lower.includes('jewellery') || lower.includes('accessory')) {
    return `Jewelry Pairings for ${name}:
• Metal: Authentic 22k Temple Gold or Antique Kundan-Polki work.
• Neckpiece: A choker paired with a longer rani-haar enhances the grand pallu drape.
• Earrings: Traditional jhumkas or chaandbalis.
• Hair & Footwear: Fresh jasmine gajra in hair and embellished mojris or block heels.`;
  }

  if (lower.includes('care') || lower.includes('clean') || lower.includes('store')) {
    return `Preservation Guide for ${name}:
• Cleaning: Dry clean only by experienced silk specialists. Never water-wash pure zari.
• Storage: Wrap in breathable muslin cloth or soft pure cotton bags. Avoid plastic covers.
• Maintenance: Air the saree in shade twice a year and refold along different creases to avoid zari breakage.`;
  }

  return `Styling Notes for ${name} (${cat}):
• Best For: Wedding rituals, grand receptions, festive pujas, and heirloom family occasions.
• Drape Recommendation: Classic Nivi drape with structured, pinned shoulder pleats to exhibit the dense pallu zari.
• Makeup Palette: Warm terracotta or velvet berry lips with soft golden-bronze eye shimmer.`;
}
