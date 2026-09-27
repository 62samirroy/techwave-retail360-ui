'use client';

import React, { useEffect, useState, useRef } from 'react';
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
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  Phone,
  Video,
  Calendar,
  X,
  Heart,
  ShoppingBag,
  Play,
  Pause,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { ProductCard } from '@/components/shop/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/LoadingState';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { RoyalArchCard } from '@/components/shop/RoyalArchCard';
import { api } from '@/lib/api';
import { ProductData, CategoryData } from '@/types';
import { APP_CONFIG } from '@/lib/constants';
import { buildWhatsAppLink, cn } from '@/lib/utils';

export default function HomePage() {
  const [allProducts, setAllProducts] = useState<ProductData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  // Hero carousel state
  const [heroIndex, setHeroIndex] = useState(0);

  // Video Showcase Banner State
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isVideoMuted, setIsVideoMuted] = useState(true);

  const toggleVideoPlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsVideoPlaying(true);
    } else {
      videoRef.current.pause();
      setIsVideoPlaying(false);
    }
  };

  const toggleVideoMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsVideoMuted(videoRef.current.muted);
  };

  // Fabric & Weave Carousel Pagination State (Matching screenshot 3 dots)
  const [fabricPageIndex, setFabricPageIndex] = useState(0);

  // New Arrivals filter tab state
  const [arrivalTab, setArrivalTab] = useState<'all' | 'bridal' | 'festive' | 'lightweight'>('all');

  // Kanchipuram sub-tab state
  const [kanjiTab, setKanjiTab] = useState<'korvai' | 'bridal' | 'pastel' | 'light'>('korvai');

  // New Arrivals horizontal scroll ref
  const arrivalScrollRef = useRef<HTMLDivElement>(null);
  const kanjiScrollRef = useRef<HTMLDivElement>(null);

  // Store Appointment Modal State
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [appointmentType, setAppointmentType] = useState<'in_store' | 'video_call'>('in_store');
  const [appointmentName, setAppointmentName] = useState('');
  const [appointmentPhone, setAppointmentPhone] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentBooked, setAppointmentBooked] = useState(false);

  // Quick Add To Bag state
  const [addedItemName, setAddedItemName] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.getProducts({ limit: 24 }),
          api.getCategories(),
        ]);

        if (prodRes.success && prodRes.data?.products) {
          setAllProducts(prodRes.data.products);
        }

        if (catRes.success && catRes.data) {
          setCategories(catRes.data);
        }
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Hero Slides matching screenshot with generated photorealistic luxury banners
  const heroSlides = [
    {
      id: 1,
      title: 'The Grand Bridal & Heritage Showcase',
      subtitle: 'The eternal charm of authentic handloom silk sarees curated by Retail 360°, woven with pure gold zari and generational artistry.',
      image: '/hero-banner-1.jpg',
      ctaText: 'SHOP NOW',
      ctaLink: '/categories/kanjivaram-silk',
    },
    {
      id: 2,
      title: 'Kadwa Brocades & Varanasi Masterweaves',
      subtitle: 'Hand-interlocked floral jaal and antique meenakari motifs handcrafted on generational pit looms.',
      image: '/hero-banner-2.jpg',
      ctaText: 'SHOP NOW',
      ctaLink: '/categories/banarasi-brocade',
    },
    {
      id: 3,
      title: 'Ethereal Pastels & Organza Tissue Silks',
      subtitle: 'Airy silhouettes adorned with delicate gota patti borders and botanical foil zari drapes.',
      image: '/hero-banner-3.jpg',
      ctaText: 'SHOP NOW',
      ctaLink: '/categories/organza-floral',
    },
  ];

  // Auto-advance hero carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const handlePrevHero = () => {
    setHeroIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };
  const handleNextHero = () => {
    setHeroIndex((prev) => (prev + 1) % heroSlides.length);
  };

  // Auto-scroll states for horizontal sliders
  const [arrivalsPaused, setArrivalsPaused] = useState(false);
  const [kanjiPaused, setKanjiPaused] = useState(false);

  // Scroll helper by exact card step so cards never get cut off or half-visible
  const scrollCarouselStep = (
    ref: React.RefObject<HTMLDivElement | null>,
    direction: 'left' | 'right'
  ) => {
    if (!ref.current) return;
    const container = ref.current;
    const firstCard = container.querySelector('[data-card-item]') as HTMLElement;
    const step = firstCard ? firstCard.getBoundingClientRect().width + 16 : 280;
    const currentScroll = container.scrollLeft;
    const target = direction === 'left'
      ? Math.max(0, currentScroll - step)
      : currentScroll + step;
    container.scrollTo({ left: target, behavior: 'smooth' });
  };

  // Auto-scroll New Arrivals slider (loops infinitely by clean card steps)
  useEffect(() => {
    if (arrivalsPaused || loading) return;
    const interval = setInterval(() => {
      if (arrivalScrollRef.current) {
        const el = arrivalScrollRef.current;
        const { scrollLeft, scrollWidth, clientWidth } = el;
        const firstCard = el.querySelector('[data-card-item]') as HTMLElement;
        const step = firstCard ? firstCard.getBoundingClientRect().width + 16 : 280;
        if (scrollLeft + clientWidth >= scrollWidth - 15) {
          el.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          el.scrollTo({ left: scrollLeft + step, behavior: 'smooth' });
        }
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [arrivalsPaused, loading]);

  // Auto-scroll Kanchipuram slider (loops infinitely by clean card steps)
  useEffect(() => {
    if (kanjiPaused || loading) return;
    const interval = setInterval(() => {
      if (kanjiScrollRef.current) {
        const el = kanjiScrollRef.current;
        const { scrollLeft, scrollWidth, clientWidth } = el;
        const firstCard = el.querySelector('[data-card-item]') as HTMLElement;
        const step = firstCard ? firstCard.getBoundingClientRect().width + 16 : 280;
        if (scrollLeft + clientWidth >= scrollWidth - 15) {
          el.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          el.scrollTo({ left: scrollLeft + step, behavior: 'smooth' });
        }
      }
    }, 4500);
    return () => clearInterval(interval);
  }, [kanjiPaused, loading]);

  // Scroll New Arrivals carousel manually
  const scrollArrivals = (direction: 'left' | 'right') => scrollCarouselStep(arrivalScrollRef, direction);

  // Scroll Kanchipuram carousel manually
  const scrollKanji = (direction: 'left' | 'right') => scrollCarouselStep(kanjiScrollRef, direction);

  // Filtered Products for Today's New Arrivals
  const filteredNewArrivals = React.useMemo(() => {
    return allProducts.filter((p) => {
      if (arrivalTab === 'bridal') {
        return (
          p.tags?.toLowerCase().includes('bridal') ||
          p.name.toLowerCase().includes('kanjivaram') ||
          p.name.toLowerCase().includes('crimson')
        );
      }
      if (arrivalTab === 'festive') {
        return (
          p.tags?.toLowerCase().includes('wedding') ||
          p.name.toLowerCase().includes('banarasi') ||
          p.name.toLowerCase().includes('kadwa')
        );
      }
      if (arrivalTab === 'lightweight') {
        return (
          p.name.toLowerCase().includes('chanderi') ||
          p.name.toLowerCase().includes('organza') ||
          p.name.toLowerCase().includes('linen')
        );
      }
      return true;
    });
  }, [allProducts, arrivalTab]);

  // Filtered Kanchipuram products
  const kanchipuramProducts = React.useMemo(() => {
    return allProducts.filter(
      (p) =>
        p.category === 'Kanjivaram Silk' ||
        (typeof p.category === 'object' && p.category?.slug === 'kanjivaram-silk') ||
        p.name.toLowerCase().includes('kanjivaram') ||
        p.name.toLowerCase().includes('silk')
    );
  }, [allProducts]);

  // Ready to ship products
  const readyToShipProducts = React.useMemo(() => {
    return allProducts.filter((p) => p.stock > 0).slice(0, 4);
  }, [allProducts]);

  // Store Booking Submit
  const handleStoreBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAppointmentBooked(true);
    setTimeout(() => {
      setAppointmentBooked(false);
      setSelectedStore(null);
      setAppointmentName('');
      setAppointmentPhone('');
      setAppointmentDate('');
    }, 4000);
  };

  return (
    <div className="space-y-14 pb-20 bg-white text-stone-900 font-sans">
      {/* ========================================================================= */}
      {/* 1. HERO SHOWCASE CAROUSEL (Maximum Image Clarity & Vibrant Saree Visibility) */}
      {/* ========================================================================= */}
      <section className="relative w-full overflow-hidden bg-stone-900 text-white">
        <div className="relative min-h-[460px] sm:min-h-[520px] lg:min-h-[560px] flex items-center">
          {heroSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={cn(
                'absolute inset-0 transition-opacity duration-1000 ease-in-out',
                index === heroIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              )}
            >
              {/* High-Res Background Image - Crystal Clear Visibility */}
              <div className="absolute inset-0">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  priority={index === 0}
                  className="object-cover object-center lg:object-top"
                />
                {/* Ultra-light localized gradient ONLY behind left text - 100% clear saree on right */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-transparent w-full sm:w-2/3" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent h-28 bottom-0 top-auto" />
              </div>

              {/* Slide Content Overlay with crisp text shadows */}
              <div className="relative z-20 max-w-7xl mx-auto h-full flex flex-col justify-center px-6 sm:px-12 py-16">
                <div className="max-w-xl space-y-4">
                  {/* Brand Badge in exact font-serif font-bold style */}
                  <div className="inline-flex items-center gap-2 rounded-full bg-black/40 backdrop-blur-md border border-[#d4af37]/60 px-4 py-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#d4af37] animate-pulse" />
                    <span className="text-xs sm:text-sm font-serif font-bold tracking-wider text-[#fde68a] uppercase">
                      Royal Saree &amp; Family
                    </span>
                  </div>

                  {/* Showcase Title */}
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight leading-tight drop-shadow-[0_3px_6px_rgba(0,0,0,0.9)]">
                    {slide.title}
                  </h2>

                  {/* Subtitle */}
                  <p className="text-xs sm:text-sm text-stone-100 leading-relaxed font-medium max-w-md drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                    {slide.subtitle}
                  </p>

                  {/* Modified Premium Shop Now Button */}
                  <div className="pt-2">
                    <Link href={slide.ctaLink} className="inline-block group">
                      <button className="inline-flex items-center gap-2.5 rounded-full bg-white hover:bg-[#FAF8F5] text-[#540924] font-bold px-8 py-3 text-xs tracking-widest uppercase transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 border-2 border-[#d4af37]">
                        <span>{slide.ctaText}</span>
                        <ArrowRight className="w-4 h-4 text-[#b48325] transition-transform duration-300 group-hover:translate-x-1 stroke-[2.5]" />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Carousel Navigation Arrows matching screenshot */}
          <button
            onClick={handlePrevHero}
            aria-label="Previous slide"
            className="absolute left-4 z-30 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white border border-white/20 backdrop-blur-md transition-all hover:scale-105"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={handleNextHero}
            aria-label="Next slide"
            className="absolute right-4 z-30 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white border border-white/20 backdrop-blur-md transition-all hover:scale-105"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Carousel Slide Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setHeroIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  i === heroIndex ? 'w-6 bg-[#d4af37]' : 'w-1.5 bg-white/40 hover:bg-white/70'
                )}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Quick Add To Cart Floating Notification */}
      {addedItemName && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-[#540924] text-white p-4 shadow-2xl border border-[#d4af37]/40 flex items-center gap-3 animate-in fade-in slide-in-from-bottom duration-300">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d4af37] text-[#380419]">
            <Check className="w-4 h-4 stroke-[3]" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">Added to Shopping Bag</p>
            <p className="text-[11px] text-rose-200 line-clamp-1">{addedItemName}</p>
          </div>
          <Link href="/cart">
            <button className="ml-2 rounded-full bg-[#d4af37] text-[#380419] font-bold px-3 py-1.5 text-[11px] hover:bg-white transition-colors">
              View Cart
            </button>
          </Link>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TODAY'S NEW ARRIVALS (Exact Split Layout from Screenshot) */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header with Wine Subtitle Links and Filter Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-stone-200 pb-3 mb-6 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
              Today&apos;s New Arrivals
            </h2>
            <div className="flex items-center gap-2 text-xs text-[#540924] font-medium mt-1">
              <Link href="/shop" className="hover:underline">View All New Arrivals</Link>
              <span>|</span>
              <Link href="/categories/kanjivaram-silk" className="hover:underline">Pure Kanchipuram Silks</Link>
              <span>|</span>
              <Link href="/shop?search=soft+silk" className="hover:underline">Soft Silk Sarees</Link>
            </div>
          </div>

          {/* Sub-Tabs: All | Bridal & Festive | Casual & Party | Lightweight & Daily */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'bridal', label: 'Bridal & Festive' },
                { id: 'festive', label: 'Casual & Party' },
                { id: 'lightweight', label: 'Lightweight & Daily' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setArrivalTab(tab.id)}
                className={cn(
                  'rounded-full px-4 py-1.5 text-xs font-semibold whitespace-nowrap transition-all duration-200',
                  arrivalTab === tab.id
                    ? 'bg-[#540924] text-white shadow-xs'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                )}
              >
                {tab.label}
              </button>
            ))}

            <Link href="/shop" className="text-xs font-bold text-[#540924] hover:text-[#d4af37] ml-2 shrink-0">
              View All →
            </Link>
          </div>
        </div>

        {/* Split Layout: Curated Combos Left Card + Horizontal Saree Slider Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch relative">
          {/* Left Column: Curated Combos Feature Card matching screenshot */}
          <div className="lg:col-span-3 h-full min-h-[440px]">
            <div className="group relative h-full w-full rounded-2xl overflow-hidden shadow-md border border-stone-200 bg-stone-900 flex flex-col justify-end p-6">
              <Image
                src="https://images.pexels.com/photos/1162983/pexels-photo-1162983.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Curated Combos"
                fill
                className="object-cover object-top group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

              <div className="relative z-10 space-y-2">
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-white leading-tight">
                  Curated Combos
                </h3>
                <p className="text-[11px] text-stone-200 leading-relaxed font-normal">
                  Heirloom handloom sarees matched with contrast designer blouse pieces.
                </p>
                <Link href="/shop" className="inline-block pt-1">
                  <button className="rounded-full bg-white hover:bg-stone-100 text-stone-900 font-bold px-5 py-2 text-xs transition-all shadow-sm flex items-center gap-1.5 group-hover:translate-x-1">
                    <span>SHOP NOW</span>
                    <span>&gt;</span>
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Carousel of Folded Saree Cards with Left & Right Arrows & Clean Snap */}
          <div
            className="lg:col-span-9 relative flex flex-col justify-center overflow-hidden rounded-2xl p-1 min-w-0"
            onMouseEnter={() => setArrivalsPaused(true)}
            onMouseLeave={() => setArrivalsPaused(false)}
          >
            {/* Scroll Container with mandatory snap-x so cards never get stranded half-cut */}
            <div
              ref={arrivalScrollRef}
              className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-2 pt-1 snap-x snap-mandatory items-stretch"
            >
              {loading ? (
                [1, 2, 3, 4].map((i) => (
                  <div key={i} data-card-item className="w-[85vw] sm:w-[260px] sm:max-w-[270px] shrink-0 snap-center sm:snap-start">
                    <ProductCardSkeleton />
                  </div>
                ))
              ) : (
                filteredNewArrivals.slice(0, 10).map((product) => (
                  <div key={product.id} data-card-item className="w-[85vw] sm:w-[260px] sm:max-w-[270px] shrink-0 snap-center sm:snap-start">
                    <ProductCard product={product} />
                  </div>
                ))
              )}
            </div>

            {/* Left Navigation Arrow */}
            <button
              onClick={() => scrollArrivals('left')}
              aria-label="Scroll previous sarees"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/95 text-stone-800 shadow-xl border border-stone-200/90 hover:bg-[#540924] hover:text-white transition-all hover:scale-105 cursor-pointer backdrop-blur-xs"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Right Navigation Arrow */}
            <button
              onClick={() => scrollArrivals('right')}
              aria-label="Scroll next sarees"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/95 text-stone-800 shadow-xl border border-stone-200/90 hover:bg-[#540924] hover:text-white transition-all hover:scale-105 cursor-pointer backdrop-blur-xs"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. PURE KANCHIPURAM SILKS (Light Golden Silk Background & Ornate Border Design) */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-2 sm:px-6">
        <div className="rounded-3xl border-2 border-[#d4af37]/80 bg-gradient-to-b from-[#fffdf5] via-[#fef9e8] to-[#fffdf5] p-3 sm:p-10 shadow-sm relative overflow-hidden">
          
          {/* Ornate Gold Inset Border Line */}
          <div className="pointer-events-none absolute inset-2.5 sm:inset-3.5 rounded-2xl border border-[#d4af37]/45" />

          {/* Traditional Indian Gold Filigree Corner Brackets (All 4 Corners) */}
          {/* Top-Left */}
          <svg className="pointer-events-none absolute top-4 left-4 w-7 h-7 text-[#d4af37]" viewBox="0 0 40 40" fill="none">
            <path d="M 4 22 L 4 4 L 22 4" stroke="currentColor" strokeWidth="2.5" />
            <path d="M 8 18 L 8 8 L 18 8" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
            <circle cx="4" cy="4" r="2.5" fill="currentColor" />
            <path d="M 12 12 Q 17 12 17 17 Q 12 17 12 12 Z" fill="currentColor" opacity="0.6" />
          </svg>

          {/* Top-Right */}
          <svg className="pointer-events-none absolute top-4 right-4 w-7 h-7 text-[#d4af37]" viewBox="0 0 40 40" fill="none">
            <path d="M 36 22 L 36 4 L 18 4" stroke="currentColor" strokeWidth="2.5" />
            <path d="M 32 18 L 32 8 L 22 8" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
            <circle cx="36" cy="4" r="2.5" fill="currentColor" />
            <path d="M 28 12 Q 23 12 23 17 Q 28 17 28 12 Z" fill="currentColor" opacity="0.6" />
          </svg>

          {/* Bottom-Left */}
          <svg className="pointer-events-none absolute bottom-4 left-4 w-7 h-7 text-[#d4af37]" viewBox="0 0 40 40" fill="none">
            <path d="M 4 18 L 4 36 L 22 36" stroke="currentColor" strokeWidth="2.5" />
            <path d="M 8 22 L 8 32 L 18 32" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
            <circle cx="4" cy="36" r="2.5" fill="currentColor" />
            <path d="M 12 28 Q 17 28 17 23 Q 12 23 12 28 Z" fill="currentColor" opacity="0.6" />
          </svg>

          {/* Bottom-Right */}
          <svg className="pointer-events-none absolute bottom-4 right-4 w-7 h-7 text-[#d4af37]" viewBox="0 0 40 40" fill="none">
            <path d="M 36 18 L 36 36 L 18 36" stroke="currentColor" strokeWidth="2.5" />
            <path d="M 32 22 L 32 32 L 22 32" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
            <circle cx="36" cy="36" r="2.5" fill="currentColor" />
            <path d="M 28 28 Q 23 28 23 23 Q 28 23 28 28 Z" fill="currentColor" opacity="0.6" />
          </svg>

          {/* Central Ornate Gold Crest Accent */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="h-[1px] w-14 bg-gradient-to-r from-transparent to-[#d4af37]" />
            <span className="text-[#b48325] text-xs">✦ ❖ ✦</span>
            <span className="h-[1px] w-14 bg-gradient-to-l from-transparent to-[#d4af37]" />
          </div>

          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#b48325]">
              ✦ SACRED WEAVES OF SOUTH INDIA ✦
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-[#540924] tracking-tight">
              Pure Kanchipuram Silks
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
              Handpicked masterweaves from the historic temple town of Kanchipuram
            </p>

            {/* Sub-category pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
              {(
                [
                  { id: 'korvai', label: 'Traditional Korvai' },
                  { id: 'bridal', label: 'Bridal Heavies' },
                  { id: 'pastel', label: 'Pastel & Modern' },
                  { id: 'light', label: 'Lightweight Silks' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setKanjiTab(tab.id)}
                  className={cn(
                    'rounded-full px-4 py-1 text-xs font-semibold border transition-all',
                    kanjiTab === tab.id
                      ? 'border-[#540924] bg-[#540924] text-white shadow-xs'
                      : 'border-[#d4af37]/60 bg-white/80 text-stone-700 hover:border-[#540924]'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Split Content: Lookbook Visual Card Left + Saree Slider Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch relative">
            {/* Story Lookbook Left matching screenshot bride's hand on red silk */}
            <div className="lg:col-span-4 rounded-2xl overflow-hidden relative min-h-[380px] shadow-sm border border-stone-200 group">
              <Image
                src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800"
                alt="Bridal Kanchipuram Silks"
                fill
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

              <div className="absolute bottom-6 left-6 right-6 z-10 space-y-2">
                <Link href="/categories/kanjivaram-silk" className="inline-block">
                  <h3 className="text-2xl font-serif font-bold text-white hover:text-[#fde68a] transition-colors flex items-center gap-1.5">
                    <span>Bridal Silks</span>
                    <span className="text-xl">&gt;</span>
                  </h3>
                </Link>
                <p className="text-xs text-rose-100/90 leading-relaxed font-normal">
                  Authentic 3-ply mulberry silks with certified tested silver &amp; gold zari.
                </p>
              </div>
            </div>

            {/* Products Horizontal Slider Right with auto-scroll, snap, and Left/Right buttons */}
            <div
              className="lg:col-span-8 relative flex flex-col justify-center overflow-hidden rounded-2xl p-1 min-w-0"
              onMouseEnter={() => setKanjiPaused(true)}
              onMouseLeave={() => setKanjiPaused(false)}
            >
              <div
                ref={kanjiScrollRef}
                className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-2 pt-1 snap-x snap-mandatory items-stretch"
              >
                {loading ? (
                  [1, 2, 3].map((i) => (
                    <div key={i} data-card-item className="w-[75vw] sm:w-[260px] shrink-0 snap-center sm:snap-start">
                      <ProductCardSkeleton />
                    </div>
                  ))
                ) : (
                  kanchipuramProducts.slice(0, 8).map((product) => (
                    <div key={product.id} data-card-item className="w-[75vw] sm:w-[260px] shrink-0 snap-center sm:snap-start">
                      <ProductCard product={product} />
                    </div>
                  ))
                )}
              </div>

              {/* Left Navigation Arrow */}
              <button
                onClick={() => scrollKanji('left')}
                aria-label="Scroll previous sarees"
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/95 text-stone-800 shadow-xl border border-stone-200/90 hover:bg-[#540924] hover:text-white transition-all hover:scale-105 cursor-pointer backdrop-blur-xs"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Right Navigation Arrow */}
              <button
                onClick={() => scrollKanji('right')}
                aria-label="Scroll next sarees"
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/95 text-stone-800 shadow-xl border border-stone-200/90 hover:bg-[#540924] hover:text-white transition-all hover:scale-105 cursor-pointer backdrop-blur-xs"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. SHOP BY FABRIC & WEAVE - ROYAL JHAROKHA ARCH CARDS (User Provided Design) */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-8 space-y-1.5">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 text-[#7a0a24] px-3.5 py-0.5 text-[11px] font-bold uppercase tracking-widest border border-rose-200/80">
            <Sparkles className="w-3 h-3 text-[#d4af37]" />
            <span>Master Artisan Collections</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#540924]">
            Shop by Fabric &amp; Weave
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 font-light">
            Timeless regional masterpieces crafted inside generational Indian weaving clusters
          </p>
        </div>

        {/* Dynamic Card Display (3 Pages of 4 Royal Arch Cards matching reference screenshot) */}
        {(() => {
          const fabricCardPages = [
            // Page 1: Exact matches to user screenshot
            [
              {
                title: 'Bandhani Sarees',
                href: '/categories/bandhani-leheriya',
                image: '/images/products/saree-bandhani-gharchola.jpg',
                badge: 'Royal Jaal',
              },
              {
                title: 'Leheriya Sarees',
                href: '/shop?fabric=leheriya',
                image: '/images/products/saree-rose-tanchoi.jpg',
                badge: 'Wave Dye',
              },
              {
                title: 'Gota Patti Sarees',
                href: '/shop?fabric=gota-patti',
                image: '/images/products/saree-crimson-royal.jpg',
                badge: 'Zari Zardozi',
              },
              {
                title: 'Zari Work Sarees',
                href: '/shop?fabric=zari-work',
                image: '/images/products/saree-navy-kadwa.jpg',
                badge: '24K Electroplate',
              },
            ],
            // Page 2: Additional heritage fabrics
            [
              {
                title: 'Pure Kanchipuram',
                href: '/categories/kanjivaram-silk',
                image: '/images/products/saree-emerald-peacock.jpg',
                badge: 'Korvai Weave',
              },
              {
                title: 'Banarasi Brocade',
                href: '/categories/banarasi-brocade',
                image: '/hero-banner-2.jpg',
                badge: 'Kadwa Jaal',
              },
              {
                title: 'Organza Floral',
                href: '/categories/organza-floral',
                image: '/images/products/saree-organza-lotus.jpg',
                badge: 'Ethereal Tissue',
              },
              {
                title: 'Chanderi Weaves',
                href: '/categories/chanderi-linen',
                image: 'https://images.pexels.com/photos/2220316/pexels-photo-2220316.jpeg?auto=compress&cs=tinysrgb&w=600',
                badge: 'Zari Booti',
              },
            ],
            // Page 3: Celebrated regional masterweaves
            [
              {
                title: 'Patola Heritage',
                href: '/shop?search=patola',
                image: 'https://images.pexels.com/photos/1162983/pexels-photo-1162983.jpeg?auto=compress&cs=tinysrgb&w=600',
                badge: 'Double Ikat',
              },
              {
                title: 'Paithani Silks',
                href: '/shop?search=paithani',
                image: 'https://images.pexels.com/photos/1589216/pexels-photo-1589216.jpeg?auto=compress&cs=tinysrgb&w=600',
                badge: 'Munia Border',
              },
              {
                title: 'Tussar Silk',
                href: '/shop?search=tussar',
                image: 'https://images.pexels.com/photos/3014856/pexels-photo-3014856.jpeg?auto=compress&cs=tinysrgb&w=600',
                badge: 'Wild Forest',
              },
              {
                title: 'Mysore Crepe',
                href: '/shop?search=crepe',
                image: 'https://images.pexels.com/photos/247287/pexels-photo-247287.jpeg?auto=compress&cs=tinysrgb&w=600',
                badge: 'Pure Georgette',
              },
            ],
          ];

          const currentCards = fabricCardPages[fabricPageIndex] || fabricCardPages[0];

          return (
            <div className="space-y-6">
              {/* Arch Cards - Slider on mobile, Grid on tablet/desktop */}
              <div className="flex md:grid md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 overflow-x-auto no-scrollbar snap-x snap-mandatory items-start pb-4 px-2">
                {currentCards.map((card) => (
                  <div key={card.title} className="w-[65vw] sm:w-[260px] md:w-full shrink-0 snap-center md:snap-align-none">
                    <RoyalArchCard
                      title={card.title}
                      image={card.image}
                      href={card.href}
                      badge={card.badge}
                    />
                  </div>
                ))}
              </div>

              {/* Exact 3 Pagination Dots / Pill Indicator from User Screenshot */}
              <div className="flex items-center justify-center gap-2.5 pt-2">
                {fabricCardPages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setFabricPageIndex(idx)}
                    aria-label={`View slide ${idx + 1}`}
                    title={`Collection page ${idx + 1}`}
                    className={cn(
                      'transition-all duration-300 rounded-full cursor-pointer',
                      fabricPageIndex === idx
                        ? 'w-7 h-2.5 bg-[#7a0a24] shadow-sm'
                        : 'w-2.5 h-2.5 bg-[#7a0a24]/30 hover:bg-[#7a0a24]/60'
                    )}
                  />
                ))}
              </div>
            </div>
          );
        })()}
      </section>

      {/* ========================================================================= */}
      {/* 5. CURATED REGIONAL SPECIALTIES - ROW 2 (6 Tiles from Screenshot) */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-6 space-y-1">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#540924]">
            Curated Regional Specialties
          </h2>
          <p className="text-xs text-stone-500">
            Timeless traditions from India&apos;s most celebrated weaving clusters
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            {
              name: 'Gadwal Pattu',
              href: '/shop?search=gadwal',
              image: 'https://images.pexels.com/photos/1488312/pexels-photo-1488312.jpeg?auto=compress&cs=tinysrgb&w=600',
            },
            {
              name: 'Patola Sarees',
              href: '/shop?search=patola',
              image: 'https://images.pexels.com/photos/1162983/pexels-photo-1162983.jpeg?auto=compress&cs=tinysrgb&w=600',
            },
            {
              name: 'Bandhani Silks',
              href: '/categories/bandhani-leheriya',
              image: 'https://images.pexels.com/photos/1730877/pexels-photo-1730877.jpeg?auto=compress&cs=tinysrgb&w=600',
            },
            {
              name: 'Paithani Silks',
              href: '/shop?search=paithani',
              image: 'https://images.pexels.com/photos/1589216/pexels-photo-1589216.jpeg?auto=compress&cs=tinysrgb&w=600',
            },
            {
              name: 'Mysore Crepe',
              href: '/shop?search=crepe',
              image: 'https://images.pexels.com/photos/247287/pexels-photo-247287.jpeg?auto=compress&cs=tinysrgb&w=600',
            },
            {
              name: 'Baluchari Silks',
              href: '/shop?search=baluchari',
              image: 'https://images.pexels.com/photos/3014856/pexels-photo-3014856.jpeg?auto=compress&cs=tinysrgb&w=600',
            },
          ].map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="group flex flex-col items-center text-center p-2.5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs hover:border-[#540924] hover:shadow-[0_12px_28px_rgba(84,9,36,0.12)] transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-2.5 bg-stone-100 border border-stone-200/70 shadow-2xs">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-108 transition-transform duration-500"
                />
              </div>
              <h3 className="text-xs font-serif font-bold text-stone-900 group-hover:text-[#540924] transition-colors leading-tight">
                {item.name}
              </h3>
              <span className="w-4 h-0.5 bg-[#d4af37]/60 group-hover:w-8 group-hover:bg-[#540924] transition-all duration-300 mt-1.5 rounded-full" />
            </Link>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. BRIDAL & FESTIVE EDIT - 4 LARGE CARDS (Direct Screenshot Match) */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#b48325]">
              CELEBRITY &amp; ROYAL LOOKBOOK
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#540924]">
              Bridal &amp; Festive Edit
            </h2>
          </div>
          <Link href="/shop?featured=true">
            <button className="rounded-full bg-[#540924] hover:bg-[#3d0517] text-white px-4 py-1.5 text-xs font-bold transition-all shadow-xs flex items-center gap-1">
              <span>VIEW ALL</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              id: 'rsf-kanji-001',
              title: 'Royal Saree Black Bridal Kanchipuram Silk Saree',
              price: 32500,
              originalPrice: 38000,
              image: 'https://images.pexels.com/photos/1488312/pexels-photo-1488312.jpeg?auto=compress&cs=tinysrgb&w=800',
            },
            {
              id: 'rsf-banar-001',
              title: 'Sindhoor Red Gold Zari Heavy Bridal Silk Saree',
              price: 36000,
              originalPrice: 42000,
              image: 'https://images.pexels.com/photos/1162983/pexels-photo-1162983.jpeg?auto=compress&cs=tinysrgb&w=800',
            },
            {
              id: 'rsf-kanji-002',
              title: 'Lavanya Lilac Pastel Brocade Kanchipuram Saree',
              price: 28500,
              originalPrice: 33000,
              image: 'https://images.pexels.com/photos/1730877/pexels-photo-1730877.jpeg?auto=compress&cs=tinysrgb&w=800',
            },
            {
              id: 'rsf-organza-001',
              title: 'Suvarna Beige Tissue Handloom Silk Saree',
              price: 29900,
              originalPrice: 35000,
              image: 'https://images.pexels.com/photos/3014856/pexels-photo-3014856.jpeg?auto=compress&cs=tinysrgb&w=800',
            },
          ].map((look) => (
            <Link
              key={look.id}
              href="/shop"
              className="group flex flex-col rounded-2xl overflow-hidden border border-stone-200 bg-white shadow-xs hover:border-[#540924] hover:shadow-xl transition-all duration-300"
            >
              <div className="relative aspect-[3/4.2] w-full overflow-hidden bg-stone-100">
                <Image
                  src={look.image}
                  alt={look.title}
                  fill
                  className="object-cover object-top group-hover:scale-106 transition-transform duration-700"
                />
              </div>

              <div className="p-3.5 flex flex-col flex-1">
                <h3 className="text-xs font-serif font-bold text-stone-900 leading-snug group-hover:text-[#540924] transition-colors line-clamp-2">
                  {look.title}
                </h3>

                <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#540924]">
                      ₹{look.price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-stone-400 line-through ml-2">
                      ₹{look.originalPrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-[#b48325] group-hover:underline">
                    View Saree →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6.5. ROYAL HANDLOOM VIDEO SHOWCASE BANNER (Full-Bleed 100% Screen Width) */}
      {/* ========================================================================= */}
      <section className="relative w-full overflow-hidden bg-[#1e030c] border-y border-[#d4af37]/50 shadow-2xl my-6">
        <div className="relative w-full min-h-[440px] sm:min-h-[500px] lg:min-h-[540px] flex items-center">
          
          {/* Background Video with AutoPlay, Loop, Muted, PlaysInline */}
          <div className="absolute inset-0 w-full h-full overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              loop
              muted
              playsInline
              poster="/hero-banner-2.jpg"
              className="w-full h-full object-cover object-center"
            >
              <source
                src="https://upload.wikimedia.org/wikipedia/commons/b/bd/Weaving_Tant_Saree_by_Handloom_-_2_Natun_Phulia_-_Nadia_2016-11-12_1804.webm"
                type="video/webm"
              />
              <source
                src="https://upload.wikimedia.org/wikipedia/commons/transcoded/b/bd/Weaving_Tant_Saree_by_Handloom_-_2_Natun_Phulia_-_Nadia_2016-11-12_1804.webm/Weaving_Tant_Saree_by_Handloom_-_2_Natun_Phulia_-_Nadia_2016-11-12_1804.webm.480p.vp9.webm"
                type="video/webm"
              />
              <source
                src="https://upload.wikimedia.org/wikipedia/commons/transcoded/b/bd/Weaving_Tant_Saree_by_Handloom_-_2_Natun_Phulia_-_Nadia_2016-11-12_1804.webm/Weaving_Tant_Saree_by_Handloom_-_2_Natun_Phulia_-_Nadia_2016-11-12_1804.webm.360p.mpeg4.mov"
                type="video/mp4"
              />
            </video>
          </div>

          {/* High-Visibility Localized Gradient ONLY behind left text - 100% Bright, Vivid Video Across Center & Right */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent w-full sm:w-7/12 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />

          {/* Golden Zari Frame Inset Accent Lines across 100% width */}
          <div className="pointer-events-none absolute inset-x-0 top-3 h-[1px] bg-gradient-to-r from-transparent via-[#d4af37]/60 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-3 h-[1px] bg-gradient-to-r from-transparent via-[#d4af37]/60 to-transparent" />

          {/* Video Banner Content Overlay */}
          <div className="relative z-10 max-w-7xl mx-auto w-full px-6 sm:px-12 py-16 text-white flex flex-col justify-center">
            <div className="max-w-2xl space-y-4">
              
              {/* Top Pill Badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/50 backdrop-blur-md px-3.5 py-1 text-[11px] font-bold tracking-widest uppercase text-amber-200 shadow-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>THE ROYAL WEAVE IN MOTION</span>
              </div>

              {/* Heading */}
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif font-bold text-white leading-tight">
                Generations of Handloom Artistry Captured on Film
              </h2>

              {/* Story */}
              <p className="text-xs sm:text-sm text-stone-200 font-normal leading-relaxed">
                Witness authentic master artisans at the pit loom weaving pure mulberry silk and certified 24K electroplated gold zari. Each heritage saree represents over 200 hours of unhurried generational rhythm.
              </p>

              {/* CTA Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link href="/shop?featured=true">
                  <button className="rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-stone-950 font-bold px-6 py-2.5 text-xs transition-all shadow-lg hover:shadow-amber-500/30 flex items-center gap-2 transform hover:-translate-y-0.5 cursor-pointer">
                    <ShoppingBag className="w-4 h-4" />
                    <span>EXPLORE BRIDAL EDIT</span>
                  </button>
                </Link>

                <button
                  onClick={() => {
                    setSelectedStore('kolkata');
                    setAppointmentType('video_call');
                  }}
                  className="rounded-full bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur-md text-white font-semibold px-5 py-2.5 text-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Video className="w-4 h-4 text-amber-300" />
                  <span>BOOK LIVE VIDEO DRAPE</span>
                </button>
              </div>

            </div>
          </div>

          {/* Floating Video Controls in Bottom Right */}
          <div className="absolute bottom-6 right-6 sm:right-12 z-20 flex items-center gap-2.5">
            <button
              onClick={toggleVideoPlay}
              aria-label={isVideoPlaying ? 'Pause video' : 'Play video'}
              title={isVideoPlaying ? 'Pause Video' : 'Play Video'}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/20 transition-all hover:scale-105 cursor-pointer"
            >
              {isVideoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5 fill-white" />}
            </button>

            <button
              onClick={toggleVideoMute}
              aria-label={isVideoMuted ? 'Unmute video' : 'Mute video'}
              title={isVideoMuted ? 'Unmute Audio' : 'Mute Audio'}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/20 transition-all hover:scale-105 cursor-pointer"
            >
              {isVideoMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. WEDDING & FESTIVE STORIES - 5 TALL VERTICAL CARDS (From Screenshot) */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-6 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#b48325]">
            CELEBRATE TRADITIONS
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#540924]">
            Wedding &amp; Festive Stories
          </h2>
          <p className="text-xs text-stone-500">
            Curating unforgettable memories for brides and families
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {[
            {
              title: 'Muhurtham',
              subtitle: 'Traditional Sacred Silks',
              image: 'https://images.pexels.com/photos/1488312/pexels-photo-1488312.jpeg?auto=compress&cs=tinysrgb&w=600',
            },
            {
              title: 'Haldi & Sangeet',
              subtitle: 'Sunlit Auspicious Drapes',
              image: 'https://images.pexels.com/photos/1162983/pexels-photo-1162983.jpeg?auto=compress&cs=tinysrgb&w=600',
            },
            {
              title: 'The Bridal Trousseau',
              subtitle: 'Generational Heirlooms',
              image: 'https://images.pexels.com/photos/3321793/pexels-photo-3321793.jpeg?auto=compress&cs=tinysrgb&w=600',
            },
            {
              title: 'Grand Reception',
              subtitle: 'Opulent Kadwa Brocades',
              image: 'https://images.pexels.com/photos/1730877/pexels-photo-1730877.jpeg?auto=compress&cs=tinysrgb&w=600',
            },
            {
              title: 'Pujas & Celebrations',
              subtitle: 'Festive Auspicious Drapes',
              image: 'https://images.pexels.com/photos/1589216/pexels-photo-1589216.jpeg?auto=compress&cs=tinysrgb&w=600',
            },
          ].map((story) => (
            <Link
              key={story.title}
              href="/shop"
              className="group relative aspect-[3/4.6] rounded-2xl overflow-hidden shadow-sm border border-stone-200 flex flex-col justify-end p-4"
            >
              <Image
                src={story.image}
                alt={story.title}
                fill
                className="object-cover object-center group-hover:scale-106 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

              <div className="relative z-10 space-y-1">
                <h3 className="text-xs sm:text-sm font-serif font-bold text-white leading-tight">
                  {story.title}
                </h3>
                <p className="text-[10px] text-rose-200 font-medium">{story.subtitle}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. SILK SWATCHES • THE WEAVING LOOM STORY (Screenshot Match) */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-6 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#b48325]">
            AUTHENTIC CRAFTSMANSHIP
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#540924]">
            Silk Swatches | The Weaving Loom Story
          </h2>
          <p className="text-xs text-stone-500">
            Zoom into the intricate craft of our master weavers
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {[
            {
              title: 'Pure Tested Zari',
              desc: 'Certified gold & silver plate',
              image: 'https://images.pexels.com/photos/1488312/pexels-photo-1488312.jpeg?auto=compress&cs=tinysrgb&w=400',
            },
            {
              title: 'Korvai Weaving',
              desc: 'Hand-interlocked three-shuttle',
              image: 'https://images.pexels.com/photos/1589216/pexels-photo-1589216.jpeg?auto=compress&cs=tinysrgb&w=400',
            },
            {
              title: 'Kadwa Technique',
              desc: 'No loose floating threads',
              image: 'https://images.pexels.com/photos/3321793/pexels-photo-3321793.jpeg?auto=compress&cs=tinysrgb&w=400',
            },
            {
              title: 'Meenakari Inlay',
              desc: 'Colorful enamel silk threads',
              image: 'https://images.pexels.com/photos/1162983/pexels-photo-1162983.jpeg?auto=compress&cs=tinysrgb&w=400',
            },
            {
              title: 'Mulberry 3-Ply',
              desc: 'Superior tensile strength & sheen',
              image: 'https://images.pexels.com/photos/1730877/pexels-photo-1730877.jpeg?auto=compress&cs=tinysrgb&w=400',
            },
            {
              title: 'Temple Border',
              desc: 'Sacred gopuram architecture',
              image: 'https://images.pexels.com/photos/3014856/pexels-photo-3014856.jpeg?auto=compress&cs=tinysrgb&w=400',
            },
          ].map((swatch) => (
            <div
              key={swatch.title}
              className="rounded-2xl border border-stone-200 bg-white p-3 shadow-2xs hover:border-[#540924] transition-all"
            >
              <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-2 bg-stone-100">
                <Image
                  src={swatch.image}
                  alt={swatch.title}
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-xs font-serif font-bold text-stone-900 leading-snug">
                {swatch.title}
              </h3>
              <p className="text-[10px] text-stone-500 mt-0.5">{swatch.desc}</p>
            </div>
          ))}
        </div>
      </section>



      {/* ========================================================================= */}
      {/* 9. READY TO SHIP SAREES (Express 24-hr Dispatch from Screenshot) */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 text-[#540924] px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider mb-1 border border-rose-200">
              <Clock className="w-3 h-3 text-[#540924]" />
              <span>Dispatches in 24 Hours</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#540924]">
              Ready to Ship Sarees
            </h2>
          </div>
          <Link href="/shop?inStock=true">
            <button className="rounded-full bg-[#540924] hover:bg-[#3d0517] text-white px-4 py-1.5 text-xs font-bold transition-all shadow-xs flex items-center gap-1">
              <span>VIEW ALL</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {loading ? (
            [1, 2, 3, 4].map((i) => <ProductCardSkeleton key={i} />)
          ) : (
            readyToShipProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. TRENDING SACRED MOTIFS (7 Tiles matching Screenshot) */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-6 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#b48325]">
            ANCIENT SYMBOLS &amp; MYTHOLOGY
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#540924]">
            Trending Sacred Motifs
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { name: 'Mayil (Peacock)', desc: 'Royalty & Grace' },
            { name: 'Rudraksha', desc: 'Divine Blessings' },
            { name: 'Kalka (Paisley)', desc: 'Fertility & Life' },
            { name: 'Manga (Mango)', desc: 'Festive Abundance' },
            { name: 'Chakra (Wheel)', desc: 'Cosmic Eternity' },
            { name: 'Gaja (Elephant)', desc: 'Wisdom & Power' },
            { name: 'Annapakshi', desc: 'Celestial Swan' },
          ].map((motif) => (
            <Link
              key={motif.name}
              href={`/shop?search=${encodeURIComponent(motif.name.split(' ')[0])}`}
              className="group p-3 rounded-2xl bg-white border border-stone-200 text-center hover:border-[#540924] hover:bg-stone-50 transition-all shadow-2xs"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#540924]/10 text-[#540924] mx-auto mb-2 group-hover:bg-[#540924] group-hover:text-white transition-colors">
                <Sparkles className="w-4 h-4" />
              </div>
              <p className="text-xs font-serif font-bold text-stone-900">{motif.name}</p>
              <p className="text-[9.5px] text-stone-500 mt-0.5">{motif.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 11. VISIT OUR STORES (Exact Container & Deep Wine Buttons from Screenshot) */}
      {/* ========================================================================= */}
      <section id="stores" className="scroll-mt-28 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl bg-[#fdf8f9] border border-rose-100 p-6 sm:p-10">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#b48325]">
              ✦ OUR RETAIL DESTINATIONS ✦
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#540924]">
              Visit Our Stores
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
              Experience the touch of authentic handlooms across our flagship showrooms
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                id: 'chennai',
                name: 'T. Nagar, Chennai',
                rating: '4.9',
                reviews: '180+ Reviews',
                address: 'Pondy Bazaar, T. Nagar, Chennai, Tamil Nadu 600017',
                phone: '+91 44 2434 5678',
                hours: '10:00 AM - 9:00 PM',
                image: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&q=80&w=800',
                mapQuery: 'T. Nagar Chennai Saree Boutique',
              },
              {
                id: 'bengaluru',
                name: 'Jayanagar, Bengaluru',
                rating: '4.9',
                reviews: '240+ Reviews',
                address: '11th Main, 4th Block, Jayanagar, Bengaluru 560011',
                phone: '+91 80 2656 7890',
                hours: '10:00 AM - 9:30 PM',
                image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800',
                mapQuery: 'Jayanagar Bengaluru Saree Boutique',
              },
              {
                id: 'hyderabad',
                name: 'Banjara Hills, Hyderabad',
                rating: '4.8',
                reviews: '195+ Reviews',
                address: 'Road No. 10, Banjara Hills, Hyderabad, Telangana 500034',
                phone: '+91 40 2335 1234',
                hours: '10:30 AM - 9:00 PM',
                image: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&q=80&w=800',
                mapQuery: 'Banjara Hills Hyderabad Saree Boutique',
              },
              {
                id: 'kolkata',
                name: 'Salt Lake, Kolkata',
                rating: '4.9',
                reviews: '210+ Reviews',
                address: 'TechWave Tower, Sector V, Salt Lake, Kolkata 700091',
                phone: '+91 9641145871',
                hours: '10:00 AM - 9:00 PM',
                image: 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?auto=format&fit=crop&q=80&w=800',
                mapQuery: 'Salt Lake Sector V Kolkata Saree Boutique',
              },
              {
                id: 'delhi',
                name: 'Connaught Place, New Delhi',
                rating: '4.8',
                reviews: '170+ Reviews',
                address: 'Block E, Inner Circle, Connaught Place, New Delhi 110001',
                phone: '+91 11 2341 5678',
                hours: '10:30 AM - 8:30 PM',
                image: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&q=80&w=800',
                mapQuery: 'Connaught Place New Delhi Saree Boutique',
              },
              {
                id: 'mumbai',
                name: 'Kala Ghoda, Mumbai',
                rating: '4.9',
                reviews: '220+ Reviews',
                address: 'Heritage Mile, Kala Ghoda, Fort, Mumbai 400001',
                phone: '+91 22 2284 9012',
                hours: '10:00 AM - 9:00 PM',
                image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800',
                mapQuery: 'Kala Ghoda Fort Mumbai Saree Boutique',
              },
            ].map((store) => (
              <div
                key={store.id}
                className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-xs hover:shadow-xl hover:border-[#540924]/40 transition-all duration-300 flex flex-col"
              >
                {/* Store Photograph Frame */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100">
                  <Image
                    src={store.image}
                    alt={store.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-3 left-3 z-10">
                    <span className="rounded-full bg-[#540924] text-white px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider shadow-sm">
                      FLAGSHIP
                    </span>
                  </div>
                </div>

                {/* Store Information Details */}
                <div className="p-4 flex flex-col flex-1 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-serif font-bold text-stone-900">
                      {store.name}
                    </h3>
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-stone-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60 shrink-0">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{store.rating}</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-stone-400">{store.reviews}</p>

                  <div className="space-y-1 text-xs text-stone-600">
                    <p className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#b48325] shrink-0 mt-0.5" />
                      <span className="leading-snug text-[11px]">{store.address}</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-[11px] text-stone-500">
                      <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>{store.hours}</span>
                    </p>
                  </div>

                  {/* Bottom Actions: Deep Wine GET DIRECTIONS Button matching screenshot */}
                  <div className="mt-auto pt-3 border-t border-stone-100 flex items-center gap-2">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.mapQuery)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 rounded-lg bg-[#540924] hover:bg-[#3d0517] text-white font-bold py-2 text-xs text-center transition-all shadow-xs"
                    >
                      GET DIRECTIONS
                    </a>

                    <button
                      onClick={() => setSelectedStore(store.name)}
                      aria-label="Book store visit"
                      title="Book styling visit"
                      className="h-8 w-8 rounded-lg border border-stone-300 hover:border-[#540924] flex items-center justify-center text-stone-700 hover:text-[#540924] transition-colors shrink-0"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 12. STORE APPOINTMENT MODAL (Dynamic & Interactive) */}
      {/* ========================================================================= */}
      {selectedStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-stone-200">
            <button
              onClick={() => setSelectedStore(null)}
              className="absolute right-4 top-4 rounded-full p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
            >
              <X className="w-5 h-5" />
            </button>

            {appointmentBooked ? (
              <div className="text-center py-8 space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-[#540924]">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-serif font-bold text-[#540924]">
                  Styling Appointment Confirmed!
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed max-w-sm mx-auto">
                  Our master stylist at <strong>{selectedStore}</strong> has reserved your slot. A confirmation message has been sent to {appointmentPhone || '+91 9641145871'}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleStoreBookingSubmit} className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#b48325]">
                    PRIVATE CONSULTATION
                  </span>
                  <h3 className="text-2xl font-serif font-bold text-[#540924]">
                    Book Appointment at {selectedStore}
                  </h3>
                  <p className="text-xs text-stone-500">
                    Reserve a one-on-one bridal styling session or request live video draping.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setAppointmentType('in_store')}
                    className={cn(
                      'p-3 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all',
                      appointmentType === 'in_store'
                        ? 'border-[#540924] bg-rose-50 text-[#540924]'
                        : 'border-stone-200 hover:border-stone-300 text-stone-700'
                    )}
                  >
                    <MapPin className="w-4 h-4 text-[#540924]" />
                    <span>In-Store Visit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAppointmentType('video_call')}
                    className={cn(
                      'p-3 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all',
                      appointmentType === 'video_call'
                        ? 'border-[#540924] bg-rose-50 text-[#540924]'
                        : 'border-stone-200 hover:border-stone-300 text-stone-700'
                    )}
                  >
                    <Video className="w-4 h-4 text-[#540924]" />
                    <span>Video Shopping Call</span>
                  </button>
                </div>

                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={appointmentName}
                      onChange={(e) => setAppointmentName(e.target.value)}
                      placeholder="e.g. Radhika Sharma"
                      className="w-full rounded-xl border border-stone-300 px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#540924]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      WhatsApp Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={appointmentPhone}
                      onChange={(e) => setAppointmentPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full rounded-xl border border-stone-300 px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#540924]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Preferred Date &amp; Time *
                    </label>
                    <input
                      type="date"
                      required
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      className="w-full rounded-xl border border-stone-300 px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#540924]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#540924] hover:bg-[#3d0517] text-white font-bold py-3 text-xs transition-all shadow-md mt-4"
                >
                  Confirm Appointment
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 13. ASSURANCE STRIP (4 Pillars of Heritage Trust) */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <div className="rounded-3xl border border-stone-200 bg-stone-50/60 p-6 sm:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-2xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-[#540924] mb-3">
                <Award className="w-5 h-5 text-[#540924]" />
              </div>
              <h3 className="text-xs font-bold text-stone-900 mb-1">Silk Mark Certified Pure</h3>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                Every pure silk weave carries the Government of India Silk Mark Organization trust label with verifiable QR code.
              </p>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-2xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-[#540924] mb-3">
                <Truck className="w-5 h-5 text-[#540924]" />
              </div>
              <h3 className="text-xs font-bold text-stone-900 mb-1">Insured Express Courier</h3>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                Tamper-proof royal packaging delivered safely via BlueDart &amp; DHL with 100% full-value transit insurance.
              </p>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-2xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-[#540924] mb-3">
                <RotateCcw className="w-5 h-5 text-[#540924]" />
              </div>
              <h3 className="text-xs font-bold text-stone-900 mb-1">7-Day Doorstep Returns</h3>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                Hassle-free reverse pickup with immediate refund credit upon inspection. Transparent client service.
              </p>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-2xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-[#b48325] mb-3">
                <Scissors className="w-5 h-5 text-[#b48325]" />
              </div>
              <h3 className="text-xs font-bold text-stone-900 mb-1">Custom Designer Blouse</h3>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                Complimentary matching unstitched blouse piece with option for custom necklines and maggam embroidery.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
