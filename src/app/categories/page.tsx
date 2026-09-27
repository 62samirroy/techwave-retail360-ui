'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles } from 'lucide-react';
import { CategoryCardSkeleton } from '@/components/ui/LoadingState';
import { api } from '@/lib/api';
import { CategoryData } from '@/types';

export default function CategoriesIndexPage() {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getCategories();
        if (res.success && res.data) {
          setCategories(res.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-[75vh] max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 flex flex-col">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#b48325]">
          HERITAGE DIRECTORY
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#540924]">
          Masterloom Categories
        </h1>
        <p className="text-xs sm:text-sm text-stone-600">
          Discover certified Silk Mark weaves from India&apos;s most celebrated artisan regions
        </p>
      </div>

      {/* Categories Grid or Skeleton Loader */}
      {loading ? (
        <CategoryCardSkeleton count={6} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/categories/${cat.slug}`}
            className="group rounded-3xl overflow-hidden border border-stone-200 bg-white shadow-xs hover:border-[#540924] hover:shadow-xl transition-all duration-300 flex flex-col"
          >
            <div className="relative aspect-[16/11] w-full overflow-hidden bg-stone-100">
              <Image
                src={cat.image || 'https://images.pexels.com/photos/1488312/pexels-photo-1488312.jpeg'}
                alt={cat.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover group-hover:scale-106 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#380419]/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <span className="text-xs font-semibold text-[#fef3c7] bg-[#540924]/90 backdrop-blur-xs px-2.5 py-1 rounded-full border border-[#d4af37]/30">
                  {cat._count?.products || 'Exclusive'} Weaves
                </span>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between space-y-2">
              <div>
                <h2 className="text-lg font-serif font-bold text-stone-900 group-hover:text-[#540924] transition-colors">
                  {cat.name}
                </h2>
                <p className="text-xs text-stone-500 leading-relaxed line-clamp-2 mt-1">
                  {cat.description}
                </p>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-[#540924]">
                <span>Explore Saree Catalog</span>
                <ArrowRight className="w-4 h-4 text-[#b48325] group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
        </div>
      )}
    </div>
  );
}
