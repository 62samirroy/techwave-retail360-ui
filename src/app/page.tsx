'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Scissors,
  CheckCircle2,
  Star,
  MessageCircle,
  Package,
  Layers,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ProductCard } from '@/components/shop/ProductCard';
import { api } from '@/lib/api';
import { ProductData, CategoryData } from '@/types';
import { APP_CONFIG, DEMO_CREDENTIALS } from '@/lib/constants';
import { buildWhatsAppLink } from '@/lib/utils';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<ProductData[]>([]);
  const [bestsellers, setBestsellers] = useState<ProductData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.getProducts({ limit: 12 }),
          api.getCategories(),
        ]);

        if (prodRes.success && prodRes.data?.products) {
          const prods: ProductData[] = prodRes.data.products;
          setFeaturedProducts(prods.filter((p) => p.isFeatured).slice(0, 4));
          setBestsellers(prods.filter((p) => p.isBestseller).slice(0, 4));
        }

        if (catRes.success && catRes.data) {
          setCategories(catRes.data.slice(0, 6));
        }
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const whatsappInquiryUrl = buildWhatsAppLink(
    'Namaste Royal Saree team, I would like to explore your bridal and festive handloom sarees!'
  );

  return (
    <div className="space-y-12 pb-16">
      {/* 1 & 2. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-950 via-brand-900 to-primary-950 text-white py-12 md:py-16 px-4 sm:px-6">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Hero Copy */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-royal-500/40 bg-royal-500/10 px-3 py-1 text-[11px] font-semibold text-royal-300">
              <Sparkles className="w-3.5 h-3.5 text-royal-400" />
              <span>Authentic Handloom Heritage • Tested Pure Zari</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-tight text-white leading-tight">
              Timeless Weaves for Sacred Moments & Royal Celebrations.
            </h1>

            <p className="text-xs sm:text-sm text-brand-300 max-w-xl leading-relaxed">
              Explore masterwoven Kanjivaram silks, Kadwa Banarasi brocades, and feather-light organza sarees. Curated directly from artisan clusters with live AI shopping assistance and guaranteed pan-India express delivery.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href="/shop">
                <Button variant="gold" size="md" className="gap-2">
                  <span>Explore Catalog</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <a href={whatsappInquiryUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="md" className="bg-transparent text-white border-brand-700 hover:bg-brand-800 gap-2">
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>Artisan WhatsApp Video Call</span>
                </Button>
              </a>
            </div>

            {/* Micro Highlights */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-brand-800/80 text-[11px] text-brand-300">
              <div>
                <p className="font-bold text-white text-sm">100%</p>
                <p className="text-brand-400">Pure Silk Tested</p>
              </div>
              <div>
                <p className="font-bold text-white text-sm">7-Day</p>
                <p className="text-brand-400">Doorstep Exchange</p>
              </div>
              <div>
                <p className="font-bold text-white text-sm">Free Express</p>
                <p className="text-brand-400">Over ₹1,999</p>
              </div>
            </div>
          </div>

          {/* Hero Visual Collage */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3">
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden border border-brand-700/80 shadow-xl group">
              <Image
                src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=700"
                alt="Bridal Kanjivaram Silk"
                fill
                priority
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-950/80 via-transparent to-transparent flex items-end p-3">
                <span className="text-xs font-semibold text-white">Pure Kanjivaram Weave</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="relative aspect-square rounded-lg overflow-hidden border border-brand-700/80 shadow-md group">
                <Image
                  src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=600"
                  alt="Banarasi Brocade Silk"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-950/80 via-transparent to-transparent flex items-end p-2.5">
                  <span className="text-[11px] font-semibold text-white">Banarasi Kadwa</span>
                </div>
              </div>

              <div className="relative aspect-square rounded-lg overflow-hidden border border-brand-700/80 shadow-md group">
                <Image
                  src="https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=600"
                  alt="Floral Organza Saree"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-950/80 via-transparent to-transparent flex items-end p-2.5">
                  <span className="text-[11px] font-semibold text-white">Scalloped Organza</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-serif font-bold text-brand-950">
              Curated Handloom Weaves
            </h2>
            <p className="text-xs text-brand-500">
              Hand-picked from regional weaving heritage clusters across India
            </p>
          </div>
          <Link href="/shop" className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group relative flex flex-col overflow-hidden rounded-lg border border-brand-200 bg-white shadow-2xs hover:border-brand-300 hover:shadow-card transition-all"
            >
              <div className="relative aspect-square w-full overflow-hidden bg-brand-100">
                <Image
                  src={cat.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=400'}
                  alt={cat.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-2.5 text-center">
                <h3 className="text-xs font-semibold text-brand-900 group-hover:text-primary-700 truncate">
                  {cat.name}
                </h3>
                <p className="text-[10px] text-brand-400 mt-0.5">
                  {cat._count?.products || 'Curated'} styles
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. FEATURED PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-royal-700 bg-royal-100/60 px-2 py-0.5 rounded mb-1">
              <Award className="w-3 h-3" /> Masterpiece Selection
            </div>
            <h2 className="text-base sm:text-lg font-serif font-bold text-brand-950">
              Featured Bridal & Celebration Sarees
            </h2>
          </div>
          <Link href="/shop?featured=true" className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
            <span>See more</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 5 & 6. BEST SELLERS & NEW ARRIVALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary-700 bg-primary-100/60 px-2 py-0.5 rounded mb-1">
              <Sparkles className="w-3 h-3" /> Most Loved
            </div>
            <h2 className="text-base sm:text-lg font-serif font-bold text-brand-950">
              Customer Bestsellers
            </h2>
          </div>
          <Link href="/shop?bestseller=true" className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
            <span>Explore all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
          {bestsellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 7 & 8. WHY CHOOSE US & CUSTOMER BENEFITS */}
      <section className="bg-brand-50/70 border-y border-brand-200/80 py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="text-base sm:text-lg font-serif font-bold text-brand-950">
              The Royal Saree & TechWave Assurance
            </h2>
            <p className="text-xs text-brand-500 mt-1">
              Experience the trust of authentic generational craftsmanship combined with modern tech-enabled ordering.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-lg border border-brand-200 bg-white p-4 shadow-2xs">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-royal-100 text-royal-700 mb-3">
                <Award className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-brand-900 mb-1">100% Tested Pure Zari</h3>
              <p className="text-[11px] text-brand-500 leading-relaxed">
                Certified pure silver & gold electroplated zari threads with zero synthetic substitutes.
              </p>
            </div>

            <div className="rounded-lg border border-brand-200 bg-white p-4 shadow-2xs">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-100 text-primary-700 mb-3">
                <Truck className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-brand-900 mb-1">Insured Express Courier</h3>
              <p className="text-[11px] text-brand-500 leading-relaxed">
                Free shipping above ₹1,999 with tamper-proof seal packaging & live SMS status updates.
              </p>
            </div>

            <div className="rounded-lg border border-brand-200 bg-white p-4 shadow-2xs">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-100 text-emerald-700 mb-3">
                <RotateCcw className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-brand-900 mb-1">7-Day Doorstep Returns</h3>
              <p className="text-[11px] text-brand-500 leading-relaxed">
                No questions asked reverse pickup with immediate refund credit upon inspection.
              </p>
            </div>

            <div className="rounded-lg border border-brand-200 bg-white p-4 shadow-2xs">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-100 text-purple-700 mb-3">
                <Scissors className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-brand-900 mb-1">Custom Designer Blouse</h3>
              <p className="text-[11px] text-brand-500 leading-relaxed">
                Order unstitched or have master artisans stitch custom necklines and maggam work.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. AI SHOPPING ASSISTANT INTRO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="rounded-xl border border-brand-800 bg-gradient-to-r from-brand-950 via-brand-900 to-primary-950 text-white p-6 sm:p-8 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7 space-y-3">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-royal-500/20 border border-royal-500/40 px-2.5 py-0.5 text-[10px] font-semibold text-royal-300">
                <Sparkles className="w-3 h-3 text-royal-400" />
                <span>Next-Gen Commerce Technology</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
                Meet Your AI Saree & Fashion Stylist
              </h2>
              <p className="text-xs text-brand-300 leading-relaxed max-w-lg">
                Searching for a specific saree? Need real-time order tracking? Our AI Assistant connects directly to our warehouse inventory. Ask natural questions like <em>"Do you have red bridal sarees under ₹15,000?"</em> or <em>"Where is my order TW-ORD-10021?"</em>
              </p>
              <div className="pt-2 flex flex-wrap gap-2">
                <span className="text-[11px] font-mono bg-brand-900/80 border border-brand-700 px-2.5 py-1 rounded text-royal-300">
                  Try asking: &quot;Show me Organza sarees under ₹5,000&quot;
                </span>
                <span className="text-[11px] font-mono bg-brand-900/80 border border-brand-700 px-2.5 py-1 rounded text-brand-300">
                  Try asking: &quot;Where is my order?&quot;
                </span>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white/10 backdrop-blur-md rounded-lg border border-white/10 p-4 space-y-3">
              <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-semibold text-white">AI Assistant Live Demo</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="bg-primary-600/90 text-white rounded-lg rounded-br-none p-2.5 ml-6">
                  Do you have Kanjivaram silk sarees in red with temple borders?
                </div>
                <div className="bg-white/95 text-brand-950 rounded-lg rounded-bl-none p-2.5 mr-4 shadow-sm">
                  Yes! We have the <strong>Royal Crimson Kanjivaram</strong> with pure gold zari temple borders for ₹14,999. In stock with complimentary blouse piece!
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-md mx-auto mb-6">
          <h2 className="text-base sm:text-lg font-serif font-bold text-brand-950">
            Loved by Brides & Saree Connoisseurs
          </h2>
          <p className="text-xs text-brand-500">Real feedback from verified patrons across India</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg border border-brand-200 bg-white p-4 shadow-2xs">
            <div className="flex text-royal-500 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-royal-500 text-royal-500" />
              ))}
            </div>
            <p className="text-xs text-brand-700 italic leading-relaxed mb-3">
              &quot;Ordered the Royal Crimson Kanjivaram for my wedding reception. The zari weight and drape are sublime. Arrived in 3 days in Kolkata!&quot;
            </p>
            <div className="flex items-center justify-between text-[11px] pt-2 border-t border-brand-100">
              <span className="font-semibold text-brand-900">Ananya Sengupta</span>
              <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded text-[10px] font-medium">Verified Buyer</span>
            </div>
          </div>

          <div className="rounded-lg border border-brand-200 bg-white p-4 shadow-2xs">
            <div className="flex text-royal-500 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-royal-500 text-royal-500" />
              ))}
            </div>
            <p className="text-xs text-brand-700 italic leading-relaxed mb-3">
              &quot;The Kadwa Banarasi weaving is genuine—no itchy floating threads on the reverse. Royal Navy color got non-stop compliments at our dinner!&quot;
            </p>
            <div className="flex items-center justify-between text-[11px] pt-2 border-t border-brand-100">
              <span className="font-semibold text-brand-900">Meenakshi Iyer</span>
              <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded text-[10px] font-medium">Verified Buyer</span>
            </div>
          </div>

          <div className="rounded-lg border border-brand-200 bg-white p-4 shadow-2xs">
            <div className="flex text-royal-500 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-royal-500 text-royal-500" />
              ))}
            </div>
            <p className="text-xs text-brand-700 italic leading-relaxed mb-3">
              &quot;The powder blue organza didn’t puff up awkwardly at all. So lightweight and photograph-ready for day celebrations.&quot;
            </p>
            <div className="flex items-center justify-between text-[11px] pt-2 border-t border-brand-100">
              <span className="font-semibold text-brand-900">Rohini Deshmukh</span>
              <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded text-[10px] font-medium">Verified Buyer</span>
            </div>
          </div>
        </div>
      </section>

      {/* 11. CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="rounded-lg border border-brand-200 bg-brand-100/50 p-6 sm:p-8 text-center max-w-3xl mx-auto">
          <h2 className="text-lg sm:text-xl font-serif font-bold text-brand-950 mb-2">
            Experience the Royal Saree Difference Today
          </h2>
          <p className="text-xs text-brand-600 max-w-lg mx-auto mb-4 leading-relaxed">
            Join thousands of satisfied connoisseurs enjoying heirloom weaves, transparent artisan pricing, and Razorpay-secured payments.
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/shop">
              <Button variant="primary" size="md">
                Browse Full Catalog
              </Button>
            </Link>
            <Link href="/track-order">
              <Button variant="outline" size="md">
                Track Existing Order
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
