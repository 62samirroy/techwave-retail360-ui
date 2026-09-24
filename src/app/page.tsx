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
  Check,
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
      {/* 1 & 2. HERO SECTION - Editorial Luxury Aesthetic */}
      <section className="relative overflow-hidden bg-[#FAF8F5] pt-4 sm:pt-8 lg:pt-12 pb-12 sm:pb-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Hero Copy Left */}
          <div className="lg:col-span-6 space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-[62px] font-serif text-[#18181B] tracking-tight leading-[1.12]">
              Discover <br />
              <span className="italic font-serif text-[#9333EA]">elegance.</span> <br />
              Shop with <br />
              confidence.
            </h1>

            <p className="text-sm sm:text-base text-stone-600 max-w-md leading-relaxed">
              Explore sarees chosen for the moments you&apos;ll remember. Order online, pay securely, and get every piece delivered with care.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link href="/shop">
                <button className="inline-flex items-center gap-2 rounded-full bg-[#18181B] hover:bg-black text-white px-7 py-3.5 text-sm font-medium transition-all shadow-sm group">
                  <span>Shop the collection</span>
                  <span className="text-base group-hover:translate-x-0.5 transition-transform">→</span>
                </button>
              </Link>
              <Link href="/shop">
                <button className="inline-flex items-center gap-2 rounded-full bg-[#EFECE6] hover:bg-[#E5E1D9] text-stone-800 px-7 py-3.5 text-sm font-medium transition-all">
                  <span>Explore new arrivals</span>
                </button>
              </Link>
            </div>

            {/* Trust Metrics */}
            <div className="pt-8 border-t border-stone-200/80 flex items-center gap-12">
              <div>
                <p className="text-xl sm:text-2xl font-bold text-[#18181B] leading-none">4.9/5</p>
                <p className="text-xs text-stone-500 mt-1.5 font-medium">2,400+ happy drapes</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-[#18181B] leading-none">48 hrs</p>
                <p className="text-xs text-stone-500 mt-1.5 font-medium">dispatch promise</p>
              </div>
            </div>
          </div>

          {/* Hero Visual Right */}
          <div className="lg:col-span-6 relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[500px]">
              {/* Main Rounded Portrait Card */}
              <div className="relative aspect-[4/4.8] w-full rounded-[36px] overflow-hidden shadow-2xl bg-stone-900 border border-stone-800/10">
                <Image
                  src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=85&w=1200"
                  alt="Noor Silk Edit"
                  fill
                  priority
                  className="object-cover object-top"
                />

                {/* Internal Frosted Badge - Featured Edit */}
                <div className="absolute bottom-6 left-6 z-10 rounded-2xl bg-white/95 backdrop-blur-md px-5 py-3.5 shadow-lg border border-white/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#9333EA] block">
                    FEATURED EDIT
                  </span>
                  <h3 className="font-serif text-base font-semibold text-[#18181B] mt-0.5">
                    Noor Silk Edit
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Soft light, Rich detail
                  </p>
                </div>
              </div>

              {/* Floating Bottom Edge Badge: Quality Checked */}
              <div className="absolute -bottom-3 right-6 sm:right-10 z-20 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-lg border border-stone-200/80">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </span>
                <span className="text-xs font-semibold text-stone-800">Quality checked</span>
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
      <section className="bg-[#F5F1EB] border-y border-[#E8E2D8] py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="text-lg sm:text-xl font-serif font-bold text-[#18181B]">
              The Royal Saree & TechWave Assurance
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Experience the trust of authentic generational craftsmanship combined with modern tech-enabled ordering.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-[#E8E2D8] bg-white p-5 shadow-xs">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-50 text-[#9333EA] mb-3">
                <Award className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-stone-900 mb-1">100% Tested Pure Zari</h3>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                Certified pure silver & gold electroplated zari threads with zero synthetic substitutes.
              </p>
            </div>

            <div className="rounded-xl border border-[#E8E2D8] bg-white p-5 shadow-xs">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-100 text-stone-800 mb-3">
                <Truck className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-stone-900 mb-1">Insured Express Courier</h3>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                Free shipping above ₹1,999 with tamper-proof seal packaging & live SMS status updates.
              </p>
            </div>

            <div className="rounded-xl border border-[#E8E2D8] bg-white p-5 shadow-xs">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 mb-3">
                <RotateCcw className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-stone-900 mb-1">7-Day Doorstep Returns</h3>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                No questions asked reverse pickup with immediate refund credit upon inspection.
              </p>
            </div>

            <div className="rounded-xl border border-[#E8E2D8] bg-white p-5 shadow-xs">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-50 text-[#9333EA] mb-3">
                <Scissors className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-stone-900 mb-1">Custom Designer Blouse</h3>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                Order unstitched or have master artisans stitch custom necklines and maggam work.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. AI SHOPPING ASSISTANT INTRO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="rounded-2xl border border-stone-800 bg-[#18181B] text-white p-6 sm:p-10 shadow-xl">
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
        <div className="rounded-3xl border border-[#E8E2D8] bg-[#F5F1EB] p-8 sm:p-12 text-center max-w-3xl mx-auto shadow-xs">
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#18181B] mb-2">
            Experience the Royal Saree Difference Today
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 max-w-lg mx-auto mb-6 leading-relaxed">
            Join thousands of satisfied connoisseurs enjoying heirloom weaves, transparent artisan pricing, and Razorpay-secured payments.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/shop">
              <button className="rounded-full bg-[#18181B] hover:bg-black text-white px-7 py-3 text-sm font-medium transition-all shadow-sm">
                Browse Full Catalog
              </button>
            </Link>
            <Link href="/track-order">
              <button className="rounded-full bg-white hover:bg-stone-100 border border-stone-300 text-stone-800 px-7 py-3 text-sm font-medium transition-all">
                Track Existing Order
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
