'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Save,
  X,
  Star,
  Flame,
  Loader2,
} from 'lucide-react';
import { api } from '@/lib/api';
import { ProductData, CategoryData } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { LoadingSpinner } from '@/components/ui/LoadingState';
import { Pagination } from '@/components/ui/Pagination';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  // API Search, Filter & Pagination State
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    shortDescription: '',
    categoryId: '',
    price: '',
    discountPrice: '',
    sku: '',
    stock: '',
    lowStockThreshold: '5',
    status: 'ACTIVE',
    isFeatured: false,
    isBestseller: false,
    imageUrl: '',
    tags: '',
  });

  // Debounced Search Ref
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch Products from API with search, category, status, and pagination
  const fetchProducts = useCallback(
    async (params: {
      searchQuery?: string;
      category?: string;
      status?: string;
      page?: number;
      limit?: number;
    }) => {
      setLoading(true);
      try {
        const queryParams: Record<string, any> = {
          page: params.page ?? currentPage,
          limit: params.limit ?? pageSize,
          admin: 'true',
        };

        const activeSearch = params.searchQuery !== undefined ? params.searchQuery : search;
        if (activeSearch.trim()) {
          queryParams.search = activeSearch.trim();
        }

        const activeCat = params.category !== undefined ? params.category : categoryFilter;
        if (activeCat) {
          queryParams.category = activeCat;
        }

        const activeStatus = params.status !== undefined ? params.status : statusFilter;
        if (activeStatus && activeStatus !== 'ALL') {
          queryParams.status = activeStatus;
        }

        const res = await api.getProducts(queryParams);

        if (res.success && res.data) {
          const prods = res.data.products || (Array.isArray(res.data) ? res.data : []);
          setProducts(prods);

          if (res.data.pagination) {
            setTotalProducts(res.data.pagination.total);
            setTotalPages(res.data.pagination.totalPages || 1);
            setCurrentPage(res.data.pagination.page);
          } else {
            setTotalProducts(prods.length);
            setTotalPages(Math.ceil(prods.length / pageSize) || 1);
          }
        }
      } catch (err) {
        console.error('Error fetching admin products:', err);
      } finally {
        setLoading(false);
      }
    },
    [currentPage, pageSize, search, categoryFilter, statusFilter]
  );

  // Initial Load & Categories
  useEffect(() => {
    async function init() {
      try {
        const catRes = await api.getCategories();
        if (catRes.success && catRes.data) {
          setCategories(catRes.data);
        }
      } catch (e) {
        console.error('Failed to load categories', e);
      }
      fetchProducts({ page: 1 });
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle Search Input with 350ms debounce calling backend API
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    setCurrentPage(1);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      fetchProducts({ searchQuery: val, page: 1 });
    }, 350);
  };

  // Handle Category Filter Change calling backend API
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cat = e.target.value;
    setCategoryFilter(cat);
    setCurrentPage(1);
    fetchProducts({ category: cat, page: 1 });
  };

  // Handle Status Filter Change calling backend API
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const st = e.target.value;
    setStatusFilter(st);
    setCurrentPage(1);
    fetchProducts({ status: st, page: 1 });
  };

  // Handle Page Change calling backend API
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchProducts({ page: newPage });
  };

  // Handle Limit Change calling backend API
  const handleLimitChange = (newLimit: number) => {
    setPageSize(newLimit);
    setCurrentPage(1);
    fetchProducts({ page: 1, limit: newLimit });
  };

  const handleOpenCreate = () => {
    setModalMode('create');
    setSelectedProduct(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      shortDescription: '',
      categoryId: categories[0]?.id || '',
      price: '',
      discountPrice: '',
      sku: `RSF-${Math.floor(1000 + Math.random() * 9000)}`,
      stock: '15',
      lowStockThreshold: '5',
      status: 'ACTIVE',
      isFeatured: false,
      isBestseller: false,
      imageUrl: 'https://images.pexels.com/photos/1488312/pexels-photo-1488312.jpeg?auto=compress&cs=tinysrgb&w=800',
      tags: 'silk, wedding, pure zari',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: ProductData) => {
    setModalMode('edit');
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description,
      shortDescription: product.shortDescription || '',
      categoryId: product.categoryId,
      price: product.price.toString(),
      discountPrice: product.discountPrice ? product.discountPrice.toString() : '',
      sku: product.sku,
      stock: (product.inventory?.currentStock ?? product.stock ?? 0).toString(),
      lowStockThreshold: product.lowStockThreshold?.toString() || '5',
      status: product.status,
      isFeatured: !!product.isFeatured,
      isBestseller: !!product.isBestseller,
      imageUrl: product.images?.[0]?.url || '',
      tags: product.tags || '',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    try {
      const payload: any = {
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: formData.description,
        shortDescription: formData.shortDescription,
        categoryId: formData.categoryId,
        price: parseFloat(formData.price),
        discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : null,
        sku: formData.sku,
        stock: parseInt(formData.stock, 10),
        lowStockThreshold: parseInt(formData.lowStockThreshold, 10),
        status: formData.status,
        isFeatured: formData.isFeatured,
        isBestseller: formData.isBestseller,
        tags: formData.tags,
        images: formData.imageUrl ? [{ url: formData.imageUrl, isPrimary: true }] : [],
      };

      let res;
      if (modalMode === 'create') {
        res = await api.createProduct(payload);
      } else if (selectedProduct) {
        res = await api.updateProduct(selectedProduct.id, payload);
      }

      if (res && res.success) {
        setIsModalOpen(false);
        await fetchProducts({});
      } else {
        setFormError(res?.message || 'Failed to save product. Please check form values.');
      }
    } catch (err: any) {
      setFormError(err.message || 'An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${name}"?`)) {
      return;
    }

    try {
      const res = await api.deleteProduct(id);
      if (res.success) {
        await fetchProducts({});
      } else {
        alert(res.message || 'Failed to delete product');
      }
    } catch (err) {
      alert('Network error while deleting product');
    }
  };

  return (
    <div className="space-y-4">
      {/* Clean Unboxed Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-serif font-bold text-stone-900 tracking-tight">
              Product Catalog &amp; Handloom Inventory
            </h1>
            <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
              {totalProducts} sarees
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Live catalog synchronized with PostgreSQL database, prices, inventory levels, and visual gallery.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-[#18181B] hover:bg-black text-white px-4 py-2 text-xs font-semibold shadow-xs hover:shadow-md transition-all self-start sm:self-auto shrink-0"
        >
          <Plus className="w-3.5 h-3.5 text-purple-300" />
          <span>Add New Saree</span>
        </button>
      </div>

      {/* Unified Table Container with Integrated Toolbar in Same Div */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden flex flex-col">
        {/* Integrated Filter and Search Toolbar */}
        <div className="p-3 bg-stone-50/70 border-b border-stone-200 flex flex-wrap items-center gap-2.5">
          {/* Live API Search Input */}
          <div className="flex-1 min-w-[220px] relative">
            <input
              type="text"
              placeholder="Search by saree title, SKU, or tags..."
              value={search}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-4 py-1.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all font-medium"
            />
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
            {loading && (
              <Loader2 className="w-3.5 h-3.5 text-purple-600 animate-spin absolute right-3 top-2" />
            )}
          </div>

          {/* API Category Filter */}
          <div className="w-48">
            <select
              value={categoryFilter}
              onChange={handleCategoryChange}
              aria-label="Filter by category"
              className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-800 font-medium focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
            >
              <option value="">All Handloom Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* API Status Filter */}
          <div className="w-36">
            <select
              value={statusFilter}
              onChange={handleStatusChange}
              aria-label="Filter by status"
              className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-800 font-medium focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Sarees</option>
              <option value="DRAFT">Draft Mode</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>

        {/* Viewport-Fitted Responsive Table Body */}
        {loading && products.length === 0 ? (
          <div className="flex h-72 items-center justify-center">
            <LoadingSpinner message="Querying PostgreSQL catalog..." />
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-stone-700">No matching sarees found</p>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              Try adjusting your search keyword or clearing category and status filters.
            </p>
          </div>
        ) : (
          <div className="overflow-auto max-h-[calc(100vh-270px)] min-h-[360px]">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 z-10 bg-stone-100/95 backdrop-blur-xs border-b border-stone-200 text-stone-600 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">Saree &amp; Visual</th>
                  <th className="py-2.5 px-4">SKU Code</th>
                  <th className="py-2.5 px-4">Craft / Category</th>
                  <th className="py-2.5 px-4">Pricing</th>
                  <th className="py-2.5 px-4">Live Stock</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Badges</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {products.map((p) => {
                  const currentStock = p.inventory?.currentStock ?? p.stock ?? 0;
                  const isLow = currentStock <= (p.lowStockThreshold || 5);
                  const isOut = currentStock === 0;

                  return (
                    <tr key={p.id} className="hover:bg-purple-50/20 transition-colors">
                      {/* Image & Title */}
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-11 w-9 rounded-lg overflow-hidden bg-stone-100 shrink-0 border border-stone-200 shadow-xs">
                            {p.images?.[0]?.url ? (
                              <Image
                                src={p.images[0].url}
                                alt={p.name}
                                fill
                                className="object-cover"
                                sizes="40px"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-stone-400">
                                <Package className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="font-semibold text-stone-900 block truncate max-w-[200px]">
                              {p.name}
                            </span>
                            <span className="text-[11px] text-stone-400 truncate block max-w-[200px]">
                              {p.shortDescription || p.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="py-2.5 px-4 font-mono text-[11px] text-stone-600 font-medium">
                        {p.sku}
                      </td>

                      {/* Category */}
                      <td className="py-2.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 text-[11px] font-medium border border-stone-200/60">
                          {p.category?.name || 'Unassigned'}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-2.5 px-4">
                        <div className="font-bold text-stone-900 font-mono text-xs">
                          <PriceDisplay amount={p.price} />
                        </div>
                        {p.discountPrice && (
                          <div className="text-[10px] text-purple-700 font-semibold font-mono">
                            Offer: ₹{p.discountPrice}
                          </div>
                        )}
                      </td>

                      {/* Stock Level */}
                      <td className="py-2.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 font-mono font-bold px-2 py-0.5 rounded-md text-[11px] ${
                            isOut
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : isLow
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {currentStock} in stock
                          {isLow && !isOut && (
                            <span className="text-[9px] uppercase font-sans font-bold text-amber-900">
                              Low
                            </span>
                          )}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                            p.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : p.status === 'DRAFT'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-stone-100 text-stone-600 border border-stone-200'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>

                      {/* Badges */}
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-1.5">
                          {p.isFeatured && (
                            <span
                              title="Featured Product"
                              className="p-1 rounded bg-amber-100 text-amber-800"
                            >
                              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            </span>
                          )}
                          {p.isBestseller && (
                            <span
                              title="Bestseller"
                              className="p-1 rounded bg-rose-100 text-rose-800"
                            >
                              <Flame className="w-3 h-3 fill-rose-500 text-rose-500" />
                            </span>
                          )}
                          {!p.isFeatured && !p.isBestseller && (
                            <span className="text-stone-300 font-mono text-xs">—</span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            title="Edit Details"
                            className="p-1.5 rounded-lg text-stone-500 hover:text-purple-700 hover:bg-purple-50 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <a
                            href={`/product/${p.slug || p.id}`}
                            target="_blank"
                            rel="noreferrer"
                            title="View on Storefront"
                            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            title="Delete Saree"
                            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Connected API Pagination inside the same card */}
        <div className="border-t border-stone-200 bg-stone-50/40">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalProducts}
            limit={pageSize}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
            itemLabel="sarees"
          />
        </div>
      </div>

      {/* Product Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'create' ? 'Create New Handloom Saree' : `Edit: ${selectedProduct?.name}`}
        size="xl"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Saree Name / Title"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="e.g. Royal Crimson Kanjivaram Silk"
            />
            <Input
              label="URL Slug (Optional)"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="auto-generated-from-name"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Category
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                required
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Price (₹ INR)"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
              placeholder="12500"
            />
            <Input
              label="Discount Price (₹)"
              type="number"
              value={formData.discountPrice}
              onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
              placeholder="9800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="SKU Code"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              required
              placeholder="RSF-2026"
            />
            <Input
              label="Initial Stock"
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              required
              placeholder="15"
            />
            <Input
              label="Low Stock Threshold"
              type="number"
              value={formData.lowStockThreshold}
              onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
              placeholder="5"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Short Summary Description
            </label>
            <input
              type="text"
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              placeholder="Handwoven pure mulberry silk with gold zari border"
              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Full Saree Story &amp; Weaving Details
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              placeholder="Detailed description of silk density, artisan heritage, zari count..."
              className="w-full p-3 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
            />
          </div>

          <Input
            label="Primary High-Res Saree Photo URL"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            placeholder="https://images.pexels.com/..."
            helperText="Pexels or Unsplash high-resolution photography URL"
          />

          <Input
            label="Search Tags (Comma separated)"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder="kanjivaram, bridal, pure zari, wedding collection"
          />

          <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-stone-100">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Catalog Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-900 font-medium"
              >
                <option value="ACTIVE">ACTIVE (Visible)</option>
                <option value="DRAFT">DRAFT (Hidden)</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>

            <label className="flex items-center gap-2 text-xs font-semibold text-stone-800 cursor-pointer pt-4">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="rounded border-stone-300 text-purple-600 focus:ring-purple-500 w-4 h-4"
              />
              <span>Mark as Featured Edit</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-stone-800 cursor-pointer pt-4">
              <input
                type="checkbox"
                checked={formData.isBestseller}
                onChange={(e) => setFormData({ ...formData, isBestseller: e.target.checked })}
                className="rounded border-stone-300 text-purple-600 focus:ring-purple-500 w-4 h-4"
              />
              <span>Mark as Bestseller</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#18181B] hover:bg-black text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5 text-purple-300" />
              <span>{submitting ? 'Saving to Database...' : 'Save Product'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
