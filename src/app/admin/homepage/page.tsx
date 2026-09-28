'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Sparkles,
  Save,
  RotateCcw,
  ExternalLink,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Film,
  Building2,
  ShoppingBag,
  Layers,
  HeartHandshake,
  Clock,
  BookOpen,
  Eye,
} from 'lucide-react';
import { api } from '@/lib/api';
import { HomePageConfig, HeroSlide, StoreLocationItem } from '@/types/homepage';
import { DEFAULT_HOMEPAGE_CONFIG } from '@/lib/homepage-defaults';
import { cn } from '@/lib/utils';

type ActiveTab =
  | 'hero'
  | 'arrivals'
  | 'kanchipuram'
  | 'bridal'
  | 'video'
  | 'stories'
  | 'loom'
  | 'ready'
  | 'stores';

export default function AdminHomepagePage() {
  const [config, setConfig] = useState<HomePageConfig>(DEFAULT_HOMEPAGE_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('hero');
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await api.getHomepageConfig();
        if (res.success && res.data) {
          setConfig(res.data);
        }
      } catch (err) {
        console.error('Failed to load homepage config:', err);
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setStatusMessage(null);
    try {
      const res = await api.updateHomepageConfig(config);
      if (res.success) {
        setStatusMessage({ type: 'success', text: 'Homepage sections published successfully!' });
      } else {
        setStatusMessage({ type: 'error', text: res.message || 'Failed to save changes.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Network error saving homepage.' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Are you sure you want to reset all homepage sections to default? This cannot be undone.')) {
      return;
    }
    setSaving(true);
    setStatusMessage(null);
    try {
      const res = await api.resetHomepageConfig();
      if (res.success) {
        setConfig(DEFAULT_HOMEPAGE_CONFIG);
        setStatusMessage({ type: 'success', text: 'Homepage restored to default styling & content.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to reset homepage.' });
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (file: File, onUrlReady: (url: string) => void, fieldId: string) => {
    setUploadingField(fieldId);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const res = await api.uploadImage(base64, file.name, file.type);
        if (res.success && res.data?.url) {
          onUrlReady(res.data.url);
          setStatusMessage({ type: 'success', text: 'Image uploaded successfully.' });
        } else {
          setStatusMessage({ type: 'error', text: res.message || 'Image upload failed.' });
        }
        setUploadingField(null);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to upload image.' });
      setUploadingField(null);
    }
  };

  const tabs = [
    { id: 'hero', label: '1. Hero Slider', icon: ImageIcon, count: config.heroSlides?.length },
    { id: 'arrivals', label: '2. New Arrivals', icon: ShoppingBag },
    { id: 'kanchipuram', label: '3. Bridal Silks', icon: Sparkles },
    { id: 'bridal', label: '4. Bridal & Festive Edit', icon: HeartHandshake, count: config.bridalFestive?.cards?.length },
    { id: 'video', label: '5. Video Banner', icon: Film },
    { id: 'stories', label: '6. Wedding Stories', icon: BookOpen, count: config.weddingStories?.stories?.length },
    { id: 'loom', label: '7. Weaving Loom Story', icon: Layers, count: config.loomStory?.swatches?.length },
    { id: 'ready', label: '8. Ready to Ship', icon: Clock },
    { id: 'stores', label: '9. Retail Stores', icon: Building2, count: config.stores?.stores?.length },
  ];

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-[#540924]" />
          <p className="text-xs text-stone-500 font-medium">Loading Homepage Sections CMS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#540924]/10 text-[#540924]">
              <Sparkles className="w-5 h-5 text-[#540924]" />
            </span>
            <div>
              <h1 className="text-xl font-serif font-bold text-[#540924]">Homepage CMS Management</h1>
              <p className="text-xs text-stone-500">
                Control all banners, titles, bridal edits, stories, and store locations dynamically without touching code.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>Live Storefront</span>
            <ExternalLink className="w-3 h-3 text-stone-400" />
          </Link>

          <button
            onClick={handleReset}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-[#540924] hover:bg-[#3d0517] rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 cursor-pointer"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Publishing...' : 'Save & Publish Changes'}</span>
          </button>
        </div>
      </div>

      {/* Status Feedback Toast */}
      {statusMessage && (
        <div
          className={cn(
            'p-4 rounded-xl flex items-center gap-3 text-xs font-medium animate-in fade-in duration-200 border',
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          )}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
          <button
            onClick={() => setStatusMessage(null)}
            className="ml-auto text-stone-400 hover:text-stone-700"
          >
            ✕
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-white p-2 rounded-2xl border border-stone-200/90 shadow-2xs no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ActiveTab)}
              className={cn(
                'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer',
                isActive
                  ? 'bg-[#540924] text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              )}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={cn(
                    'px-1.5 py-0.2 rounded-full text-[10px] font-bold',
                    isActive ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-700'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main CMS Configuration Content */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-6 shadow-2xs space-y-6">
        {/* ========================================================================= */}
        {/* TAB 1: HERO SHOWCASE SLIDER */}
        {/* ========================================================================= */}
        {activeTab === 'hero' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div>
                <h2 className="text-base font-serif font-bold text-stone-900">Hero Showcase Slides</h2>
                <p className="text-xs text-stone-500">
                  Full-width main carousel slides shown at the very top of the homepage.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newSlide: HeroSlide = {
                    id: Date.now(),
                    title: 'New Luxury Showcase',
                    subtitle: 'Generational masterweaves woven with pure silver and gold zari.',
                    image: '/hero-banner-1.jpg',
                    ctaText: 'SHOP NOW',
                    ctaLink: '/shop',
                  };
                  setConfig({ ...config, heroSlides: [...config.heroSlides, newSlide] });
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#540924] bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Hero Slide</span>
              </button>
            </div>

            <div className="space-y-6">
              {config.heroSlides.map((slide, idx) => (
                <div
                  key={slide.id || idx}
                  className="rounded-2xl border border-stone-200 p-5 bg-stone-50/50 space-y-4 hover:border-stone-300 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-serif font-bold text-[#540924] px-2.5 py-1 rounded-lg bg-[#540924]/10">
                      Slide #{idx + 1}
                    </span>
                    {config.heroSlides.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const updated = config.heroSlides.filter((_, i) => i !== idx);
                          setConfig({ ...config, heroSlides: updated });
                        }}
                        className="text-rose-600 hover:text-rose-800 p-1 text-xs flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove Slide</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                    {/* Thumbnail preview */}
                    <div className="md:col-span-4 space-y-2">
                      <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden border border-stone-300 bg-stone-900 shadow-inner">
                        {slide.image ? (
                          <Image src={slide.image} alt={slide.title} fill className="object-cover" />
                        ) : (
                          <div className="flex items-center justify-center h-full text-stone-500 text-xs">
                            No image selected
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="flex-1 cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleFileUpload(
                                  file,
                                  (url) => {
                                    const updated = [...config.heroSlides];
                                    updated[idx].image = url;
                                    setConfig({ ...config, heroSlides: updated });
                                  },
                                  `hero-${idx}`
                                );
                              }
                            }}
                          />
                          <span className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 shadow-2xs transition-colors">
                            {uploadingField === `hero-${idx}` ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Upload className="w-3.5 h-3.5 text-[#540924]" />
                            )}
                            <span>Upload Image</span>
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Inputs */}
                    <div className="md:col-span-8 space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">
                          Slide Headline Title *
                        </label>
                        <input
                          type="text"
                          value={slide.title}
                          onChange={(e) => {
                            const updated = [...config.heroSlides];
                            updated[idx].title = e.target.value;
                            setConfig({ ...config, heroSlides: updated });
                          }}
                          className="w-full text-xs rounded-xl border border-stone-300 px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#540924]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">
                          Subtitle Description
                        </label>
                        <textarea
                          rows={2}
                          value={slide.subtitle}
                          onChange={(e) => {
                            const updated = [...config.heroSlides];
                            updated[idx].subtitle = e.target.value;
                            setConfig({ ...config, heroSlides: updated });
                          }}
                          className="w-full text-xs rounded-xl border border-stone-300 px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#540924]"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-stone-700 mb-1">
                            CTA Button Text
                          </label>
                          <input
                            type="text"
                            value={slide.ctaText}
                            onChange={(e) => {
                              const updated = [...config.heroSlides];
                              updated[idx].ctaText = e.target.value;
                              setConfig({ ...config, heroSlides: updated });
                            }}
                            className="w-full text-xs rounded-xl border border-stone-300 px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#540924]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-stone-700 mb-1">
                            CTA Destination Link
                          </label>
                          <input
                            type="text"
                            value={slide.ctaLink}
                            onChange={(e) => {
                              const updated = [...config.heroSlides];
                              updated[idx].ctaLink = e.target.value;
                              setConfig({ ...config, heroSlides: updated });
                            }}
                            className="w-full text-xs rounded-xl border border-stone-300 px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#540924]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">
                          Image URL (Direct Path or Cloud URL)
                        </label>
                        <input
                          type="text"
                          value={slide.image}
                          onChange={(e) => {
                            const updated = [...config.heroSlides];
                            updated[idx].image = e.target.value;
                            setConfig({ ...config, heroSlides: updated });
                          }}
                          className="w-full text-xs rounded-xl border border-stone-300 px-3 py-2 bg-white font-mono focus:outline-none focus:ring-1 focus:ring-[#540924]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: TODAY'S NEW ARRIVALS */}
        {/* ========================================================================= */}
        {activeTab === 'arrivals' && (
          <div className="space-y-6">
            <div className="border-b border-stone-200 pb-4">
              <h2 className="text-base font-serif font-bold text-stone-900">Today&apos;s New Arrivals Section</h2>
              <p className="text-xs text-stone-500">
                Configure the section title, header quick links, and the prominent left-side curated combos card.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Section Headline Title *
                  </label>
                  <input
                    type="text"
                    value={config.newArrivals.sectionTitle}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        newArrivals: { ...config.newArrivals, sectionTitle: e.target.value },
                      })
                    }
                    className="w-full text-xs rounded-xl border border-stone-300 px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#540924]"
                  />
                </div>

                <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-3">
                  <h3 className="text-xs font-serif font-bold text-[#540924]">Subtitle Links</h3>
                  {config.newArrivals.links.map((link, idx) => (
                    <div key={idx} className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Label"
                        value={link.label}
                        onChange={(e) => {
                          const updated = [...config.newArrivals.links];
                          updated[idx].label = e.target.value;
                          setConfig({
                            ...config,
                            newArrivals: { ...config.newArrivals, links: updated },
                          });
                        }}
                        className="text-xs rounded-xl border border-stone-300 px-2.5 py-1.5 bg-white"
                      />
                      <input
                        type="text"
                        placeholder="URL (/shop, etc)"
                        value={link.href}
                        onChange={(e) => {
                          const updated = [...config.newArrivals.links];
                          updated[idx].href = e.target.value;
                          setConfig({
                            ...config,
                            newArrivals: { ...config.newArrivals, links: updated },
                          });
                        }}
                        className="text-xs rounded-xl border border-stone-300 px-2.5 py-1.5 bg-white font-mono"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Left Curated Combo Card Config */}
              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-3">
                <h3 className="text-xs font-serif font-bold text-[#540924]">Left-Side Curated Card Feature</h3>
                
                <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden border border-stone-300 bg-stone-900">
                  {config.newArrivals.curatedCard.image ? (
                    <Image
                      src={config.newArrivals.curatedCard.image}
                      alt={config.newArrivals.curatedCard.title}
                      fill
                      className="object-cover"
                    />
                  ) : null}
                </div>

                <label className="block cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(
                          file,
                          (url) => {
                            setConfig({
                              ...config,
                              newArrivals: {
                                ...config.newArrivals,
                                curatedCard: { ...config.newArrivals.curatedCard, image: url },
                              },
                            });
                          },
                          'arrivals-curated'
                        );
                      }
                    }}
                  />
                  <span className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 shadow-2xs transition-colors">
                    {uploadingField === 'arrivals-curated' ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5 text-[#540924]" />
                    )}
                    <span>Upload Card Image</span>
                  </span>
                </label>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">Card Title</label>
                  <input
                    type="text"
                    value={config.newArrivals.curatedCard.title}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        newArrivals: {
                          ...config.newArrivals,
                          curatedCard: { ...config.newArrivals.curatedCard, title: e.target.value },
                        },
                      })
                    }
                    className="w-full text-xs rounded-xl border border-stone-300 px-3 py-1.5 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">Card Subtitle</label>
                  <input
                    type="text"
                    value={config.newArrivals.curatedCard.subtitle}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        newArrivals: {
                          ...config.newArrivals,
                          curatedCard: { ...config.newArrivals.curatedCard, subtitle: e.target.value },
                        },
                      })
                    }
                    className="w-full text-xs rounded-xl border border-stone-300 px-3 py-1.5 bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Button Text</label>
                    <input
                      type="text"
                      value={config.newArrivals.curatedCard.ctaText}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          newArrivals: {
                            ...config.newArrivals,
                            curatedCard: { ...config.newArrivals.curatedCard, ctaText: e.target.value },
                          },
                        })
                      }
                      className="w-full text-xs rounded-xl border border-stone-300 px-3 py-1.5 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Button Link</label>
                    <input
                      type="text"
                      value={config.newArrivals.curatedCard.ctaLink}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          newArrivals: {
                            ...config.newArrivals,
                            curatedCard: { ...config.newArrivals.curatedCard, ctaLink: e.target.value },
                          },
                        })
                      }
                      className="w-full text-xs rounded-xl border border-stone-300 px-3 py-1.5 bg-white font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: PURE KANCHIPURAM / BRIDAL SILKS */}
        {/* ========================================================================= */}
        {activeTab === 'kanchipuram' && (
          <div className="space-y-6">
            <div className="border-b border-stone-200 pb-4">
              <h2 className="text-base font-serif font-bold text-stone-900">
                Pure Kanchipuram Silks &amp; Bridal Lookbook
              </h2>
              <p className="text-xs text-stone-500">
                Configure the gold filigree framed heritage section and its prominent left-hand Bridal Silks lookbook card.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">Top Gold Accent Badge</label>
                  <input
                    type="text"
                    value={config.kanchipuram.badge}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        kanchipuram: { ...config.kanchipuram, badge: e.target.value },
                      })
                    }
                    className="w-full text-xs rounded-xl border border-stone-300 px-3 py-2 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">Section Title *</label>
                  <input
                    type="text"
                    value={config.kanchipuram.title}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        kanchipuram: { ...config.kanchipuram, title: e.target.value },
                      })
                    }
                    className="w-full text-xs rounded-xl border border-stone-300 px-3 py-2 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">Section Subtitle</label>
                  <textarea
                    rows={2}
                    value={config.kanchipuram.subtitle}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        kanchipuram: { ...config.kanchipuram, subtitle: e.target.value },
                      })
                    }
                    className="w-full text-xs rounded-xl border border-stone-300 px-3 py-2 bg-white"
                  />
                </div>
              </div>

              {/* Left Lookbook Card */}
              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-3">
                <h3 className="text-xs font-serif font-bold text-[#540924]">Left-Side Bridal Lookbook Card</h3>

                <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden border border-stone-300 bg-stone-900">
                  {config.kanchipuram.lookbookCard.image ? (
                    <Image
                      src={config.kanchipuram.lookbookCard.image}
                      alt={config.kanchipuram.lookbookCard.title}
                      fill
                      className="object-cover"
                    />
                  ) : null}
                </div>

                <label className="block cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(
                          file,
                          (url) => {
                            setConfig({
                              ...config,
                              kanchipuram: {
                                ...config.kanchipuram,
                                lookbookCard: { ...config.kanchipuram.lookbookCard, image: url },
                              },
                            });
                          },
                          'kanchipuram-lookbook'
                        );
                      }
                    }}
                  />
                  <span className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 shadow-2xs transition-colors">
                    {uploadingField === 'kanchipuram-lookbook' ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5 text-[#540924]" />
                    )}
                    <span>Upload Lookbook Saree Image</span>
                  </span>
                </label>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">Lookbook Card Title</label>
                  <input
                    type="text"
                    value={config.kanchipuram.lookbookCard.title}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        kanchipuram: {
                          ...config.kanchipuram,
                          lookbookCard: { ...config.kanchipuram.lookbookCard, title: e.target.value },
                        },
                      })
                    }
                    className="w-full text-xs rounded-xl border border-stone-300 px-3 py-1.5 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">Card Subtitle</label>
                  <input
                    type="text"
                    value={config.kanchipuram.lookbookCard.subtitle}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        kanchipuram: {
                          ...config.kanchipuram,
                          lookbookCard: { ...config.kanchipuram.lookbookCard, subtitle: e.target.value },
                        },
                      })
                    }
                    className="w-full text-xs rounded-xl border border-stone-300 px-3 py-1.5 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">Destination Link</label>
                  <input
                    type="text"
                    value={config.kanchipuram.lookbookCard.link}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        kanchipuram: {
                          ...config.kanchipuram,
                          lookbookCard: { ...config.kanchipuram.lookbookCard, link: e.target.value },
                        },
                      })
                    }
                    className="w-full text-xs rounded-xl border border-stone-300 px-3 py-1.5 bg-white font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: BRIDAL & FESTIVE EDIT (CELEBRITY LOOKBOOK) */}
        {/* ========================================================================= */}
        {activeTab === 'bridal' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div>
                <h2 className="text-base font-serif font-bold text-stone-900">Bridal &amp; Festive Edit Cards</h2>
                <p className="text-xs text-stone-500">
                  The 4 prominent showcase cards featuring celebrity and bridal heirlooms with custom prices.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newCard = {
                    id: `rsf-custom-${Date.now()}`,
                    title: 'New Bridal Masterweave Silk Saree',
                    price: 32000,
                    originalPrice: 38000,
                    image: '/images/products/saree-crimson-royal.jpg',
                    link: '/shop',
                  };
                  setConfig({
                    ...config,
                    bridalFestive: {
                      ...config.bridalFestive,
                      cards: [...config.bridalFestive.cards, newCard],
                    },
                  });
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#540924] bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Lookbook Card</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">Top Badge</label>
                <input
                  type="text"
                  value={config.bridalFestive.badge}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      bridalFestive: { ...config.bridalFestive, badge: e.target.value },
                    })
                  }
                  className="w-full text-xs rounded-xl border border-stone-300 px-3 py-2 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">Section Title</label>
                <input
                  type="text"
                  value={config.bridalFestive.title}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      bridalFestive: { ...config.bridalFestive, title: e.target.value },
                    })
                  }
                  className="w-full text-xs rounded-xl border border-stone-300 px-3 py-2 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {config.bridalFestive.cards.map((card, idx) => (
                <div
                  key={card.id || idx}
                  className="rounded-2xl border border-stone-200 p-4 bg-stone-50/50 space-y-3 relative flex flex-col"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-serif font-bold text-[#540924]">Card #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = config.bridalFestive.cards.filter((_, i) => i !== idx);
                        setConfig({
                          ...config,
                          bridalFestive: { ...config.bridalFestive, cards: updated },
                        });
                      }}
                      className="text-rose-500 hover:text-rose-700 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden border border-stone-300 bg-stone-100">
                    {card.image ? (
                      <Image src={card.image} alt={card.title} fill className="object-cover" />
                    ) : null}
                  </div>

                  <label className="block cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(
                            file,
                            (url) => {
                              const updated = [...config.bridalFestive.cards];
                              updated[idx].image = url;
                              setConfig({
                                ...config,
                                bridalFestive: { ...config.bridalFestive, cards: updated },
                              });
                            },
                            `bridal-${idx}`
                          );
                        }
                      }}
                    />
                    <span className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-[11px] font-semibold text-stone-700 shadow-2xs">
                      {uploadingField === `bridal-${idx}` ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5 text-[#540924]" />
                      )}
                      <span>Upload Saree</span>
                    </span>
                  </label>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Saree Title</label>
                    <input
                      type="text"
                      value={card.title}
                      onChange={(e) => {
                        const updated = [...config.bridalFestive.cards];
                        updated[idx].title = e.target.value;
                        setConfig({
                          ...config,
                          bridalFestive: { ...config.bridalFestive, cards: updated },
                        });
                      }}
                      className="w-full text-xs rounded-lg border border-stone-300 px-2.5 py-1.5 bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Price (₹)</label>
                      <input
                        type="number"
                        value={card.price}
                        onChange={(e) => {
                          const updated = [...config.bridalFestive.cards];
                          updated[idx].price = Number(e.target.value);
                          setConfig({
                            ...config,
                            bridalFestive: { ...config.bridalFestive, cards: updated },
                          });
                        }}
                        className="w-full text-xs rounded-lg border border-stone-300 px-2 py-1.5 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Strike Price (₹)</label>
                      <input
                        type="number"
                        value={card.originalPrice}
                        onChange={(e) => {
                          const updated = [...config.bridalFestive.cards];
                          updated[idx].originalPrice = Number(e.target.value);
                          setConfig({
                            ...config,
                            bridalFestive: { ...config.bridalFestive, cards: updated },
                          });
                        }}
                        className="w-full text-xs rounded-lg border border-stone-300 px-2 py-1.5 bg-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: ROYAL HANDLOOM VIDEO BANNER */}
        {/* ========================================================================= */}
        {activeTab === 'video' && (
          <div className="space-y-6">
            <div className="border-b border-stone-200 pb-4">
              <h2 className="text-base font-serif font-bold text-stone-900">
                Royal Handloom Video Showcase Banner
              </h2>
              <p className="text-xs text-stone-500">
                The full-bleed cinematic video section showcasing pit-loom master artisans weaving authentic sarees.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">Top Pill Badge</label>
                  <input
                    type="text"
                    value={config.videoBanner.badge}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        videoBanner: { ...config.videoBanner, badge: e.target.value },
                      })
                    }
                    className="w-full text-xs rounded-xl border border-stone-300 px-3 py-2 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">Headline Heading *</label>
                  <input
                    type="text"
                    value={config.videoBanner.title}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        videoBanner: { ...config.videoBanner, title: e.target.value },
                      })
                    }
                    className="w-full text-xs rounded-xl border border-stone-300 px-3 py-2 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">Artisan Story Text</label>
                  <textarea
                    rows={3}
                    value={config.videoBanner.description}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        videoBanner: { ...config.videoBanner, description: e.target.value },
                      })
                    }
                    className="w-full text-xs rounded-xl border border-stone-300 px-3 py-2 bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Primary CTA Text</label>
                    <input
                      type="text"
                      value={config.videoBanner.cta1Text}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          videoBanner: { ...config.videoBanner, cta1Text: e.target.value },
                        })
                      }
                      className="w-full text-xs rounded-xl border border-stone-300 px-3 py-1.5 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Primary CTA Link</label>
                    <input
                      type="text"
                      value={config.videoBanner.cta1Link}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          videoBanner: { ...config.videoBanner, cta1Link: e.target.value },
                        })
                      }
                      className="w-full text-xs rounded-xl border border-stone-300 px-3 py-1.5 bg-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">Secondary Button Text</label>
                  <input
                    type="text"
                    value={config.videoBanner.cta2Text}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        videoBanner: { ...config.videoBanner, cta2Text: e.target.value },
                      })
                    }
                    className="w-full text-xs rounded-xl border border-stone-300 px-3 py-1.5 bg-white"
                  />
                </div>
              </div>

              {/* Video URL & Poster */}
              <div className="space-y-4 p-4 rounded-xl border border-stone-200 bg-stone-50/50">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Direct Video Source URL (MP4 / WebM)
                  </label>
                  <input
                    type="text"
                    value={config.videoBanner.videoUrl}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        videoBanner: { ...config.videoBanner, videoUrl: e.target.value },
                      })
                    }
                    placeholder="https://.../video.mp4"
                    className="w-full text-xs rounded-xl border border-stone-300 px-3 py-2 bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Poster Fallback Image
                  </label>
                  <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden border border-stone-300 bg-stone-900 mb-2">
                    {config.videoBanner.poster ? (
                      <Image
                        src={config.videoBanner.poster}
                        alt="Poster"
                        fill
                        className="object-cover"
                      />
                    ) : null}
                  </div>

                  <label className="block cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(
                            file,
                            (url) => {
                              setConfig({
                                ...config,
                                videoBanner: { ...config.videoBanner, poster: url },
                              });
                            },
                            'video-poster'
                          );
                        }
                      }}
                    />
                    <span className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 shadow-2xs transition-colors">
                      {uploadingField === 'video-poster' ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5 text-[#540924]" />
                      )}
                      <span>Upload Poster Image</span>
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: WEDDING & FESTIVE STORIES */}
        {/* ========================================================================= */}
        {activeTab === 'stories' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div>
                <h2 className="text-base font-serif font-bold text-stone-900">
                  Wedding &amp; Festive Stories (Series)
                </h2>
                <p className="text-xs text-stone-500">
                  The 5 vertical cards showcasing celebrations: Muhurtham, Haldi, Trousseau, Reception, etc.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newStory = {
                    title: 'Sangeet Night',
                    subtitle: 'Lively Festive Heirlooms',
                    image: '/images/products/saree-crimson-royal.jpg',
                    link: '/shop',
                  };
                  setConfig({
                    ...config,
                    weddingStories: {
                      ...config.weddingStories,
                      stories: [...config.weddingStories.stories, newStory],
                    },
                  });
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#540924] bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Story Card</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">Top Badge</label>
                <input
                  type="text"
                  value={config.weddingStories.badge}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      weddingStories: { ...config.weddingStories, badge: e.target.value },
                    })
                  }
                  className="w-full text-xs rounded-xl border border-stone-300 px-3 py-2 bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">Section Title</label>
                <input
                  type="text"
                  value={config.weddingStories.title}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      weddingStories: { ...config.weddingStories, title: e.target.value },
                    })
                  }
                  className="w-full text-xs rounded-xl border border-stone-300 px-3 py-2 bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">Subtitle</label>
                <input
                  type="text"
                  value={config.weddingStories.subtitle}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      weddingStories: { ...config.weddingStories, subtitle: e.target.value },
                    })
                  }
                  className="w-full text-xs rounded-xl border border-stone-300 px-3 py-2 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 pt-2">
              {config.weddingStories.stories.map((story, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-stone-200 p-3.5 bg-stone-50/50 space-y-2.5 flex flex-col"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-serif font-bold text-[#540924]">Story #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = config.weddingStories.stories.filter((_, i) => i !== idx);
                        setConfig({
                          ...config,
                          weddingStories: { ...config.weddingStories, stories: updated },
                        });
                      }}
                      className="text-rose-500 hover:text-rose-700 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden border border-stone-300 bg-stone-100">
                    {story.image ? (
                      <Image src={story.image} alt={story.title} fill className="object-cover" />
                    ) : null}
                  </div>

                  <label className="block cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(
                            file,
                            (url) => {
                              const updated = [...config.weddingStories.stories];
                              updated[idx].image = url;
                              setConfig({
                                ...config,
                                weddingStories: { ...config.weddingStories, stories: updated },
                              });
                            },
                            `story-${idx}`
                          );
                        }
                      }}
                    />
                    <span className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-[11px] font-semibold text-stone-700 shadow-2xs">
                      {uploadingField === `story-${idx}` ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5 text-[#540924]" />
                      )}
                      <span>Upload</span>
                    </span>
                  </label>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Title</label>
                    <input
                      type="text"
                      value={story.title}
                      onChange={(e) => {
                        const updated = [...config.weddingStories.stories];
                        updated[idx].title = e.target.value;
                        setConfig({
                          ...config,
                          weddingStories: { ...config.weddingStories, stories: updated },
                        });
                      }}
                      className="w-full text-xs rounded-lg border border-stone-300 px-2 py-1 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Subtitle</label>
                    <input
                      type="text"
                      value={story.subtitle}
                      onChange={(e) => {
                        const updated = [...config.weddingStories.stories];
                        updated[idx].subtitle = e.target.value;
                        setConfig({
                          ...config,
                          weddingStories: { ...config.weddingStories, stories: updated },
                        });
                      }}
                      className="w-full text-xs rounded-lg border border-stone-300 px-2 py-1 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Link</label>
                    <input
                      type="text"
                      value={story.link}
                      onChange={(e) => {
                        const updated = [...config.weddingStories.stories];
                        updated[idx].link = e.target.value;
                        setConfig({
                          ...config,
                          weddingStories: { ...config.weddingStories, stories: updated },
                        });
                      }}
                      className="w-full text-xs rounded-lg border border-stone-300 px-2 py-1 bg-white font-mono"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: WEAVING LOOM STORY / SILK SWATCHES */}
        {/* ========================================================================= */}
        {activeTab === 'loom' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div>
                <h2 className="text-base font-serif font-bold text-stone-900">
                  Silk Swatches &amp; The Weaving Loom Story
                </h2>
                <p className="text-xs text-stone-500">
                  Craftsmanship swatches showing genuine weave techniques (Tested Zari, Korvai, Kadwa, etc.).
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newSwatch = {
                    title: 'Jacquard Masterpiece',
                    desc: 'Intricate punch-card floral weaves',
                    image: '/images/products/saree-rose-tanchoi.jpg',
                  };
                  setConfig({
                    ...config,
                    loomStory: {
                      ...config.loomStory,
                      swatches: [...config.loomStory.swatches, newSwatch],
                    },
                  });
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#540924] bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Craft Swatch</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">Top Badge</label>
                <input
                  type="text"
                  value={config.loomStory.badge}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      loomStory: { ...config.loomStory, badge: e.target.value },
                    })
                  }
                  className="w-full text-xs rounded-xl border border-stone-300 px-3 py-2 bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">Section Title</label>
                <input
                  type="text"
                  value={config.loomStory.title}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      loomStory: { ...config.loomStory, title: e.target.value },
                    })
                  }
                  className="w-full text-xs rounded-xl border border-stone-300 px-3 py-2 bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">Subtitle</label>
                <input
                  type="text"
                  value={config.loomStory.subtitle}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      loomStory: { ...config.loomStory, subtitle: e.target.value },
                    })
                  }
                  className="w-full text-xs rounded-xl border border-stone-300 px-3 py-2 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 pt-2">
              {config.loomStory.swatches.map((swatch, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-stone-200 p-3 bg-stone-50/50 space-y-2 flex flex-col"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-serif font-bold text-[#540924]">#{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = config.loomStory.swatches.filter((_, i) => i !== idx);
                        setConfig({
                          ...config,
                          loomStory: { ...config.loomStory, swatches: updated },
                        });
                      }}
                      className="text-rose-500 hover:text-rose-700 p-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="relative aspect-square w-full rounded-xl overflow-hidden border border-stone-300 bg-stone-100">
                    {swatch.image ? (
                      <Image src={swatch.image} alt={swatch.title} fill className="object-cover" />
                    ) : null}
                  </div>

                  <label className="block cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(
                            file,
                            (url) => {
                              const updated = [...config.loomStory.swatches];
                              updated[idx].image = url;
                              setConfig({
                                ...config,
                                loomStory: { ...config.loomStory, swatches: updated },
                              });
                            },
                            `loom-${idx}`
                          );
                        }
                      }}
                    />
                    <span className="w-full flex items-center justify-center gap-1 py-1 px-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-[10px] font-semibold text-stone-700 shadow-2xs">
                      {uploadingField === `loom-${idx}` ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Upload className="w-3 h-3 text-[#540924]" />
                      )}
                      <span>Upload</span>
                    </span>
                  </label>

                  <div>
                    <label className="block text-[9.5px] font-bold text-stone-600 mb-0.5">Title</label>
                    <input
                      type="text"
                      value={swatch.title}
                      onChange={(e) => {
                        const updated = [...config.loomStory.swatches];
                        updated[idx].title = e.target.value;
                        setConfig({
                          ...config,
                          loomStory: { ...config.loomStory, swatches: updated },
                        });
                      }}
                      className="w-full text-xs rounded-lg border border-stone-300 px-2 py-1 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[9.5px] font-bold text-stone-600 mb-0.5">Description</label>
                    <input
                      type="text"
                      value={swatch.desc}
                      onChange={(e) => {
                        const updated = [...config.loomStory.swatches];
                        updated[idx].desc = e.target.value;
                        setConfig({
                          ...config,
                          loomStory: { ...config.loomStory, swatches: updated },
                        });
                      }}
                      className="w-full text-xs rounded-lg border border-stone-300 px-2 py-1 bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 8: READY TO SHIP SAREES */}
        {/* ========================================================================= */}
        {activeTab === 'ready' && (
          <div className="space-y-6">
            <div className="border-b border-stone-200 pb-4">
              <h2 className="text-base font-serif font-bold text-stone-900">
                Ready to Ship Sarees (Express 24-hr Dispatch)
              </h2>
              <p className="text-xs text-stone-500">
                Configure the badge and title for the express dispatch sarees section.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">Badge Text</label>
                <input
                  type="text"
                  value={config.readyToShip.badge}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      readyToShip: { ...config.readyToShip, badge: e.target.value },
                    })
                  }
                  className="w-full text-xs rounded-xl border border-stone-300 px-3 py-2 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">Section Title</label>
                <input
                  type="text"
                  value={config.readyToShip.title}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      readyToShip: { ...config.readyToShip, title: e.target.value },
                    })
                  }
                  className="w-full text-xs rounded-xl border border-stone-300 px-3 py-2 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">View All Link</label>
                <input
                  type="text"
                  value={config.readyToShip.viewAllLink}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      readyToShip: { ...config.readyToShip, viewAllLink: e.target.value },
                    })
                  }
                  className="w-full text-xs rounded-xl border border-stone-300 px-3 py-2 bg-white font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 9: VISIT OUR STORES */}
        {/* ========================================================================= */}
        {activeTab === 'stores' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div>
                <h2 className="text-base font-serif font-bold text-stone-900">
                  Visit Our Stores (Showroom Network)
                </h2>
                <p className="text-xs text-stone-500">
                  Manage physical boutique addresses, timings, phone numbers, and appointment booking.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newStore: StoreLocationItem = {
                    id: `store-${Date.now()}`,
                    name: 'New Showroom City',
                    rating: '4.9',
                    reviews: '150+ Reviews',
                    address: 'Heritage Boulevard, Central Commercial Hub',
                    phone: '+91 9641145871',
                    hours: '10:00 AM - 9:00 PM',
                    image: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&q=80&w=800',
                    mapQuery: 'Royal Saree Showroom',
                  };
                  setConfig({
                    ...config,
                    stores: {
                      ...config.stores,
                      stores: [...config.stores.stores, newStore],
                    },
                  });
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#540924] bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Retail Showroom</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">Top Badge</label>
                <input
                  type="text"
                  value={config.stores.badge}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      stores: { ...config.stores, badge: e.target.value },
                    })
                  }
                  className="w-full text-xs rounded-xl border border-stone-300 px-3 py-2 bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">Section Title</label>
                <input
                  type="text"
                  value={config.stores.title}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      stores: { ...config.stores, title: e.target.value },
                    })
                  }
                  className="w-full text-xs rounded-xl border border-stone-300 px-3 py-2 bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">Subtitle</label>
                <input
                  type="text"
                  value={config.stores.subtitle}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      stores: { ...config.stores, subtitle: e.target.value },
                    })
                  }
                  className="w-full text-xs rounded-xl border border-stone-300 px-3 py-2 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
              {config.stores.stores.map((store, idx) => (
                <div
                  key={store.id || idx}
                  className="rounded-2xl border border-stone-200 p-4 bg-stone-50/50 space-y-3 flex flex-col hover:border-stone-300 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-serif font-bold text-[#540924]">Showroom #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = config.stores.stores.filter((_, i) => i !== idx);
                        setConfig({
                          ...config,
                          stores: { ...config.stores, stores: updated },
                        });
                      }}
                      className="text-rose-500 hover:text-rose-700 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden border border-stone-300 bg-stone-100">
                    {store.image ? (
                      <Image src={store.image} alt={store.name} fill className="object-cover" />
                    ) : null}
                  </div>

                  <label className="block cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(
                            file,
                            (url) => {
                              const updated = [...config.stores.stores];
                              updated[idx].image = url;
                              setConfig({
                                ...config,
                                stores: { ...config.stores, stores: updated },
                              });
                            },
                            `store-${idx}`
                          );
                        }
                      }}
                    />
                    <span className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-[11px] font-semibold text-stone-700 shadow-2xs">
                      {uploadingField === `store-${idx}` ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5 text-[#540924]" />
                      )}
                      <span>Upload Storefront Photo</span>
                    </span>
                  </label>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Showroom Name</label>
                    <input
                      type="text"
                      value={store.name}
                      onChange={(e) => {
                        const updated = [...config.stores.stores];
                        updated[idx].name = e.target.value;
                        setConfig({
                          ...config,
                          stores: { ...config.stores, stores: updated },
                        });
                      }}
                      className="w-full text-xs rounded-lg border border-stone-300 px-2.5 py-1.5 bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Rating</label>
                      <input
                        type="text"
                        value={store.rating}
                        onChange={(e) => {
                          const updated = [...config.stores.stores];
                          updated[idx].rating = e.target.value;
                          setConfig({
                            ...config,
                            stores: { ...config.stores, stores: updated },
                          });
                        }}
                        className="w-full text-xs rounded-lg border border-stone-300 px-2.5 py-1.5 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Reviews Count</label>
                      <input
                        type="text"
                        value={store.reviews}
                        onChange={(e) => {
                          const updated = [...config.stores.stores];
                          updated[idx].reviews = e.target.value;
                          setConfig({
                            ...config,
                            stores: { ...config.stores, stores: updated },
                          });
                        }}
                        className="w-full text-xs rounded-lg border border-stone-300 px-2.5 py-1.5 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Full Physical Address</label>
                    <textarea
                      rows={2}
                      value={store.address}
                      onChange={(e) => {
                        const updated = [...config.stores.stores];
                        updated[idx].address = e.target.value;
                        setConfig({
                          ...config,
                          stores: { ...config.stores, stores: updated },
                        });
                      }}
                      className="w-full text-xs rounded-lg border border-stone-300 px-2.5 py-1.5 bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Phone / Contact</label>
                      <input
                        type="text"
                        value={store.phone}
                        onChange={(e) => {
                          const updated = [...config.stores.stores];
                          updated[idx].phone = e.target.value;
                          setConfig({
                            ...config,
                            stores: { ...config.stores, stores: updated },
                          });
                        }}
                        className="w-full text-xs rounded-lg border border-stone-300 px-2.5 py-1.5 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Working Hours</label>
                      <input
                        type="text"
                        value={store.hours}
                        onChange={(e) => {
                          const updated = [...config.stores.stores];
                          updated[idx].hours = e.target.value;
                          setConfig({
                            ...config,
                            stores: { ...config.stores, stores: updated },
                          });
                        }}
                        className="w-full text-xs rounded-lg border border-stone-300 px-2.5 py-1.5 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 mb-0.5">
                      Google Maps Query
                    </label>
                    <input
                      type="text"
                      value={store.mapQuery}
                      onChange={(e) => {
                        const updated = [...config.stores.stores];
                        updated[idx].mapQuery = e.target.value;
                        setConfig({
                          ...config,
                          stores: { ...config.stores, stores: updated },
                        });
                      }}
                      className="w-full text-xs rounded-lg border border-stone-300 px-2.5 py-1.5 bg-white font-mono"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Bar for Quick Saving */}
      <div className="sticky bottom-4 z-30 flex items-center justify-between p-4 bg-white/95 backdrop-blur-md rounded-2xl border border-stone-200/90 shadow-xl">
        <div className="text-xs text-stone-500 font-medium hidden sm:block">
          Manage and publish real-time changes to the storefront homepage.
        </div>
        <div className="flex items-center gap-3 ml-auto">
          <button
            onClick={handleReset}
            disabled={saving}
            className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-[#540924] hover:bg-[#3d0517] rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Publishing...' : 'Save & Publish Homepage'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
