'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Save,
  AlertCircle,
  ExternalLink,
  Package,
} from 'lucide-react';
import { api } from '@/lib/api';
import { CategoryData } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/LoadingState';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedCategory, setSelectedCategory] = useState<CategoryData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    status: 'ACTIVE',
    sortOrder: '1',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await api.getCategories();
      if (res.success && res.data) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setModalMode('create');
    setSelectedCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      status: 'ACTIVE',
      sortOrder: (categories.length + 1).toString(),
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category: CategoryData) => {
    setModalMode('edit');
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      image: category.image || '',
      status: category.status,
      sortOrder: category.sortOrder?.toString() || '1',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    try {
      const payload = {
        name: formData.name,
        slug:
          formData.slug ||
          formData.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, ''),
        description: formData.description,
        image: formData.image,
        status: formData.status,
        sortOrder: parseInt(formData.sortOrder, 10) || 1,
      };

      let res;
      if (modalMode === 'create') {
        res = await api.createCategory(payload);
      } else if (selectedCategory) {
        res = await api.updateCategory(selectedCategory.id, payload);
      }

      if (res && res.success) {
        setIsModalOpen(false);
        await loadCategories();
      } else {
        setFormError(res?.message || 'Failed to save category.');
      }
    } catch (err: any) {
      setFormError(err.message || 'An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!window.confirm(`Delete category "${name}"? Only empty categories can be deleted.`)) {
      return;
    }

    try {
      const res = await api.deleteCategory(id);
      if (res.success) {
        setCategories(categories.filter((c) => c.id !== id));
      } else {
        alert(res.message || 'Failed to delete category');
      }
    } catch (err) {
      alert('Network error while deleting category');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-lg border border-brand-200 shadow-xs">
        <div>
          <h1 className="text-base font-bold text-brand-950 flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary-600" />
            <span>Saree Weave Categories & Classifications</span>
          </h1>
          <p className="text-xs text-brand-500">
            Structure your storefront catalog by regional handlooms, silks, and bridal collections.
          </p>
        </div>
        <Button size="sm" onClick={handleOpenCreate} leftIcon={<Plus className="w-3.5 h-3.5" />}>
          Add Category
        </Button>
      </div>

      {/* Categories Table */}
      {loading ? (
        <div className="flex h-64 items-center justify-center bg-white rounded-lg border border-brand-200">
          <LoadingSpinner message="Loading weave categories..." />
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white p-8 rounded-lg border border-brand-200 text-center text-xs text-brand-500">
          No categories found. Click Add Category to define your first collection.
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-brand-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-50 border-b border-brand-200 text-brand-600 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Category Banner</th>
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Slug</th>
                  <th className="py-2.5 px-3">Products</th>
                  <th className="py-2.5 px-3">Sort Order</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100">
                {categories.map((c) => (
                  <tr key={c.id} className="hover:bg-brand-50/50 transition-colors">
                    {/* Image Banner */}
                    <td className="py-2.5 px-3">
                      <div className="relative h-10 w-16 rounded overflow-hidden bg-brand-100 shrink-0 border border-brand-200">
                        {c.image ? (
                          <Image
                            src={c.image}
                            alt={c.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-brand-400">
                            <Layers className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Name & Description */}
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-brand-950">{c.name}</div>
                      <p className="text-[10px] text-brand-500 truncate max-w-[280px]">
                        {c.description || 'No description provided'}
                      </p>
                    </td>

                    {/* Slug */}
                    <td className="py-2.5 px-3 font-mono text-[11px] text-brand-600">
                      {c.slug}
                    </td>

                    {/* Count */}
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center gap-1 font-mono font-semibold bg-brand-100 text-brand-800 px-2 py-0.5 rounded text-[11px]">
                        <Package className="w-3 h-3 text-brand-500" />
                        {c._count?.products ?? 0} sarees
                      </span>
                    </td>

                    {/* Sort Order */}
                    <td className="py-2.5 px-3 font-mono text-brand-600">
                      {c.sortOrder}
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          c.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-brand-200 text-brand-700'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(c)}
                          title="Edit Category"
                          className="p-1 text-brand-500 hover:text-primary-600 rounded transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(c.id, c.name)}
                          title="Delete Category"
                          className="p-1 text-brand-400 hover:text-rose-600 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'create' ? 'Add Saree Category' : `Edit Category: ${selectedCategory?.name}`}
        size="md"
      >
        <form onSubmit={handleSaveCategory} className="space-y-3">
          {formError && (
            <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <Input
              label="Category Name *"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Kanchipuram Silk Sarees"
            />
          </div>

          <div>
            <Input
              label="URL Slug (leave blank to auto-generate)"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="kanchipuram-silk"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Input
                label="Sort Order"
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
              />
            </div>
            <div>
              <Select
                label="Status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                options={[
                  { label: 'Active (Visible)', value: 'ACTIVE' },
                  { label: 'Inactive (Hidden)', value: 'INACTIVE' },
                ]}
              />
            </div>
          </div>

          <div>
            <Input
              label="Cover Image URL"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://images.unsplash.com/..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-brand-700 mb-1">
              Category Description
            </label>
            <textarea
              rows={3}
              className="w-full rounded border border-brand-300 px-3 py-1.5 text-xs text-brand-900 focus:outline-none focus:ring-1 focus:ring-primary-500 font-sans"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Originating from Tamil Nadu, woven with pure mulberry silk and heavy gold thread..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-brand-200">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={submitting} leftIcon={<Save className="w-3.5 h-3.5" />}>
              {modalMode === 'create' ? 'Create Category' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
