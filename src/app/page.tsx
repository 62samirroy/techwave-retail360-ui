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
      {/* 1 & 2. HERO SECTION - Editorial Luxury Aesthetic (Exact Match to Design Screenshot) */}
      <section className="relative overflow-hidden bg-[#FAF8F5] pt-6 sm:pt-10 lg:pt-14 pb-14 sm:pb-20 px-6 sm:px-10 lg:px-16">
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Hero Copy Left */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-8">
            <h1 className="text-5xl sm:text-6xl lg:text-[70px] font-serif text-[#18181B] tracking-tight leading-[1.08]">
              Discover <br />
              <span className="italic font-serif text-[#9333EA]">elegance.</span> <br />
              Shop with <br />
              confidence.
            </h1>

            <p className="text-sm sm:text-base text-stone-600 max-w-md leading-relaxed font-normal">
              Explore sarees chosen for the moments you&apos;ll remember. Order online, pay securely, and get every piece delivered with care.
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <Link href="/shop">
                <button className="inline-flex items-center gap-2 rounded-full bg-[#18181B] hover:bg-black text-white px-7 py-3.5 text-sm font-medium transition-all shadow-sm hover:shadow-md group">
                  <span>Shop the collection</span>
                  <span className="text-base group-hover:translate-x-0.5 transition-transform">→</span>
                </button>
              </Link>
              <Link href="/shop">
                <button className="inline-flex items-center gap-2 rounded-full bg-[#EFECE6] hover:bg-[#E5E1D9] text-[#18181B] px-7 py-3.5 text-sm font-medium transition-all">
                  <span>Explore new arrivals</span>
                </button>
              </Link>
            </div>

            {/* Trust Metrics */}
            <div className="pt-8 border-t border-stone-200/80 flex items-center gap-12 sm:gap-16">
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
              <div className="relative aspect-[4/4.8] w-full rounded-[38px] overflow-hidden shadow-2xl bg-stone-900 border border-stone-800/10">
                <Image
                  src="https://images.pexels.com/photos/30249383/pexels-photo-30249383.jpeg"
                  alt="Noor Silk Edit"
                  fill
                  priority
                  className="object-cover object-top"
                />

                {/* Internal Frosted Badge - Featured Edit */}
                <div className="absolute bottom-6 left-6 z-10 rounded-2xl bg-white/95 backdrop-blur-md px-5 py-4 shadow-xl border border-white/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#9333EA] block">
                    FEATURED EDIT
                  </span>
                  <h3 className="font-serif text-lg font-semibold text-[#18181B] mt-0.5">
                    Noor Silk Edit
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Soft light. Rich detail
                  </p>
                </div>
              </div>

              {/* Floating Bottom Edge Badge: Quality Checked */}
              <div className="absolute -bottom-3.5 right-6 sm:right-10 z-20 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 shadow-xl border border-stone-200/80">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <Check className="w-3 h-3 stroke-[3]" />
                </span>
                <span className="text-xs font-semibold text-stone-800">Quality checked</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED CATEGORIES - Royal Handloom Collections */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-serif font-bold text-[#211B26]">
              Curated Royal Handlooms
            </h2>
            <p className="text-xs text-stone-500">
              Masterwoven treasures from Varanasi, Kanchipuram, and royal artisan hubs
            </p>
          </div>
          <Link href="/shop" className="text-xs font-semibold text-[#9333EA] hover:text-purple-800 flex items-center gap-1">
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {categories.map((cat, idx) => {
            const royalImages: Record<string, string> = {
              'kanjivaram-silk': '/images/products/saree-crimson-royal.jpg',
              'banarasi-brocade': '/images/products/saree-navy-kadwa.jpg',
              'organza-floral': '/images/products/saree-organza-lotus.jpg',
              'chanderi-linen': '/images/products/saree-rose-tanchoi.jpg',
              'bandhani-leheriya': '/images/products/saree-bandhani-gharchola.jpg',
              'party-cocktail-wear': '/images/products/saree-emerald-peacock.jpg',
            };
            const fallbackImages = [
              '/images/products/saree-crimson-royal.jpg',
              '/images/products/saree-navy-kadwa.jpg',
              '/images/products/saree-organza-lotus.jpg',
              '/images/products/saree-rose-tanchoi.jpg',
              '/images/products/saree-bandhani-gharchola.jpg',
              '/images/products/saree-emerald-peacock.jpg',
            ];
            const imgSrc = royalImages[cat.slug] || fallbackImages[idx % fallbackImages.length];

            return (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#E8E2D8] bg-white shadow-xs hover:border-[#9333EA]/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-100">
                  <Image
                    src={imgSrc}
                    alt={cat.name}
                    fill
                    className="object-cover object-top group-hover:scale-108 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#211B26]/60 via-transparent to-transparent opacity-50 group-hover:opacity-30 transition-opacity" />
                </div>
                <div className="p-3 text-center">
                  <h3 className="text-xs sm:text-sm font-serif font-bold text-[#211B26] group-hover:text-[#9333EA] transition-colors truncate">
                    {cat.name}
                  </h3>
                  <p className="text-[10px] text-stone-500 mt-0.5">
                    {cat._count?.products || 'Curated'} Weaves
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. FEATURED PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#9333EA] bg-purple-50 px-2 py-0.5 rounded-full mb-1">
              <Award className="w-3 h-3" /> Masterpiece Selection
            </div>
            <h2 className="text-lg sm:text-xl font-serif font-bold text-[#211B26]">
              Featured Bridal &amp; Celebration Sarees
            </h2>
          </div>
          <Link href="/shop?featured=true" className="text-xs font-semibold text-[#9333EA] hover:text-purple-800 flex items-center gap-1">
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
            <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full mb-1">
              <Sparkles className="w-3 h-3" /> Most Loved
            </div>
            <h2 className="text-lg sm:text-xl font-serif font-bold text-[#211B26]">
              Customer Bestsellers
            </h2>
          </div>
          <Link href="/shop?bestseller=true" className="text-xs font-semibold text-[#9333EA] hover:text-purple-800 flex items-center gap-1">
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
            <h2 className="text-lg sm:text-xl font-serif font-bold text-[#211B26]">
              The Royal Saree &amp; TechWave Assurance
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
              <h3 className="text-xs font-bold text-[#211B26] mb-1">100% Tested Pure Zari</h3>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                Certified pure silver & gold electroplated zari threads with zero synthetic substitutes.
              </p>
            </div>

            <div className="rounded-xl border border-[#E8E2D8] bg-white p-5 shadow-xs">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-100 text-[#211B26] mb-3">
                <Truck className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-[#211B26] mb-1">Insured Express Courier</h3>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                Free shipping above ₹1,999 with tamper-proof seal packaging & live SMS status updates.
              </p>
            </div>

            <div className="rounded-xl border border-[#E8E2D8] bg-white p-5 shadow-xs">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 mb-3">
                <RotateCcw className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-[#211B26] mb-1">7-Day Doorstep Returns</h3>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                No questions asked reverse pickup with immediate refund credit upon inspection.
              </p>
            </div>

            <div className="rounded-xl border border-[#E8E2D8] bg-white p-5 shadow-xs">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-50 text-[#9333EA] mb-3">
                <Scissors className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-[#211B26] mb-1">Custom Designer Blouse</h3>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                Order unstitched or have master artisans stitch custom necklines and maggam work.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. AI SHOPPING ASSISTANT INTRO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl border border-[#3A2F42] bg-[#211B26] text-white p-6 sm:p-10 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7 space-y-3">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#9333EA]/30 border border-[#9333EA]/40 px-3 py-1 text-[11px] font-semibold text-purple-200">
                <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                <span>Next-Gen Heritage Technology</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
                Meet Your Royal AI Saree &amp; Fashion Stylist
              </h2>
              <p className="text-xs text-stone-300 leading-relaxed max-w-lg">
                Searching for a specific weave? Need real-time order tracking? Our AI Stylist connects directly to our Varanasi inventory. Ask natural questions like <em>&quot;Show me Kanjivaram bridal sarees in red&quot;</em> or <em>&quot;Where is my order?&quot;</em>
              </p>
              <div className="pt-2 flex flex-wrap gap-2">
                <span className="text-[11px] font-mono bg-white/10 border border-white/10 px-2.5 py-1 rounded-full text-purple-200">
                  Try asking: &quot;Show me Organza sarees under ₹5,000&quot;
                </span>
                <span className="text-[11px] font-mono bg-white/10 border border-white/10 px-2.5 py-1 rounded-full text-stone-300">
                  Try asking: &quot;Where is my order?&quot;
                </span>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-4 space-y-3">
              <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-semibold text-white">AI Assistant Live Demo</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="bg-[#9333EA] text-white rounded-xl rounded-br-none p-2.5 ml-6 shadow-sm">
                  Do you have Kanjivaram silk sarees in crimson red with pure gold temple borders?
                </div>
                <div className="bg-white/95 text-[#211B26] rounded-xl rounded-bl-none p-2.5 mr-4 shadow-sm">
                  Yes! We have the <strong>Royal Crimson Kanjivaram</strong> with pure gold zari temple borders for ₹14,999. In stock with complimentary silk blouse piece!
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-md mx-auto mb-6">
          <h2 className="text-lg sm:text-xl font-serif font-bold text-[#211B26]">
            Loved by Brides &amp; Saree Connoisseurs
          </h2>
          <p className="text-xs text-stone-500">Real feedback from verified patrons across India</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-[#E8E2D8] bg-white p-5 shadow-xs">
            <div className="flex text-amber-400 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-xs text-stone-700 italic leading-relaxed mb-3">
              &quot;Ordered the Royal Crimson Kanjivaram for my wedding reception. The zari weight and drape are sublime. Arrived in 3 days in Kolkata!&quot;
            </p>
            <div className="flex items-center justify-between text-[11px] pt-2 border-t border-[#F0EBE3]">
              <span className="font-semibold text-[#211B26]">Ananya Sengupta</span>
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-medium">Verified Bride</span>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E8E2D8] bg-white p-5 shadow-xs">
            <div className="flex text-amber-400 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-xs text-stone-700 italic leading-relaxed mb-3">
              &quot;The Kadwa Banarasi weaving is genuine—no itchy floating threads on the reverse. Royal Navy color got non-stop compliments at our dinner!&quot;
            </p>
            <div className="flex items-center justify-between text-[11px] pt-2 border-t border-[#F0EBE3]">
              <span className="font-semibold text-[#211B26]">Meenakshi Iyer</span>
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-medium">Verified Buyer</span>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E8E2D8] bg-white p-5 shadow-xs">
            <div className="flex text-amber-400 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-xs text-stone-700 italic leading-relaxed mb-3">
              &quot;The powder blue organza didn’t puff up awkwardly at all. So lightweight and photograph-ready for day celebrations.&quot;
            </p>
            <div className="flex items-center justify-between text-[11px] pt-2 border-t border-[#F0EBE3]">
              <span className="font-semibold text-[#211B26]">Rohini Deshmukh</span>
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-medium">Verified Buyer</span>
            </div>
          </div>
        </div>
      </section>

      {/* 11. CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl border border-[#E8E2D8] bg-[#F5F1EB] p-8 sm:p-12 text-center max-w-3xl mx-auto shadow-xs">
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#211B26] mb-2">
            Experience the Royal Saree Difference Today
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 max-w-lg mx-auto mb-6 leading-relaxed">
            Join thousands of satisfied connoisseurs enjoying heirloom weaves, transparent artisan pricing, and Razorpay-secured payments.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/shop">
              <button className="rounded-full bg-[#211B26] hover:bg-[#151118] text-white px-7 py-3 text-sm font-medium transition-all shadow-sm">
                Browse Full Catalog
              </button>
            </Link>
            <Link href="/track-order">
              <button className="rounded-full bg-white hover:bg-stone-100 border border-stone-300 text-[#211B26] px-7 py-3 text-sm font-medium transition-all">
                Track Existing Order
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
