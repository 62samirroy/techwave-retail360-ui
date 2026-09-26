'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { ProductCard } from '@/components/shop/ProductCard';
import { ProductGridSkeleton, EmptyState } from '@/components/ui/LoadingState';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { ProductData, CategoryData } from '@/types';

export default function CategoryPage({ params }: { params?: { slug?: string } }) {
  const routeParams = useParams();
  const slug = (params?.slug || routeParams?.slug || '') as string;
  const [category, setCategory] = useState<CategoryData | null>(null);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategoryProducts() {
      try {
        const [catRes, prodRes] = await Promise.all([
          api.getCategories(),
          api.getProducts({ category: slug, limit: 20 }),
        ]);

        if (catRes.success && catRes.data) {
          const matched = catRes.data.find((c: CategoryData) => c.slug === slug);
          setCategory(matched || null);
        }

        if (prodRes.success && prodRes.data?.products) {
          setProducts(prodRes.data.products);
        }
      } catch (err) {
        console.error('Error fetching category:', err);
      } finally {
        setLoading(false);
      }
    }

    loadCategoryProducts();
  }, [slug]);

  return (
    <div className="min-h-[75vh] max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 flex flex-col">
      {/* Breadcrumb / Back button */}
      <div className="flex items-center gap-2 text-xs text-stone-500">
        <Link href="/shop" className="hover:text-[#540924] flex items-center gap-1 font-medium">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Sarees</span>
        </Link>
        <span>/</span>
        <span className="font-semibold text-[#540924]">{category?.name || slug}</span>
      </div>

      {/* Category Header - Compact Sleek Height & Reduced Darkness */}
      <div className="rounded-2xl border border-[#d4af37]/35 bg-gradient-to-r from-[#630f2c] via-[#7d173c] to-[#630f2c] text-white py-4 px-6 sm:py-5 sm:px-8 relative overflow-hidden shadow-xs">
        <div className="relative z-10 max-w-2xl space-y-1">
          <span className="text-[9.5px] font-bold uppercase tracking-[0.2em] text-[#fde68a]">
            Handloom Special Collection
          </span>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-normal">
            {category?.name || 'Exclusive Weave'}
          </h1>
          <p className="text-xs text-rose-100/90 leading-relaxed font-normal max-w-xl">
            {category?.description || 'Authentic regional weaves handcrafted with generational mastery and certified pure materials.'}
          </p>
        </div>
      </div>

      {/* Product Results */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-brand-600">
            Showing <strong className="text-brand-900">{products.length}</strong> styles
          </p>
        </div>

        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No sarees found in this category"
            description="We are currently crafting new collections for this heritage weave."
            action={{
              label: 'Explore All Sarees',
              onClick: () => {
                window.location.href = '/shop';
              },
            }}
          />
        )}
      </div>
    </div>
  );
}
