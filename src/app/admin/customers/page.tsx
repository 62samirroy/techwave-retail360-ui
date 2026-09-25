'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Loader2,
  Sparkles,
} from 'lucide-react';
import { api } from '@/lib/api';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { LoadingSpinner } from '@/components/ui/LoadingState';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // API Search & Pagination State
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchCustomers = useCallback(
    async (params: { searchQuery?: string; page?: number; limit?: number }) => {
      setLoading(true);
      try {
        const queryParams: Record<string, any> = {
          page: params.page ?? currentPage,
          limit: params.limit ?? pageSize,
        };

        const activeSearch = params.searchQuery !== undefined ? params.searchQuery : search;
        if (activeSearch.trim()) {
          queryParams.search = activeSearch.trim();
        }

        const res = await api.getCustomers(queryParams);
        if (res.success && res.data) {
          const fetchedCust = res.data.customers || (Array.isArray(res.data) ? res.data : []);
          setCustomers(fetchedCust);

          if (res.data.pagination) {
            setTotalCustomers(res.data.pagination.total);
            setTotalPages(res.data.pagination.totalPages || 1);
            setCurrentPage(res.data.pagination.page);
          } else {
            setTotalCustomers(fetchedCust.length);
            setTotalPages(Math.ceil(fetchedCust.length / pageSize) || 1);
          }
        }
      } catch (err) {
        console.error('Failed to load customers:', err);
      } finally {
        setLoading(false);
      }
    },
    [currentPage, pageSize, search]
  );

  useEffect(() => {
    fetchCustomers({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    setCurrentPage(1);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      fetchCustomers({ searchQuery: val, page: 1 });
    }, 350);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchCustomers({ page: newPage });
  };

  const handleLimitChange = (newLimit: number) => {
    setPageSize(newLimit);
    setCurrentPage(1);
    fetchCustomers({ page: 1, limit: newLimit });
  };

  return (
    <div className="space-y-4">
      {/* Clean Unboxed Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-serif font-bold text-stone-900 tracking-tight">
              Customer Profiles &amp; Loyalty Directory
            </h1>
            <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
              {totalCustomers} registered
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Registered saree buyers, lifetime purchase metrics, delivery locations, and personalized VIP support.
          </p>
        </div>
      </div>

      {/* Unified Table Container with Integrated Toolbar in Same Div */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden flex flex-col">
        {/* Integrated Filter and Search Toolbar */}
        <div className="p-3 bg-stone-50/70 border-b border-stone-200 flex flex-wrap items-center gap-2.5">
          <div className="flex-1 min-w-[220px] relative">
            <input
              type="text"
              placeholder="Search by customer name, email or phone number..."
              value={search}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-4 py-1.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 font-medium transition-all"
            />
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
            {loading && (
              <Loader2 className="w-3.5 h-3.5 text-purple-600 animate-spin absolute right-3 top-2" />
            )}
          </div>
        </div>

        {/* Viewport-Fitted Responsive Customers Table */}
        {loading && customers.length === 0 ? (
          <div className="flex h-72 items-center justify-center">
            <LoadingSpinner message="Querying customer database..." />
          </div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-stone-700">No customer accounts matched your query</p>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              Try searching with a partial name, phone digits, or clear the search field.
            </p>
          </div>
        ) : (
          <div className="overflow-auto max-h-[calc(100vh-270px)] min-h-[360px]">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 z-10 bg-stone-100/95 backdrop-blur-xs border-b border-stone-200 text-stone-600 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">Customer Name</th>
                  <th className="py-2.5 px-4">Contact Info</th>
                  <th className="py-2.5 px-4">Registered Date</th>
                  <th className="py-2.5 px-4">Lifetime Orders</th>
                  <th className="py-2.5 px-4">Total Spent</th>
                  <th className="py-2.5 px-4">Primary Destination</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-purple-50/20 transition-colors">
                    {/* Name */}
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                          {customer.name?.charAt(0).toUpperCase() || 'C'}
                        </div>
                        <div>
                          <span className="font-semibold text-stone-900 block">{customer.name}</span>
                          <span className="text-[10px] text-stone-400 font-mono">
                            ID: {customer.id.slice(0, 8)}...
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-2.5 px-4">
                      <div className="text-stone-800 font-medium">{customer.email}</div>
                      <div className="text-[11px] text-stone-500 font-mono">
                        {customer.phone || 'No phone recorded'}
                      </div>
                    </td>

                    {/* Registered Date */}
                    <td className="py-2.5 px-4 font-mono text-[11px] text-stone-500">
                      {new Date(customer.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Orders Count */}
                    <td className="py-2.5 px-4">
                      <span className="inline-flex items-center gap-1.5 font-mono font-bold bg-stone-100 text-stone-800 px-2.5 py-0.5 rounded-full text-[11px] border border-stone-200/60">
                        <ShoppingBag className="w-3 h-3 text-stone-500" />
                        {customer.orderCount} orders
                      </span>
                    </td>

                    {/* Lifetime Value */}
                    <td className="py-2.5 px-4 font-mono font-bold text-purple-700 text-xs">
                      <PriceDisplay amount={customer.totalSpent} />
                    </td>

                    {/* Location */}
                    <td className="py-2.5 px-4 text-stone-600">
                      {customer.defaultAddress ? (
                        <span>
                          {customer.defaultAddress.city}, {customer.defaultAddress.state}
                        </span>
                      ) : (
                        <span className="text-stone-300 italic">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {customer.phone && (
                          <a
                            href={`https://wa.me/${customer.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            title="Chat on WhatsApp"
                            className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => setSelectedCustomer(customer)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-all"
                        >
                          <Eye className="w-3.5 h-3.5 text-purple-700" />
                          <span>View Profile</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Connected API Pagination inside the same card */}
        <div className="border-t border-stone-200 bg-stone-50/40">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalCustomers}
            limit={pageSize}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
            itemLabel="customers"
          />
        </div>
      </div>

      {/* Customer Profile Modal */}
      <Modal
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        title={`Customer: ${selectedCustomer?.name}`}
        size="md"
      >
        {selectedCustomer && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-xl border border-stone-200">
              <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                {selectedCustomer.name?.charAt(0).toUpperCase() || 'C'}
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900">{selectedCustomer.name}</h3>
                <p className="text-stone-500 font-mono">{selectedCustomer.email}</p>
                <p className="text-stone-500 font-mono">{selectedCustomer.phone || 'No phone recorded'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <span className="text-[10px] text-stone-500 block uppercase font-bold tracking-wider">
                  Total Purchases
                </span>
                <span className="text-base font-bold font-mono text-purple-700">
                  <PriceDisplay amount={selectedCustomer.totalSpent} />
                </span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <span className="text-[10px] text-stone-500 block uppercase font-bold tracking-wider">
                  Total Orders
                </span>
                <span className="text-base font-bold font-mono text-stone-900">
                  {selectedCustomer.orderCount}
                </span>
              </div>
            </div>

            {selectedCustomer.defaultAddress && (
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <h4 className="font-semibold text-stone-900 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-purple-600" />
                  <span>Default Shipping Address</span>
                </h4>
                <p className="text-stone-700">{selectedCustomer.defaultAddress.street}</p>
                <p className="text-stone-700">
                  {selectedCustomer.defaultAddress.city}, {selectedCustomer.defaultAddress.state} -{' '}
                  {selectedCustomer.defaultAddress.pinCode}
                </p>
                <p className="text-stone-500 font-medium">{selectedCustomer.defaultAddress.country}</p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 rounded-xl font-semibold text-stone-800 transition-colors"
              >
                Close Profile
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
