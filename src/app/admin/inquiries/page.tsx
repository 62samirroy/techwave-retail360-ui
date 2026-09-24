'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Phone,
  Mail,
  Save,
  MessageCircle,
  Eye,
} from 'lucide-react';
import { api } from '@/lib/api';
import { InquiryData } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/LoadingState';

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<InquiryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryData | null>(null);

  // Modal edit state
  const [editStatus, setEditStatus] = useState<'NEW' | 'IN_PROGRESS' | 'RESOLVED'>('NEW');
  const [editNotes, setEditNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadInquiries();
  }, [statusFilter]);

  const loadInquiries = async () => {
    setLoading(true);
    try {
      const res = await api.getInquiries(statusFilter || undefined);
      if (res.success && res.data) {
        setInquiries(res.data);
      }
    } catch (err) {
      console.error('Failed to load inquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (inquiry: InquiryData) => {
    setSelectedInquiry(inquiry);
    setEditStatus(inquiry.status);
    setEditNotes(inquiry.adminNotes || '');
  };

  const handleSaveInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiry) return;

    setSaving(true);
    try {
      const res = await api.updateInquiry(selectedInquiry.id, {
        status: editStatus,
        adminNotes: editNotes,
      });

      if (res.success) {
        setSelectedInquiry(null);
        await loadInquiries();
      } else {
        alert(res.message || 'Failed to update inquiry');
      }
    } catch (err) {
      alert('Error updating inquiry status');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-lg border border-brand-200 shadow-xs">
        <div>
          <h1 className="text-base font-bold text-brand-950 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary-600" />
            <span>Customer Inquiries & Bridal Consultation Requests</span>
          </h1>
          <p className="text-xs text-brand-500">
            Messages from prospective brides, custom blouse styling queries, and wholesale leads.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 rounded-lg border border-brand-200 shadow-xs flex items-center gap-3">
        <div className="w-48">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { label: 'All Inquiries', value: '' },
              { label: 'New / Unanswered', value: 'NEW' },
              { label: 'In Progress', value: 'IN_PROGRESS' },
              { label: 'Resolved / Closed', value: 'RESOLVED' },
            ]}
          />
        </div>
        <span className="text-xs font-mono text-brand-500 ml-auto">
          {inquiries.length} inquiry tickets
        </span>
      </div>

      {/* Inquiries Table */}
      {loading ? (
        <div className="flex h-64 items-center justify-center bg-white rounded-lg border border-brand-200">
          <LoadingSpinner message="Loading inquiries..." />
        </div>
      ) : inquiries.length === 0 ? (
        <div className="bg-white p-8 rounded-lg border border-brand-200 text-center text-xs text-brand-500">
          No customer inquiries recorded in this filter view.
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-brand-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-50 border-b border-brand-200 text-brand-600 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Client</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Inquiry Message</th>
                  <th className="py-2.5 px-3">Referenced Saree</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100">
                {inquiries.map((inq) => (
                  <tr key={inq.id} className="hover:bg-brand-50/50 transition-colors">
                    {/* Timestamp */}
                    <td className="py-2.5 px-3 font-mono text-[11px] text-brand-500">
                      {new Date(inq.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Client */}
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-brand-950">{inq.name}</div>
                      <div className="text-[10px] text-brand-500">{inq.email}</div>
                      <div className="text-[10px] text-brand-500 font-mono">{inq.phone || 'No phone'}</div>
                    </td>

                    {/* Type */}
                    <td className="py-2.5 px-3">
                      <span className="font-mono text-[10px] font-semibold bg-brand-100 text-brand-800 px-1.5 py-0.5 rounded uppercase">
                        {inq.inquiryType}
                      </span>
                    </td>

                    {/* Message Preview */}
                    <td className="py-2.5 px-3 max-w-[280px]">
                      <p className="truncate text-brand-800 font-medium">{inq.message}</p>
                      {inq.adminNotes && (
                        <p className="text-[10px] text-primary-700 italic truncate">
                          Note: {inq.adminNotes}
                        </p>
                      )}
                    </td>

                    {/* Product */}
                    <td className="py-2.5 px-3 text-brand-600">
                      {inq.product ? (
                        <span className="font-mono text-[11px] bg-brand-50 border border-brand-200 px-1.5 py-0.5 rounded">
                          {inq.product.sku}
                        </span>
                      ) : (
                        <span className="text-brand-300 italic">Store General</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          inq.status === 'NEW'
                            ? 'bg-rose-100 text-rose-800'
                            : inq.status === 'IN_PROGRESS'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {inq.status.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {inq.phone && (
                          <a
                            href={`https://wa.me/${inq.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            title="Reply on WhatsApp"
                            className="p-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenEdit(inq)}
                          leftIcon={<Eye className="w-3 h-3 text-primary-600" />}
                        >
                          Review
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review Modal */}
      <Modal
        isOpen={!!selectedInquiry}
        onClose={() => setSelectedInquiry(null)}
        title={`Review Inquiry from ${selectedInquiry?.name}`}
        size="md"
      >
        {selectedInquiry && (
          <form onSubmit={handleSaveInquiry} className="space-y-3 text-xs">
            <div className="bg-brand-50 p-3 rounded-lg border border-brand-200 space-y-1">
              <div className="flex justify-between">
                <span className="text-brand-500 font-medium">Customer:</span>
                <span className="font-bold text-brand-950">{selectedInquiry.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-500 font-medium">Email:</span>
                <span className="font-mono text-brand-800">{selectedInquiry.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-500 font-medium">Phone:</span>
                <span className="font-mono text-brand-800">{selectedInquiry.phone || 'None'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-500 font-medium">Inquiry Type:</span>
                <span className="font-mono font-bold text-brand-900">{selectedInquiry.inquiryType}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-900 mb-1">
                Customer Message
              </label>
              <div className="p-3 bg-white border border-brand-200 rounded text-brand-800 leading-relaxed">
                {selectedInquiry.message}
              </div>
            </div>

            <div>
              <Select
                label="Resolution Status"
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as any)}
                options={[
                  { label: 'New / Unattended', value: 'NEW' },
                  { label: 'In Progress (Consultant Contacting)', value: 'IN_PROGRESS' },
                  { label: 'Resolved (Completed Consultation)', value: 'RESOLVED' },
                ]}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-brand-700 mb-1">
                Admin Notes / Follow-up History
              </label>
              <textarea
                rows={3}
                className="w-full rounded border border-brand-300 px-3 py-1.5 text-xs text-brand-900 focus:outline-none focus:ring-1 focus:ring-primary-500 font-sans"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Called client on phone. Shared bridal catalog via WhatsApp..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-brand-200">
              <Button type="button" variant="outline" size="sm" onClick={() => setSelectedInquiry(null)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={saving} leftIcon={<Save className="w-3.5 h-3.5" />}>
                Save Inquiry Status
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
