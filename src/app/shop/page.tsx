'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Filter, X, ArrowUpDown, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from '@/components/shop/ProductCard';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { ProductGridSkeleton, EmptyState } from '@/components/ui/LoadingState';
import { api } from '@/lib/api';
import { ProductData, CategoryData } from '@/types';

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<ProductData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filter states from URL or defaults
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const sort = searchParams.get('sort') || 'newest';
  const inStock = searchParams.get('inStock') === 'true';
  const page = Number(searchParams.get('page')) || 1;

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // Load categories once
  useEffect(() => {
    api.getCategories().then((res) => {
      if (res.success && res.data) {
        setCategories(res.data);
      }
    });
  }, []);

  // Fetch products whenever search params change
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const queryParams: Record<string, string> = {
          page: String(page),
          limit: '12',
          sort,
        };
        if (search) queryParams.search = search;
        if (category) queryParams.category = category;
        if (minPrice) queryParams.minPrice = minPrice;
        if (maxPrice) queryParams.maxPrice = maxPrice;
        if (inStock) queryParams.inStock = 'true';

        const res = await api.getProducts(queryParams);
        if (res.success && res.data) {
          setProducts(res.data.products);
          setTotalCount(res.data.pagination.total);
          setTotalPages(res.data.pagination.totalPages);
        }
      } catch (err) {
        console.error('Failed to fetch shop products:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [search, category, minPrice, maxPrice, sort, inStock, page]);

  const updateFilters = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newParams).forEach(([k, v]) => {
      if (v === null || v === '') {
        params.delete(k);
      } else {
        params.set(k, v);
      }
    });

    params.set('page', '1'); // reset page on filter change
    router.push(`/shop?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push('/shop');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchInput.trim() || null });
  };

  const hasActiveFilters = Boolean(search || category || minPrice || maxPrice || inStock);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner / Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-brand-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-brand-950">
            Saree & Fashion Collection
          </h1>
          <p className="text-xs text-brand-500 mt-0.5">
            Showing <strong className="text-brand-900">{totalCount}</strong> authentic handloom & contemporary sarees
          </p>
        </div>

        {/* Top Controls: Mobile Filter Toggle & Sort Select */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden gap-1.5"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
          </Button>

          <div className="flex items-center gap-1.5 text-xs text-brand-600">
            <span className="hidden sm:inline font-medium">Sort by:</span>
            <select
              value={sort}
              onChange={(e) => updateFilters({ sort: e.target.value })}
              className="rounded-md border border-brand-300 bg-white px-2.5 py-1 text-xs text-brand-900 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="popular">Popular Featured</option>
              <option value="bestseller">Best Selling</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Layout (Sidebar + Product Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Desktop Sidebar Filters */}
        <aside
          className={`lg:col-span-3 space-y-5 bg-white lg:bg-transparent p-4 lg:p-0 rounded-lg border lg:border-0 border-brand-200 ${
            mobileFilterOpen ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="flex items-center justify-between border-b border-brand-200 pb-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-900">
              Filter Options
            </h3>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-[11px] text-primary-600 hover:text-primary-700 font-medium"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Search Box */}
          <div>
            <label className="block text-xs font-semibold text-brand-800 mb-1.5">
              Search by Weave or SKU
            </label>
            <form onSubmit={handleSearchSubmit} className="flex gap-1.5">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="e.g. Kanjivaram, Organza, Red..."
                className="w-full rounded-md border border-brand-300 px-2.5 py-1 text-xs text-brand-900 placeholder:text-brand-400 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              <Button type="submit" size="xs" variant="primary">
                Go
              </Button>
            </form>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-xs font-semibold text-brand-800 mb-1.5">
              Weave Category
            </label>
            <div className="space-y-1">
              <button
                onClick={() => updateFilters({ category: null })}
                className={`w-full text-left text-xs px-2 py-1 rounded transition-colors ${
                  !category ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-brand-700 hover:bg-brand-50'
                }`}
              >
                All Categories
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => updateFilters({ category: c.slug })}
                  className={`w-full text-left text-xs px-2 py-1 rounded flex items-center justify-between transition-colors ${
                    category === c.slug
                      ? 'bg-primary-50 text-primary-700 font-semibold'
                      : 'text-brand-700 hover:bg-brand-50'
                  }`}
                >
                  <span className="truncate">{c.name}</span>
                  <span className="text-[10px] text-brand-400 font-mono">
                    {c._count?.products || ''}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-xs font-semibold text-brand-800 mb-1.5">
              Price Range (₹)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => updateFilters({ minPrice: e.target.value || null })}
                placeholder="Min"
                className="w-1/2 rounded-md border border-brand-300 px-2 py-1 text-xs text-brand-900 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              <span className="text-xs text-brand-400">-</span>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => updateFilters({ maxPrice: e.target.value || null })}
                placeholder="Max"
                className="w-1/2 rounded-md border border-brand-300 px-2 py-1 text-xs text-brand-900 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Availability */}
          <div className="pt-2 border-t border-brand-200">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-brand-800">
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) => updateFilters({ inStock: e.target.checked ? 'true' : null })}
                className="rounded border-brand-300 text-primary-600 focus:ring-primary-500"
              />
              <span>In Stock Ready to Dispatch Only</span>
            </label>
          </div>
        </aside>

        {/* Products Grid & Results */}
        <main className="lg:col-span-9 space-y-6">
          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-1.5 bg-brand-50 p-2 rounded-md border border-brand-200 text-xs">
              <span className="font-semibold text-brand-600 text-[11px] mr-1">Active:</span>
              {search && (
                <span className="inline-flex items-center gap-1 rounded bg-white px-2 py-0.5 border border-brand-200 text-brand-800 text-[11px]">
                  &quot;{search}&quot;
                  <X className="w-3 h-3 cursor-pointer text-brand-400 hover:text-brand-700" onClick={() => updateFilters({ search: null })} />
                </span>
              )}
              {category && (
                <span className="inline-flex items-center gap-1 rounded bg-white px-2 py-0.5 border border-brand-200 text-brand-800 text-[11px]">
                  {categories.find((c) => c.slug === category)?.name || category}
                  <X className="w-3 h-3 cursor-pointer text-brand-400 hover:text-brand-700" onClick={() => updateFilters({ category: null })} />
                </span>
              )}
              {(minPrice || maxPrice) && (
                <span className="inline-flex items-center gap-1 rounded bg-white px-2 py-0.5 border border-brand-200 text-brand-800 text-[11px]">
                  ₹{minPrice || '0'} - ₹{maxPrice || '∞'}
                  <X className="w-3 h-3 cursor-pointer text-brand-400 hover:text-brand-700" onClick={() => updateFilters({ minPrice: null, maxPrice: null })} />
                </span>
              )}
              {inStock && (
                <span className="inline-flex items-center gap-1 rounded bg-white px-2 py-0.5 border border-brand-200 text-brand-800 text-[11px]">
                  In Stock Only
                  <X className="w-3 h-3 cursor-pointer text-brand-400 hover:text-brand-700" onClick={() => updateFilters({ inStock: null })} />
                </span>
              )}
              <button
                onClick={clearAllFilters}
                className="text-[11px] text-rose-600 hover:underline ml-auto font-medium"
              >
                Reset
              </button>
            </div>
          )}

          {/* Grid or Loading or Empty State */}
          {loading ? (
            <ProductGridSkeleton count={8} />
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No sarees match your filters"
              description="Try clearing your price range, searching a different weave, or selecting All Categories."
              action={{ label: 'Reset All Filters', onClick: clearAllFilters }}
            />
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-brand-200 pt-4">
              <Button
                variant="outline"
                size="xs"
                disabled={page <= 1}
                onClick={() => updateFilters({ page: String(page - 1) })}
                icon={<ChevronLeft className="w-3 h-3" />}
              >
                Previous
              </Button>
              <span className="text-xs text-brand-600">
                Page <strong className="text-brand-900">{page}</strong> of <strong>{totalPages}</strong>
              </span>
              <Button
                variant="outline"
                size="xs"
                disabled={page >= totalPages}
                onClick={() => updateFilters({ page: String(page + 1) })}
              >
                <span>Next</span>
                <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <React.Suspense fallback={<ProductGridSkeleton count={8} />}>
      <ShopContent />
    </React.Suspense>
  );
}

