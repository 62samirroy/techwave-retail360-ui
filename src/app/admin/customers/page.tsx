'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  ExternalLink,
  MessageCircle,
  Eye,
  MapPin,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { LoadingSpinner } from '@/components/ui/LoadingState';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.getCustomers();
      if (res.success && res.data) {
        setCustomers(res.data);
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search))
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-lg border border-brand-200 shadow-xs">
        <div>
          <h1 className="text-base font-bold text-brand-950 flex items-center gap-2">
            <Users className="w-4 h-4 text-primary-600" />
            <span>Customer Profiles & Loyalty Directory</span>
          </h1>
          <p className="text-xs text-brand-500">
            Registered saree buyers, lifetime purchase values, and shipping address records.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-lg border border-brand-200 shadow-xs flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search by customer name, email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-3.5 h-3.5 text-brand-400" />}
          />
        </div>
        <span className="text-xs font-mono text-brand-500 ml-auto">
          {filtered.length} customers registered
        </span>
      </div>

      {/* Customers Table */}
      {loading ? (
        <div className="flex h-64 items-center justify-center bg-white rounded-lg border border-brand-200">
          <LoadingSpinner message="Loading customer directory..." />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-8 rounded-lg border border-brand-200 text-center text-xs text-brand-500">
          No registered customer accounts found.
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-brand-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-50 border-b border-brand-200 text-brand-600 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Customer Name</th>
                  <th className="py-2.5 px-3">Contact</th>
                  <th className="py-2.5 px-3">Registered On</th>
                  <th className="py-2.5 px-3">Lifetime Orders</th>
                  <th className="py-2.5 px-3">Lifetime Value</th>
                  <th className="py-2.5 px-3">Default Location</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100">
                {filtered.map((customer) => (
                  <tr key={customer.id} className="hover:bg-brand-50/50 transition-colors">
                    {/* Name */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-primary-100 text-primary-800 flex items-center justify-center font-bold text-xs shrink-0">
                          {customer.name?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <span className="font-semibold text-brand-950 block">{customer.name}</span>
                          <span className="text-[10px] text-brand-400">ID: {customer.id.slice(0, 8)}...</span>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-2.5 px-3">
                      <div className="text-brand-800 font-medium">{customer.email}</div>
                      <div className="text-[10px] text-brand-500 font-mono">
                        {customer.phone || 'No phone recorded'}
                      </div>
                    </td>

                    {/* Registered Date */}
                    <td className="py-2.5 px-3 font-mono text-[11px] text-brand-500">
                      {new Date(customer.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Orders Count */}
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center gap-1 font-mono font-bold bg-brand-100 text-brand-800 px-2 py-0.5 rounded text-[11px]">
                        <ShoppingBag className="w-3 h-3 text-brand-500" />
                        {customer.orderCount} orders
                      </span>
                    </td>

                    {/* Lifetime Value */}
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">
                      <PriceDisplay amount={customer.totalSpent} />
                    </td>

                    {/* Location */}
                    <td className="py-2.5 px-3 text-brand-600">
                      {customer.defaultAddress ? (
                        <span>
                          {customer.defaultAddress.city}, {customer.defaultAddress.state}
                        </span>
                      ) : (
                        <span className="text-brand-300 italic">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {customer.phone && (
                          <a
                            href={`https://wa.me/${customer.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            title="Chat on WhatsApp"
                            className="p-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedCustomer(customer)}
                          leftIcon={<Eye className="w-3 h-3 text-primary-600" />}
                        >
                          View
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

      {/* Customer Detail Modal */}
      <Modal
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        title={`Customer: ${selectedCustomer?.name}`}
        size="md"
      >
        {selectedCustomer && (
          <div className="space-y-4 text-xs">
            <div className="bg-brand-50 p-3 rounded-lg border border-brand-200 space-y-1">
              <div className="flex justify-between">
                <span className="text-brand-500 font-medium">Full Name:</span>
                <span className="font-bold text-brand-950">{selectedCustomer.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-500 font-medium">Email Address:</span>
                <span className="font-mono text-brand-800">{selectedCustomer.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-500 font-medium">Mobile Phone:</span>
                <span className="font-mono text-brand-800">{selectedCustomer.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-500 font-medium">Registration Date:</span>
                <span className="font-mono text-brand-800">
                  {new Date(selectedCustomer.createdAt).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white border border-brand-200 rounded-lg">
                <span className="text-brand-500 block mb-0.5">Total Orders Placed</span>
                <span className="text-base font-bold font-mono text-brand-950">
                  {selectedCustomer.orderCount}
                </span>
              </div>
              <div className="p-3 bg-white border border-brand-200 rounded-lg">
                <span className="text-brand-500 block mb-0.5">Lifetime Spend</span>
                <span className="text-base font-bold font-mono text-emerald-700">
                  ₹{selectedCustomer.totalSpent.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {selectedCustomer.defaultAddress && (
              <div className="p-3 bg-white border border-brand-200 rounded-lg">
                <h4 className="font-semibold text-brand-900 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-primary-600" />
                  <span>Default Shipping Address</span>
                </h4>
                <p className="text-brand-700">{selectedCustomer.defaultAddress.street}</p>
                <p className="text-brand-700">
                  {selectedCustomer.defaultAddress.city}, {selectedCustomer.defaultAddress.state} -{' '}
                  {selectedCustomer.defaultAddress.pinCode}
                </p>
                <p className="text-brand-500 font-medium">{selectedCustomer.defaultAddress.country}</p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-brand-200">
              <Button size="sm" variant="outline" onClick={() => setSelectedCustomer(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
