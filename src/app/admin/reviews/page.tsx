'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Star,
  ShieldCheck,
  Check,
  X,
  Trash2,
  Loader2,
  Filter,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminReviews(filterStatus !== 'ALL' ? filterStatus : undefined);
      if (res.success && res.data) {
        setReviews(res.data);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [filterStatus]);

  const handleUpdateStatus = async (id: string, status: string) => {
    setActionLoadingId(id);
    try {
      const res = await api.updateReviewStatus(id, status);
      if (res.success) {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status } : r))
        );
      }
    } catch (err) {
      console.error('Update status error:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this customer review?')) return;
    setActionLoadingId(id);
    try {
      const res = await api.deleteReview(id);
      if (res.success) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err) {
      console.error('Delete review error:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const totalCount = reviews.length;
  const approvedCount = reviews.filter((r) => r.status === 'APPROVED').length;
  const avgRating = totalCount > 0
    ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / totalCount).toFixed(1)
    : '5.0';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-serif font-bold text-stone-900">
            Product Reviews &amp; Ratings Moderation
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Audit customer verified purchase reviews, verify fabric feedback, and approve public store display
          </p>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-stone-200 text-xs shadow-2xs">
          {['ALL', 'APPROVED', 'PENDING', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filterStatus === st
                  ? 'bg-stone-900 text-white font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-2xs">
          <span className="text-xs text-stone-500 block">Total Reviews</span>
          <span className="text-xl font-bold font-serif text-stone-900">{totalCount}</span>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-2xs">
          <span className="text-xs text-stone-500 block">Approved for Display</span>
          <span className="text-xl font-bold font-serif text-emerald-700">{approvedCount}</span>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-2xs">
          <span className="text-xs text-stone-500 block">Average Catalog Rating</span>
          <span className="text-xl font-bold font-serif text-amber-600">★ {avgRating} / 5.0</span>
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-3">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="rounded-2xl border border-stone-200 bg-white p-5 shadow-2xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-xs text-stone-900">{rev.userName}</span>
                  {rev.isVerifiedPurchase && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.2 text-[10px] font-bold">
                      <ShieldCheck className="w-3 h-3" />
                      Verified Purchase
                    </span>
                  )}
                  <span className="text-[11px] text-stone-400">• {formatDate(rev.createdAt)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                      rev.status === 'APPROVED'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : rev.status === 'REJECTED'
                        ? 'bg-rose-50 text-rose-800 border-rose-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    {rev.status}
                  </span>

                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Product Info & Review Text */}
              <div className="space-y-1.5 text-xs">
                {rev.product && (
                  <p className="text-stone-500">
                    Saree: <Link href={`/product/${rev.product.id}`} className="font-bold text-stone-900 hover:text-purple-600 underline">
                      {rev.product.name}
                    </Link>
                  </p>
                )}
                <p className="text-stone-700 leading-relaxed bg-stone-50/70 p-3 rounded-xl border border-stone-100">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>

              {/* Moderation Actions */}
              <div className="flex items-center justify-end gap-2 border-t border-stone-100 pt-3">
                {rev.status !== 'APPROVED' && (
                  <Button
                    variant="secondary"
                    size="xs"
                    disabled={actionLoadingId === rev.id}
                    onClick={() => handleUpdateStatus(rev.id, 'APPROVED')}
                    className="gap-1 text-emerald-700 border-emerald-300 hover:bg-emerald-50 text-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </Button>
                )}

                {rev.status !== 'REJECTED' && (
                  <Button
                    variant="secondary"
                    size="xs"
                    disabled={actionLoadingId === rev.id}
                    onClick={() => handleUpdateStatus(rev.id, 'REJECTED')}
                    className="gap-1 text-rose-700 border-rose-300 hover:bg-rose-50 text-xs"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </Button>
                )}

                <button
                  disabled={actionLoadingId === rev.id}
                  onClick={() => handleDeleteReview(rev.id)}
                  className="p-1.5 rounded-lg border border-stone-200 text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Delete review"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-stone-200 bg-white p-12 text-center space-y-2">
          <MessageSquare className="w-10 h-10 text-stone-300 mx-auto" />
          <h3 className="text-sm font-bold text-stone-900">No reviews found</h3>
          <p className="text-xs text-stone-500">
            {filterStatus !== 'ALL' ? `No reviews in ${filterStatus} status.` : 'Verified customer reviews will appear here for moderation.'}
          </p>
        </div>
      )}
    </div>
  );
}
