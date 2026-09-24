'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { api } from '@/lib/api';
import { ProductData, CategoryData } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { LoadingSpinner } from '@/components/ui/LoadingState';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        api.getProducts({ limit: 100 }),
        api.getCategories(),
      ]);

      if (prodRes.success && prodRes.data) {
        setProducts(prodRes.data.products || prodRes.data);
      }
      if (catRes.success && catRes.data) {
        setCategories(catRes.data);
      }
    } catch (err) {
      console.error('Error fetching admin products:', err);
    } finally {
      setLoading(false);
    }
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
      imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
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
        await loadData();
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
        setProducts(products.filter((p) => p.id !== id));
      } else {
        alert(res.message || 'Failed to delete product');
      }
    } catch (err) {
      alert('Network error while deleting product');
    }
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !categoryFilter || p.categoryId === categoryFilter;
    const matchesStatus = !statusFilter || p.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Header & New Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-lg border border-brand-200 shadow-xs">
        <div>
          <h1 className="text-base font-bold text-brand-950 flex items-center gap-2">
            <Package className="w-4 h-4 text-primary-600" />
            <span>Product Catalog & Saree Weaves</span>
          </h1>
          <p className="text-xs text-brand-500">
            Manage live inventory items, pricing tiers, descriptions, and visual galleries.
          </p>
        </div>
        <Button size="sm" onClick={handleOpenCreate} leftIcon={<Plus className="w-3.5 h-3.5" />}>
          Add New Saree
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-lg border border-brand-200 shadow-xs flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search by title, weave, or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-3.5 h-3.5 text-brand-400" />}
          />
        </div>
        <div className="w-44">
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            options={[
              { label: 'All Categories', value: '' },
              ...categories.map((c) => ({ label: c.name, value: c.id })),
            ]}
          />
        </div>
        <div className="w-36">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { label: 'All Statuses', value: '' },
              { label: 'Active', value: 'ACTIVE' },
              { label: 'Draft', value: 'DRAFT' },
              { label: 'Archived', value: 'ARCHIVED' },
            ]}
          />
        </div>
        <span className="text-xs font-mono text-brand-500 ml-auto">
          Showing {filteredProducts.length} of {products.length} sarees
        </span>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="flex h-64 items-center justify-center bg-white rounded-lg border border-brand-200">
          <LoadingSpinner message="Loading catalog..." />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white p-8 rounded-lg border border-brand-200 text-center text-xs text-brand-500">
          No products matched your search or filters.
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-brand-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-50 border-b border-brand-200 text-brand-600 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Item / Image</th>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Price</th>
                  <th className="py-2.5 px-3">Stock Level</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Badges</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100">
                {filteredProducts.map((p) => {
                  const currentStock = p.inventory?.currentStock ?? p.stock ?? 0;
                  const isLow = currentStock <= (p.lowStockThreshold || 5);
                  const isOut = currentStock === 0;

                  return (
                    <tr key={p.id} className="hover:bg-brand-50/50 transition-colors">
                      {/* Image & Title */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="relative h-10 w-8 rounded overflow-hidden bg-brand-100 shrink-0 border border-brand-200">
                            {p.images?.[0]?.url ? (
                              <Image
                                src={p.images[0].url}
                                alt={p.name}
                                fill
                                className="object-cover"
                                sizes="32px"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-brand-400">
                                <Package className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="font-semibold text-brand-950 block truncate max-w-[200px]">
                              {p.name}
                            </span>
                            <span className="text-[10px] text-brand-400 truncate block max-w-[200px]">
                              {p.shortDescription || p.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="py-2.5 px-3 font-mono text-[11px] text-brand-700">
                        {p.sku}
                      </td>

                      {/* Category */}
                      <td className="py-2.5 px-3 text-brand-600 font-medium">
                        {p.category?.name || 'Unassigned'}
                      </td>

                      {/* Price */}
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-brand-900 font-mono">
                          <PriceDisplay amount={p.price} />
                        </div>
                        {p.discountPrice && (
                          <div className="text-[10px] text-emerald-600 font-mono">
                            Offer: ₹{p.discountPrice}
                          </div>
                        )}
                      </td>

                      {/* Stock Level */}
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 font-mono font-bold px-1.5 py-0.5 rounded text-[11px] ${
                            isOut
                              ? 'bg-rose-100 text-rose-800'
                              : isLow
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-50 text-emerald-800'
                          }`}
                        >
                          {currentStock} units
                          {isLow && !isOut && (
                            <span className="text-[9px] uppercase font-sans font-bold">Low</span>
                          )}
                          {isOut && (
                            <span className="text-[9px] uppercase font-sans font-bold">Out</span>
                          )}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            p.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-brand-200 text-brand-700'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>

                      {/* Badges */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1">
                          {p.isFeatured && (
                            <span title="Featured" className="text-amber-500">
                              <Star className="w-3.5 h-3.5 fill-current" />
                            </span>
                          )}
                          {p.isBestseller && (
                            <span title="Bestseller" className="text-rose-500">
                              <Flame className="w-3.5 h-3.5 fill-current" />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            title="Edit Product"
                            className="p-1 text-brand-500 hover:text-primary-600 rounded transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            title="Delete Product"
                            className="p-1 text-brand-400 hover:text-rose-600 rounded transition-colors"
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
        </div>
      )}

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'create' ? 'Add New Royal Saree' : `Edit Product: ${selectedProduct?.name}`}
        size="lg"
      >
        <form onSubmit={handleSaveProduct} className="space-y-3">
          {formError && (
            <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Input
                label="Product Name *"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Royal Banarasi Katan Silk Saree"
              />
            </div>
            <div>
              <Input
                label="SKU Identifier *"
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="RSF-1001"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Select
                label="Category *"
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                options={categories.map((c) => ({ label: c.name, value: c.id }))}
              />
            </div>
            <div>
              <Input
                label="Price (₹) *"
                type="number"
                required
                min="1"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="14500"
              />
            </div>
            <div>
              <Input
                label="Discount Price (₹, optional)"
                type="number"
                min="0"
                value={formData.discountPrice}
                onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                placeholder="12999"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Input
                label="Initial Stock *"
                type="number"
                required
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="15"
              />
            </div>
            <div>
              <Input
                label="Low Stock Threshold"
                type="number"
                required
                min="1"
                value={formData.lowStockThreshold}
                onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                placeholder="5"
              />
            </div>
            <div>
              <Select
                label="Status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                options={[
                  { label: 'Active (Visible on Storefront)', value: 'ACTIVE' },
                  { label: 'Draft (Hidden)', value: 'DRAFT' },
                  { label: 'Archived', value: 'ARCHIVED' },
                ]}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-brand-700 mb-1">
              Short Description (Highlighted Features)
            </label>
            <input
              type="text"
              className="w-full rounded border border-brand-300 px-3 py-1.5 text-xs text-brand-900 focus:outline-none focus:ring-1 focus:ring-primary-500"
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              placeholder="Pure Mulberry silk handwoven with authentic gold zari kadwa motifs."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-brand-700 mb-1">
              Full Product Description *
            </label>
            <textarea
              required
              rows={3}
              className="w-full rounded border border-brand-300 px-3 py-1.5 text-xs text-brand-900 focus:outline-none focus:ring-1 focus:ring-primary-500 font-sans"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide complete weave details, fabric origin, zari composition, wash care instructions..."
            />
          </div>

          <div>
            <Input
              label="Primary Image URL"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://images.unsplash.com/..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 text-xs text-brand-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="rounded text-primary-600 focus:ring-primary-500"
                />
                <span>Featured Collection</span>
              </label>

              <label className="flex items-center gap-1.5 text-xs text-brand-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isBestseller}
                  onChange={(e) => setFormData({ ...formData, isBestseller: e.target.checked })}
                  className="rounded text-primary-600 focus:ring-primary-500"
                />
                <span>Bestseller Ribbon</span>
              </label>
            </div>

            <div>
              <input
                type="text"
                className="w-full rounded border border-brand-300 px-3 py-1.5 text-xs text-brand-900 focus:outline-none focus:ring-1 focus:ring-primary-500"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="Comma tags: wedding, silk, handloom"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-brand-200">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={submitting} leftIcon={<Save className="w-3.5 h-3.5" />}>
              {modalMode === 'create' ? 'Create Product' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
