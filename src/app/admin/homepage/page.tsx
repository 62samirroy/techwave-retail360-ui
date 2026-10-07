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
  Crown,
  Eye,
  MapPin,
  Clock,
  Phone,
  Video,
} from 'lucide-react';
import { api } from '@/lib/api';
import { HomePageConfig, HeroSlide, StoreLocationItem, CraftCardItem } from '@/types/homepage';
import { DEFAULT_HOMEPAGE_CONFIG } from '@/lib/homepage-defaults';
import { cn } from '@/lib/utils';

type ActiveTab = 'hero' | 'crafts' | 'arrivals' | 'bridal' | 'video' | 'stores';

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
        setStatusMessage({ type: 'success', text: 'Homepage content published successfully!' });
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
    if (!window.confirm('Are you sure you want to restore default homepage content? This will reset all custom banners, crafts, lookbooks, and stores.')) {
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
          setStatusMessage({
            type: 'success',
            text: `${file.type.startsWith('video') ? 'Video' : 'Image'} uploaded successfully!`,
          });
        } else {
          setStatusMessage({ type: 'error', text: res.message || 'File upload failed.' });
        }
        setUploadingField(null);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to upload file.' });
      setUploadingField(null);
    }
  };

  const tabs = [
    { id: 'hero' as ActiveTab, label: '1. Hero Banners', icon: ImageIcon, count: config.heroSlides?.length },
    { id: 'crafts' as ActiveTab, label: '2. Shop by Craft', icon: Layers, count: (config.weaveCraft?.crafts || DEFAULT_HOMEPAGE_CONFIG.weaveCraft?.crafts)?.length },
    { id: 'arrivals' as ActiveTab, label: '3. New Arrivals', icon: ShoppingBag },
    { id: 'bridal' as ActiveTab, label: '4. Pure Kanchipuram Silks', icon: Crown },
    { id: 'video' as ActiveTab, label: '5. Video Showcase', icon: Film },
    { id: 'stores' as ActiveTab, label: '6. Flagship Showrooms', icon: Building2, count: config.stores?.stores?.length },
  ];

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-[#540924]" />
          <p className="text-xs text-stone-500 font-medium">Loading Homepage Management...</p>
        </div>
      </div>
    );
  }

  const currentCrafts = config.weaveCraft?.crafts || DEFAULT_HOMEPAGE_CONFIG.weaveCraft?.crafts || [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 font-sans">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-[#540924]/10 text-[#540924]">
            <Sparkles className="w-5 h-5 text-[#540924]" />
          </span>
          <div>
            <h1 className="text-xl font-serif font-bold text-[#540924]">Homepage CMS Management</h1>
            <p className="text-xs text-stone-500">
              Customize banners, craft collections, bridal lookbook, video showcase, and store showrooms.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>View Live</span>
            <ExternalLink className="w-3 h-3 text-stone-400" />
          </Link>

          <button
            onClick={handleReset}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
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
            <span>{saving ? 'Publishing...' : 'Save & Publish'}</span>
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
            className="ml-auto text-stone-400 hover:text-stone-700 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 6 Clean Navigation Tabs Matching Homepage Structure */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 bg-white p-2 rounded-2xl border border-stone-200/90 shadow-2xs no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer',
                isActive
                  ? 'bg-[#540924] text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full text-[10px] font-bold',
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

      {/* Main CMS Configuration Card */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-6 shadow-2xs space-y-6">
        {/* ========================================================================= */}
        {/* TAB 1: HERO CAROUSEL BANNERS */}
        {/* ========================================================================= */}
        {activeTab === 'hero' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div>
                <h2 className="text-base font-serif font-bold text-stone-900">Hero Carousel Banners</h2>
                <p className="text-xs text-stone-500">
                  Full-width luxury showcase slides at the very top of your homepage.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newSlide: HeroSlide = {
                    id: Date.now(),
                    title: 'New Bridal Showcase',
                    subtitle: 'Generational masterweaves woven with pure silver and gold zari.',
                    image: '/hero-banner-1.jpg',
                    ctaText: 'SHOP NOW',
                    ctaLink: '/shop',
                  };
                  setConfig({ ...config, heroSlides: [...(config.heroSlides || []), newSlide] });
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#540924] bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Hero Slide</span>
              </button>
            </div>

            <div className="space-y-5">
              {(config.heroSlides || []).map((slide, idx) => (
                <div
                  key={slide.id || idx}
                  className="rounded-2xl border border-stone-200 p-5 bg-stone-50/50 space-y-4 hover:border-stone-300 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-serif font-bold text-[#540924] px-2.5 py-1 rounded-lg bg-[#540924]/10">
                      Slide #{idx + 1}
                    </span>
                    {(config.heroSlides || []).length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (config.heroSlides || []).filter((_, i) => i !== idx);
                          setConfig({ ...config, heroSlides: updated });
                        }}
                        className="text-rose-600 hover:text-rose-800 p-1 text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove Slide</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                    {/* Thumbnail & Upload */}
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
                      <label className="cursor-pointer block">
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
                                  const updated = [...(config.heroSlides || [])];
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
                          <span>Upload Banner Image</span>
                        </span>
                      </label>
                    </div>

                    {/* Inputs */}
                    <div className="md:col-span-8 space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">
                          Headline Title *
                        </label>
                        <input
                          type="text"
                          value={slide.title}
                          onChange={(e) => {
                            const updated = [...(config.heroSlides || [])];
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
                            const updated = [...(config.heroSlides || [])];
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
                              const updated = [...(config.heroSlides || [])];
                              updated[idx].ctaText = e.target.value;
                              setConfig({ ...config, heroSlides: updated });
                            }}
                            className="w-full text-xs rounded-xl border border-stone-300 px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#540924]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-stone-700 mb-1">
                            Destination Link
                          </label>
                          <input
                            type="text"
                            value={slide.ctaLink}
                            onChange={(e) => {
                              const updated = [...(config.heroSlides || [])];
                              updated[idx].ctaLink = e.target.value;
                              setConfig({ ...config, heroSlides: updated });
                            }}
                            className="w-full text-xs rounded-xl border border-stone-300 px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#540924]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">
                          Image URL
                        </label>
                        <input
                          type="text"
                          value={slide.image}
                          onChange={(e) => {
                            const updated = [...(config.heroSlides || [])];
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
        {/* TAB 2: SHOP BY WEAVE & CRAFT */}
        {/* ========================================================================= */}
        {activeTab === 'crafts' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div>
                <h2 className="text-base font-serif font-bold text-stone-900">Shop by Weave &amp; Craft Cards</h2>
                <p className="text-xs text-stone-500">
                  Manage the 6 signature Indian craft collections displayed in traditional royal arch cards.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newCraft: CraftCardItem = {
                    id: Date.now(),
                    title: 'New Saree Craft',
                    badge: 'Handloom',
                    href: '/shop',
                    image: 'https://images.pexels.com/photos/1488312/pexels-photo-1488312.jpeg?auto=compress&cs=tinysrgb&w=600',
                  };
                  const current = config.weaveCraft?.crafts || DEFAULT_HOMEPAGE_CONFIG.weaveCraft?.crafts || [];
                  setConfig({
                    ...config,
                    weaveCraft: {
                      ...(config.weaveCraft || DEFAULT_HOMEPAGE_CONFIG.weaveCraft || { badge: '', title: '', subtitle: '', crafts: [] }),
                      crafts: [...current, newCraft],
                    },
                  });
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#540924] bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Craft Card</span>
              </button>
            </div>

            {/* Section Heading Settings */}
            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Section Badge
                </label>
                <input
                  type="text"
                  value={config.weaveCraft?.badge || 'Curated Artisan Collections'}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      weaveCraft: {
                        ...(config.weaveCraft || DEFAULT_HOMEPAGE_CONFIG.weaveCraft || { badge: '', title: '', subtitle: '', crafts: [] }),
                        badge: e.target.value,
                        crafts: currentCrafts,
                      },
                    })
                  }
                  className="w-full text-xs rounded-xl border border-stone-300 px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#540924]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Section Title
                </label>
                <input
                  type="text"
                  value={config.weaveCraft?.title || 'Shop by Weave & Craft'}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      weaveCraft: {
                        ...(config.weaveCraft || DEFAULT_HOMEPAGE_CONFIG.weaveCraft || { badge: '', title: '', subtitle: '', crafts: [] }),
                        title: e.target.value,
                        crafts: currentCrafts,
                      },
                    })
                  }
                  className="w-full text-xs rounded-xl border border-stone-300 px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#540924]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Section Subtitle
                </label>
                <input
                  type="text"
                  value={config.weaveCraft?.subtitle || "Timeless regional handlooms crafted across India's celebrated weaving heritage"}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      weaveCraft: {
                        ...(config.weaveCraft || DEFAULT_HOMEPAGE_CONFIG.weaveCraft || { badge: '', title: '', subtitle: '', crafts: [] }),
                        subtitle: e.target.value,
                        crafts: currentCrafts,
                      },
                    })
                  }
                  className="w-full text-xs rounded-xl border border-stone-300 px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#540924]"
                />
              </div>
            </div>

            {/* List of Craft Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentCrafts.map((craft, idx) => (
                <div
                  key={craft.id || idx}
                  className="rounded-2xl border border-stone-200 p-4 bg-stone-50/50 space-y-3 hover:border-stone-300 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-serif font-bold text-[#540924] px-2 py-0.5 rounded-lg bg-[#540924]/10">
                      Craft #{idx + 1}
                    </span>
                    {currentCrafts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const updated = currentCrafts.filter((_, i) => i !== idx);
                          setConfig({
                            ...config,
                            weaveCraft: {
                              ...(config.weaveCraft || DEFAULT_HOMEPAGE_CONFIG.weaveCraft || { badge: '', title: '', subtitle: '', crafts: [] }),
                              crafts: updated,
                            },
                          });
                        }}
                        className="text-rose-600 hover:text-rose-800 text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>

                  <div className="flex gap-4 items-start">
                    {/* Thumbnail & Upload */}
                    <div className="w-28 shrink-0 space-y-1.5">
                      <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden border border-stone-300 bg-stone-200 shadow-inner">
                        {craft.image ? (
                          <Image src={craft.image} alt={craft.title} fill className="object-cover" />
                        ) : (
                          <div className="flex items-center justify-center h-full text-stone-500 text-[10px]">
                            No photo
                          </div>
                        )}
                      </div>
                      <label className="cursor-pointer block">
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
                                  const updated = [...currentCrafts];
                                  updated[idx].image = url;
                                  setConfig({
                                    ...config,
                                    weaveCraft: {
                                      ...(config.weaveCraft || DEFAULT_HOMEPAGE_CONFIG.weaveCraft || { badge: '', title: '', subtitle: '', crafts: [] }),
                                      crafts: updated,
                                    },
                                  });
                                },
                                `craft-${idx}`
                              );
                            }
                          }}
                        />
                        <span className="w-full flex items-center justify-center gap-1 py-1 px-2 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-[10px] font-semibold text-stone-700 transition-colors">
                          {uploadingField === `craft-${idx}` ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Upload className="w-3 h-3 text-[#540924]" />
                          )}
                          <span>Upload</span>
                        </span>
                      </label>
                    </div>

                    {/* Inputs */}
                    <div className="flex-1 space-y-2">
                      <div>
                        <label className="block text-[10px] font-bold text-stone-700 mb-0.5">
                          Craft Title *
                        </label>
                        <input
                          type="text"
                          value={craft.title}
                          onChange={(e) => {
                            const updated = [...currentCrafts];
                            updated[idx].title = e.target.value;
                            setConfig({
                              ...config,
                              weaveCraft: {
                                ...(config.weaveCraft || DEFAULT_HOMEPAGE_CONFIG.weaveCraft || { badge: '', title: '', subtitle: '', crafts: [] }),
                                crafts: updated,
                              },
                            });
                          }}
                          className="w-full text-xs rounded-lg border border-stone-300 px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#540924]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-stone-700 mb-0.5">
                          Badge Label
                        </label>
                        <input
                          type="text"
                          value={craft.badge || ''}
                          onChange={(e) => {
                            const updated = [...currentCrafts];
                            updated[idx].badge = e.target.value;
                            setConfig({
                              ...config,
                              weaveCraft: {
                                ...(config.weaveCraft || DEFAULT_HOMEPAGE_CONFIG.weaveCraft || { badge: '', title: '', subtitle: '', crafts: [] }),
                                crafts: updated,
                              },
                            });
                          }}
                          className="w-full text-xs rounded-lg border border-stone-300 px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#540924]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-stone-700 mb-0.5">
                          Category Link
                        </label>
                        <input
                          type="text"
                          value={craft.href}
                          onChange={(e) => {
                            const updated = [...currentCrafts];
                            updated[idx].href = e.target.value;
                            setConfig({
                              ...config,
                              weaveCraft: {
                                ...(config.weaveCraft || DEFAULT_HOMEPAGE_CONFIG.weaveCraft || { badge: '', title: '', subtitle: '', crafts: [] }),
                                crafts: updated,
                              },
                            });
                          }}
                          className="w-full text-xs rounded-lg border border-stone-300 px-2.5 py-1.5 bg-white font-mono focus:outline-none focus:ring-1 focus:ring-[#540924]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-stone-700 mb-0.5">
                          Image URL
                        </label>
                        <input
                          type="text"
                          value={craft.image}
                          onChange={(e) => {
                            const updated = [...currentCrafts];
                            updated[idx].image = e.target.value;
                            setConfig({
                              ...config,
                              weaveCraft: {
                                ...(config.weaveCraft || DEFAULT_HOMEPAGE_CONFIG.weaveCraft || { badge: '', title: '', subtitle: '', crafts: [] }),
                                crafts: updated,
                              },
                            });
                          }}
                          className="w-full text-xs rounded-lg border border-stone-300 px-2.5 py-1.5 bg-white font-mono focus:outline-none focus:ring-1 focus:ring-[#540924]"
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
        {/* TAB 3: TODAY'S NEW ARRIVALS */}
        {/* ========================================================================= */}
        {activeTab === 'arrivals' && (
          <div className="space-y-6">
            <div className="border-b border-stone-200 pb-4">
              <h2 className="text-base font-serif font-bold text-stone-900">Today&apos;s New Arrivals Settings</h2>
              <p className="text-xs text-stone-500">
                Manage section title, subtitle, and the left curated feature card with direct image upload.
              </p>
            </div>

            <div className="space-y-5">
              {/* Section Header */}
              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50">
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Section Headline Title *
                </label>
                <input
                  type="text"
                  value={config.newArrivals?.sectionTitle || "Today's New Arrivals"}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      newArrivals: {
                        ...(config.newArrivals || DEFAULT_HOMEPAGE_CONFIG.newArrivals),
                        sectionTitle: e.target.value,
                      },
                    })
                  }
                  className="w-full text-xs rounded-xl border border-stone-300 px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#540924]"
                />
              </div>

              {/* Curated Card Settings with Upload */}
              <div className="p-5 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#540924]" />
                  <h3 className="text-xs font-serif font-bold text-stone-900 uppercase tracking-wider">
                    Curated Combos Highlight Card
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                  {/* Image & Upload */}
                  <div className="md:col-span-4 space-y-2">
                    <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden border border-stone-300 bg-stone-900 shadow-inner">
                      {config.newArrivals?.curatedCard?.image ? (
                        <Image
                          src={config.newArrivals.curatedCard.image}
                          alt="Curated Combos"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-stone-500 text-xs">
                          No image
                        </div>
                      )}
                    </div>
                    <label className="cursor-pointer block">
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
                                    ...(config.newArrivals || DEFAULT_HOMEPAGE_CONFIG.newArrivals),
                                    curatedCard: {
                                      ...(config.newArrivals?.curatedCard || DEFAULT_HOMEPAGE_CONFIG.newArrivals.curatedCard),
                                      image: url,
                                    },
                                  },
                                });
                              },
                              'curated-image'
                            );
                          }
                        }}
                      />
                      <span className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 shadow-2xs transition-colors">
                        {uploadingField === 'curated-image' ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5 text-[#540924]" />
                        )}
                        <span>Upload Card Image</span>
                      </span>
                    </label>
                  </div>

                  {/* Inputs */}
                  <div className="md:col-span-8 space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        Card Title
                      </label>
                      <input
                        type="text"
                        value={config.newArrivals?.curatedCard?.title || ''}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            newArrivals: {
                              ...(config.newArrivals || DEFAULT_HOMEPAGE_CONFIG.newArrivals),
                              curatedCard: {
                                ...(config.newArrivals?.curatedCard || DEFAULT_HOMEPAGE_CONFIG.newArrivals.curatedCard),
                                title: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full text-xs rounded-xl border border-stone-300 px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#540924]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        Card Subtitle / Description
                      </label>
                      <textarea
                        rows={3}
                        value={config.newArrivals?.curatedCard?.subtitle || ''}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            newArrivals: {
                              ...(config.newArrivals || DEFAULT_HOMEPAGE_CONFIG.newArrivals),
                              curatedCard: {
                                ...(config.newArrivals?.curatedCard || DEFAULT_HOMEPAGE_CONFIG.newArrivals.curatedCard),
                                subtitle: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full text-xs rounded-xl border border-stone-300 px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#540924]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">
                          Button Text
                        </label>
                        <input
                          type="text"
                          value={config.newArrivals?.curatedCard?.ctaText || 'SHOP NOW'}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              newArrivals: {
                                ...(config.newArrivals || DEFAULT_HOMEPAGE_CONFIG.newArrivals),
                                curatedCard: {
                                  ...(config.newArrivals?.curatedCard || DEFAULT_HOMEPAGE_CONFIG.newArrivals.curatedCard),
                                  ctaText: e.target.value,
                                },
                              },
                            })
                          }
                          className="w-full text-xs rounded-xl border border-stone-300 px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#540924]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">
                          Button Link URL
                        </label>
                        <input
                          type="text"
                          value={config.newArrivals?.curatedCard?.ctaLink || '/shop'}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              newArrivals: {
                                ...(config.newArrivals || DEFAULT_HOMEPAGE_CONFIG.newArrivals),
                                curatedCard: {
                                  ...(config.newArrivals?.curatedCard || DEFAULT_HOMEPAGE_CONFIG.newArrivals.curatedCard),
                                  ctaLink: e.target.value,
                                },
                              },
                            })
                          }
                          className="w-full text-xs rounded-xl border border-stone-300 px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#540924]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        Image Direct URL
                      </label>
                      <input
                        type="text"
                        value={config.newArrivals?.curatedCard?.image || ''}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            newArrivals: {
                              ...(config.newArrivals || DEFAULT_HOMEPAGE_CONFIG.newArrivals),
                              curatedCard: {
                                ...(config.newArrivals?.curatedCard || DEFAULT_HOMEPAGE_CONFIG.newArrivals.curatedCard),
                                image: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full text-xs rounded-xl border border-stone-300 px-3 py-2 bg-white font-mono focus:outline-none focus:ring-1 focus:ring-[#540924]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: PURE KANCHIPURAM SILKS (BRIDAL SHOWCASE) */}
        {/* ========================================================================= */}
        {activeTab === 'bridal' && (
          <div className="space-y-6">
            <div className="border-b border-stone-200 pb-4">
              <h2 className="text-base font-serif font-bold text-stone-900">Pure Kanchipuram Silks &amp; Bridal Showcase</h2>
              <p className="text-xs text-stone-500">
                Manage the sacred temple weaves section and main Bridal Silks Lookbook image upload.
              </p>
            </div>

            <div className="space-y-5">
              {/* Section Headlines */}
              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Section Badge
                  </label>
                  <input
                    type="text"
                    value={config.kanchipuram?.badge || '✦ SACRED WEAVES OF INDIA ✦'}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        kanchipuram: {
                          ...(config.kanchipuram || DEFAULT_HOMEPAGE_CONFIG.kanchipuram),
                          badge: e.target.value,
                        },
                      })
                    }
                    className="w-full text-xs rounded-xl border border-stone-300 px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#540924]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Section Title *
                  </label>
                  <input
                    type="text"
                    value={config.kanchipuram?.title || 'Pure Bridal & Heritage Silks'}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        kanchipuram: {
                          ...(config.kanchipuram || DEFAULT_HOMEPAGE_CONFIG.kanchipuram),
                          title: e.target.value,
                        },
                      })
                    }
                    className="w-full text-xs rounded-xl border border-stone-300 px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#540924]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Section Subtitle
                  </label>
                  <input
                    type="text"
                    value={config.kanchipuram?.subtitle || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        kanchipuram: {
                          ...(config.kanchipuram || DEFAULT_HOMEPAGE_CONFIG.kanchipuram),
                          subtitle: e.target.value,
                        },
                      })
                    }
                    className="w-full text-xs rounded-xl border border-stone-300 px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#540924]"
                  />
                </div>
              </div>

              {/* Main Bridal Lookbook Card with Direct Upload */}
              <div className="p-5 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#d4af37]" />
                  <h3 className="text-xs font-serif font-bold text-stone-900 uppercase tracking-wider">
                    Main Bridal Lookbook Showcase Card
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                  {/* Image & Upload */}
                  <div className="md:col-span-4 space-y-2">
                    <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden border border-stone-300 bg-stone-900 shadow-inner">
                      {config.kanchipuram?.lookbookCard?.image ? (
                        <Image
                          src={config.kanchipuram.lookbookCard.image}
                          alt="Bridal Silks"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-stone-500 text-xs">
                          No image
                        </div>
                      )}
                    </div>
                    <label className="cursor-pointer block">
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
                                    ...(config.kanchipuram || DEFAULT_HOMEPAGE_CONFIG.kanchipuram),
                                    lookbookCard: {
                                      ...(config.kanchipuram?.lookbookCard || DEFAULT_HOMEPAGE_CONFIG.kanchipuram.lookbookCard),
                                      image: url,
                                    },
                                  },
                                });
                              },
                              'bridal-image'
                            );
                          }
                        }}
                      />
                      <span className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 shadow-2xs transition-colors">
                        {uploadingField === 'bridal-image' ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5 text-[#540924]" />
                        )}
                        <span>Upload Lookbook Image</span>
                      </span>
                    </label>
                  </div>

                  {/* Inputs */}
                  <div className="md:col-span-8 space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        Lookbook Headline Title
                      </label>
                      <input
                        type="text"
                        value={config.kanchipuram?.lookbookCard?.title || 'Bridal Silks'}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            kanchipuram: {
                              ...(config.kanchipuram || DEFAULT_HOMEPAGE_CONFIG.kanchipuram),
                              lookbookCard: {
                                ...(config.kanchipuram?.lookbookCard || DEFAULT_HOMEPAGE_CONFIG.kanchipuram.lookbookCard),
                                title: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full text-xs rounded-xl border border-stone-300 px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#540924]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        Lookbook Subtitle / Description
                      </label>
                      <textarea
                        rows={3}
                        value={config.kanchipuram?.lookbookCard?.subtitle || ''}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            kanchipuram: {
                              ...(config.kanchipuram || DEFAULT_HOMEPAGE_CONFIG.kanchipuram),
                              lookbookCard: {
                                ...(config.kanchipuram?.lookbookCard || DEFAULT_HOMEPAGE_CONFIG.kanchipuram.lookbookCard),
                                subtitle: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full text-xs rounded-xl border border-stone-300 px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#540924]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        Destination Link URL
                      </label>
                      <input
                        type="text"
                        value={config.kanchipuram?.lookbookCard?.link || '/categories/kanjivaram-silk'}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            kanchipuram: {
                              ...(config.kanchipuram || DEFAULT_HOMEPAGE_CONFIG.kanchipuram),
                              lookbookCard: {
                                ...(config.kanchipuram?.lookbookCard || DEFAULT_HOMEPAGE_CONFIG.kanchipuram.lookbookCard),
                                link: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full text-xs rounded-xl border border-stone-300 px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#540924]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        Image Direct URL
                      </label>
                      <input
                        type="text"
                        value={config.kanchipuram?.lookbookCard?.image || ''}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            kanchipuram: {
                              ...(config.kanchipuram || DEFAULT_HOMEPAGE_CONFIG.kanchipuram),
                              lookbookCard: {
                                ...(config.kanchipuram?.lookbookCard || DEFAULT_HOMEPAGE_CONFIG.kanchipuram.lookbookCard),
                                image: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full text-xs rounded-xl border border-stone-300 px-3 py-2 bg-white font-mono focus:outline-none focus:ring-1 focus:ring-[#540924]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: ARTISAN VIDEO SHOWCASE (WITH VIDEO FILE UPLOAD!) */}
        {/* ========================================================================= */}
        {activeTab === 'video' && (
          <div className="space-y-6">
            <div className="border-b border-stone-200 pb-4">
              <h2 className="text-base font-serif font-bold text-stone-900">Artisan Video Showcase Banner</h2>
              <p className="text-xs text-stone-500">
                Full-width weaving craft video banner. You can provide a direct video URL or upload a video file directly.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Text & Story */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Badge Pill Text
                  </label>
                  <input
                    type="text"
                    value={config.videoBanner?.badge || 'THE ROYAL WEAVE IN MOTION'}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        videoBanner: {
                          ...(config.videoBanner || DEFAULT_HOMEPAGE_CONFIG.videoBanner),
                          badge: e.target.value,
                        },
                      })
                    }
                    className="w-full text-xs rounded-xl border border-stone-300 px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#540924]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Main Headline Title
                  </label>
                  <input
                    type="text"
                    value={config.videoBanner?.title || 'Generations of Handloom Artistry Captured on Film'}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        videoBanner: {
                          ...(config.videoBanner || DEFAULT_HOMEPAGE_CONFIG.videoBanner),
                          title: e.target.value,
                        },
                      })
                    }
                    className="w-full text-xs rounded-xl border border-stone-300 px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#540924]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Story Description
                  </label>
                  <textarea
                    rows={4}
                    value={config.videoBanner?.description || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        videoBanner: {
                          ...(config.videoBanner || DEFAULT_HOMEPAGE_CONFIG.videoBanner),
                          description: e.target.value,
                        },
                      })
                    }
                    className="w-full text-xs rounded-xl border border-stone-300 px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#540924]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Primary CTA Text
                    </label>
                    <input
                      type="text"
                      value={config.videoBanner?.cta1Text || 'EXPLORE BRIDAL EDIT'}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          videoBanner: {
                            ...(config.videoBanner || DEFAULT_HOMEPAGE_CONFIG.videoBanner),
                            cta1Text: e.target.value,
                          },
                        })
                      }
                      className="w-full text-xs rounded-xl border border-stone-300 px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#540924]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Primary CTA Link
                    </label>
                    <input
                      type="text"
                      value={config.videoBanner?.cta1Link || '/shop?featured=true'}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          videoBanner: {
                            ...(config.videoBanner || DEFAULT_HOMEPAGE_CONFIG.videoBanner),
                            cta1Link: e.target.value,
                          },
                        })
                      }
                      className="w-full text-xs rounded-xl border border-stone-300 px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#540924]"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Video File Upload & Video URL */}
              <div className="space-y-4 p-5 rounded-2xl border border-stone-200 bg-stone-50/50">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Upload Video File (MP4, WebM up to 50MB)
                  </label>
                  <label className="cursor-pointer block">
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/ogg,video/quicktime,video/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(
                            file,
                            (url) => {
                              setConfig({
                                ...config,
                                videoBanner: {
                                  ...(config.videoBanner || DEFAULT_HOMEPAGE_CONFIG.videoBanner),
                                  videoUrl: url,
                                },
                              });
                            },
                            'video-file'
                          );
                        }
                      }}
                    />
                    <div className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-dashed border-[#540924]/40 bg-white hover:bg-rose-50/50 text-xs font-bold text-[#540924] shadow-2xs transition-all hover:border-[#540924]">
                      {uploadingField === 'video-file' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Uploading Video File...</span>
                        </>
                      ) : (
                        <>
                          <Video className="w-4 h-4" />
                          <span>Select &amp; Upload Video File</span>
                        </>
                      )}
                    </div>
                  </label>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Or Video URL (Direct WebM / MP4 Link)
                  </label>
                  <input
                    type="text"
                    value={config.videoBanner?.videoUrl || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        videoBanner: {
                          ...(config.videoBanner || DEFAULT_HOMEPAGE_CONFIG.videoBanner),
                          videoUrl: e.target.value,
                        },
                      })
                    }
                    className="w-full text-xs rounded-xl border border-stone-300 px-3 py-2 bg-white font-mono focus:outline-none focus:ring-1 focus:ring-[#540924]"
                  />
                </div>

                {/* Poster Image Upload & URL */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Fallback Poster Image
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={config.videoBanner?.poster || ''}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          videoBanner: {
                            ...(config.videoBanner || DEFAULT_HOMEPAGE_CONFIG.videoBanner),
                            poster: e.target.value,
                          },
                        })
                      }
                      className="flex-1 text-xs rounded-xl border border-stone-300 px-3 py-2 bg-white font-mono focus:outline-none focus:ring-1 focus:ring-[#540924]"
                    />
                    <label className="cursor-pointer shrink-0">
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
                                  videoBanner: {
                                    ...(config.videoBanner || DEFAULT_HOMEPAGE_CONFIG.videoBanner),
                                    poster: url,
                                  },
                                });
                              },
                              'video-poster'
                            );
                          }
                        }}
                      />
                      <span className="flex items-center gap-1.5 py-2 px-3 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 transition-colors">
                        {uploadingField === 'video-poster' ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5 text-[#540924]" />
                        )}
                        <span>Upload Poster</span>
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: FLAGSHIP SHOWROOMS / STORES */}
        {/* ========================================================================= */}
        {activeTab === 'stores' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div>
                <h2 className="text-base font-serif font-bold text-stone-900">Flagship Showrooms &amp; Stores</h2>
                <p className="text-xs text-stone-500">
                  Manage retail showroom locations, operating hours, phone numbers, and showroom photos.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newStore: StoreLocationItem = {
                    id: `store-${Date.now()}`,
                    name: 'New Showroom Boutique',
                    rating: '4.9',
                    reviews: '100+ Reviews',
                    address: 'Prime Commercial Hub, City',
                    phone: '+91 9641145871',
                    hours: '10:00 AM - 9:00 PM',
                    image: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&q=80&w=800',
                    mapQuery: 'Royal Saree Showroom',
                  };
                  const current = config.stores?.stores || DEFAULT_HOMEPAGE_CONFIG.stores.stores;
                  setConfig({
                    ...config,
                    stores: {
                      ...(config.stores || DEFAULT_HOMEPAGE_CONFIG.stores),
                      stores: [...current, newStore],
                    },
                  });
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#540924] bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Store Location</span>
              </button>
            </div>

            {/* Section Header Settings */}
            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Section Badge
                </label>
                <input
                  type="text"
                  value={config.stores?.badge || '✦ OUR RETAIL DESTINATIONS ✦'}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      stores: {
                        ...(config.stores || DEFAULT_HOMEPAGE_CONFIG.stores),
                        badge: e.target.value,
                      },
                    })
                  }
                  className="w-full text-xs rounded-xl border border-stone-300 px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#540924]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Section Title
                </label>
                <input
                  type="text"
                  value={config.stores?.title || 'Visit Our Stores'}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      stores: {
                        ...(config.stores || DEFAULT_HOMEPAGE_CONFIG.stores),
                        title: e.target.value,
                      },
                    })
                  }
                  className="w-full text-xs rounded-xl border border-stone-300 px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#540924]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Section Subtitle
                </label>
                <input
                  type="text"
                  value={config.stores?.subtitle || 'Experience the touch of authentic handlooms across our flagship showrooms'}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      stores: {
                        ...(config.stores || DEFAULT_HOMEPAGE_CONFIG.stores),
                        subtitle: e.target.value,
                      },
                    })
                  }
                  className="w-full text-xs rounded-xl border border-stone-300 px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#540924]"
                />
              </div>
            </div>

            {/* List of Stores */}
            <div className="space-y-4">
              {(config.stores?.stores || DEFAULT_HOMEPAGE_CONFIG.stores.stores).map((store, idx) => (
                <div
                  key={store.id || idx}
                  className="rounded-2xl border border-stone-200 p-5 bg-stone-50/50 space-y-4 hover:border-stone-300 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-serif font-bold text-[#540924] px-2.5 py-1 rounded-lg bg-[#540924]/10">
                        Store #{idx + 1}
                      </span>
                      <span className="text-xs font-bold text-stone-800">{store.name}</span>
                    </div>

                    {(config.stores?.stores || []).length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const current = config.stores?.stores || DEFAULT_HOMEPAGE_CONFIG.stores.stores;
                          const updated = current.filter((_, i) => i !== idx);
                          setConfig({
                            ...config,
                            stores: {
                              ...(config.stores || DEFAULT_HOMEPAGE_CONFIG.stores),
                              stores: updated,
                            },
                          });
                        }}
                        className="text-rose-600 hover:text-rose-800 text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove Store</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                    {/* Store Photo & Upload */}
                    <div className="md:col-span-4 space-y-2">
                      <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden border border-stone-300 bg-stone-200 shadow-inner">
                        {store.image ? (
                          <Image src={store.image} alt={store.name} fill className="object-cover" />
                        ) : (
                          <div className="flex items-center justify-center h-full text-stone-500 text-xs">
                            No photo
                          </div>
                        )}
                      </div>
                      <label className="cursor-pointer block">
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
                                  const current = [...(config.stores?.stores || DEFAULT_HOMEPAGE_CONFIG.stores.stores)];
                                  current[idx].image = url;
                                  setConfig({
                                    ...config,
                                    stores: {
                                      ...(config.stores || DEFAULT_HOMEPAGE_CONFIG.stores),
                                      stores: current,
                                    },
                                  });
                                },
                                `store-${idx}`
                              );
                            }
                          }}
                        />
                        <span className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 shadow-2xs transition-colors">
                          {uploadingField === `store-${idx}` ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Upload className="w-3.5 h-3.5 text-[#540924]" />
                          )}
                          <span>Upload Store Photo</span>
                        </span>
                      </label>
                    </div>

                    {/* Inputs */}
                    <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">
                          Store Name *
                        </label>
                        <input
                          type="text"
                          value={store.name}
                          onChange={(e) => {
                            const current = [...(config.stores?.stores || DEFAULT_HOMEPAGE_CONFIG.stores.stores)];
                            current[idx].name = e.target.value;
                            setConfig({
                              ...config,
                              stores: {
                                ...(config.stores || DEFAULT_HOMEPAGE_CONFIG.stores),
                                stores: current,
                              },
                            });
                          }}
                          className="w-full text-xs rounded-xl border border-stone-300 px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#540924]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="text"
                          value={store.phone}
                          onChange={(e) => {
                            const current = [...(config.stores?.stores || DEFAULT_HOMEPAGE_CONFIG.stores.stores)];
                            current[idx].phone = e.target.value;
                            setConfig({
                              ...config,
                              stores: {
                                ...(config.stores || DEFAULT_HOMEPAGE_CONFIG.stores),
                                stores: current,
                              },
                            });
                          }}
                          className="w-full text-xs rounded-xl border border-stone-300 px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#540924]"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">
                          Full Physical Address
                        </label>
                        <input
                          type="text"
                          value={store.address}
                          onChange={(e) => {
                            const current = [...(config.stores?.stores || DEFAULT_HOMEPAGE_CONFIG.stores.stores)];
                            current[idx].address = e.target.value;
                            setConfig({
                              ...config,
                              stores: {
                                ...(config.stores || DEFAULT_HOMEPAGE_CONFIG.stores),
                                stores: current,
                              },
                            });
                          }}
                          className="w-full text-xs rounded-xl border border-stone-300 px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#540924]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">
                          Operating Hours
                        </label>
                        <input
                          type="text"
                          value={store.hours}
                          onChange={(e) => {
                            const current = [...(config.stores?.stores || DEFAULT_HOMEPAGE_CONFIG.stores.stores)];
                            current[idx].hours = e.target.value;
                            setConfig({
                              ...config,
                              stores: {
                                ...(config.stores || DEFAULT_HOMEPAGE_CONFIG.stores),
                                stores: current,
                              },
                            });
                          }}
                          className="w-full text-xs rounded-xl border border-stone-300 px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#540924]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">
                          Google Maps Query
                        </label>
                        <input
                          type="text"
                          value={store.mapQuery}
                          onChange={(e) => {
                            const current = [...(config.stores?.stores || DEFAULT_HOMEPAGE_CONFIG.stores.stores)];
                            current[idx].mapQuery = e.target.value;
                            setConfig({
                              ...config,
                              stores: {
                                ...(config.stores || DEFAULT_HOMEPAGE_CONFIG.stores),
                                stores: current,
                              },
                            });
                          }}
                          className="w-full text-xs rounded-xl border border-stone-300 px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#540924]"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">
                          Image Direct URL
                        </label>
                        <input
                          type="text"
                          value={store.image}
                          onChange={(e) => {
                            const current = [...(config.stores?.stores || DEFAULT_HOMEPAGE_CONFIG.stores.stores)];
                            current[idx].image = e.target.value;
                            setConfig({
                              ...config,
                              stores: {
                                ...(config.stores || DEFAULT_HOMEPAGE_CONFIG.stores),
                                stores: current,
                              },
                            });
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
      </div>
    </div>
  );
}
