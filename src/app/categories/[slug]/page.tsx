'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ProductCard } from '@/components/shop/ProductCard';
import { ProductGridSkeleton, EmptyState } from '@/components/ui/LoadingState';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { ProductData, CategoryData } from '@/types';

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Breadcrumb / Back button */}
      <div className="flex items-center gap-2 text-xs text-brand-500">
        <Link href="/shop" className="hover:text-primary-700 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Sarees</span>
        </Link>
        <span>/</span>
        <span className="font-semibold text-brand-900">{category?.name || slug}</span>
      </div>

      {/* Category Header */}
      <div className="rounded-xl border border-brand-200 bg-gradient-to-r from-brand-900 via-primary-950 to-brand-950 text-white p-6 sm:p-8 relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-xl space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-royal-400">
            Handloom Special Collection
          </span>
          <h1 className="text-xl sm:text-3xl font-serif font-bold text-white">
            {category?.name || 'Exclusive Weave'}
          </h1>
          <p className="text-xs text-brand-300 leading-relaxed">
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
