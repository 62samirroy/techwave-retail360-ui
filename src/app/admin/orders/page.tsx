'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  CheckCircle,
  Truck,
  MessageCircle,
  Clock,
  ExternalLink,
  Save,
  Package,
  Loader2,
} from 'lucide-react';
import { api } from '@/lib/api';
import { OrderData, OrderStatus, PaymentStatus } from '@/types';
import { Button } from '@/components/ui/Button';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadingSpinner } from '@/components/ui/LoadingState';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);

  // API Search, Filter & Pagination State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Order Details Modal
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editStatus, setEditStatus] = useState<OrderStatus>('PENDING');
  const [editPaymentStatus, setEditPaymentStatus] = useState<PaymentStatus>('PENDING');
  const [editCarrier, setEditCarrier] = useState('');
  const [editTrackingNumber, setEditTrackingNumber] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  // Debounced search timer
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch orders directly from backend API
  const fetchOrders = useCallback(
    async (params: {
      searchQuery?: string;
      status?: string;
      paymentStatus?: string;
      page?: number;
      limit?: number;
    }) => {
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

        const activeStatus = params.status !== undefined ? params.status : statusFilter;
        if (activeStatus) {
          queryParams.status = activeStatus;
        }

        const activePayment = params.paymentStatus !== undefined ? params.paymentStatus : paymentFilter;
        if (activePayment) {
          queryParams.paymentStatus = activePayment;
        }

        const res = await api.getOrders(queryParams);
        if (res.success && res.data) {
          const fetchedOrders = res.data.orders || (Array.isArray(res.data) ? res.data : []);
          setOrders(fetchedOrders);

          if (res.data.pagination) {
            setTotalOrders(res.data.pagination.total);
            setTotalPages(res.data.pagination.totalPages || 1);
            setCurrentPage(res.data.pagination.page);
          } else {
            setTotalOrders(fetchedOrders.length);
            setTotalPages(Math.ceil(fetchedOrders.length / pageSize) || 1);
          }
        }
      } catch (err) {
        console.error('Failed to load orders from API:', err);
      } finally {
        setLoading(false);
      }
    },
    [currentPage, pageSize, search, statusFilter, paymentFilter]
  );

  useEffect(() => {
    fetchOrders({ page: 1 });
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
      fetchOrders({ searchQuery: val, page: 1 });
    }, 350);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const st = e.target.value;
    setStatusFilter(st);
    setCurrentPage(1);
    fetchOrders({ status: st, page: 1 });
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pt = e.target.value;
    setPaymentFilter(pt);
    setCurrentPage(1);
    fetchOrders({ paymentStatus: pt, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchOrders({ page: newPage });
  };

  const handleLimitChange = (newLimit: number) => {
    setPageSize(newLimit);
    setCurrentPage(1);
    fetchOrders({ page: 1, limit: newLimit });
  };

  const handleOpenDetail = (order: OrderData) => {
    setSelectedOrder(order);
    setEditStatus(order.status);
    setEditPaymentStatus(order.paymentStatus);
    setEditCarrier(order.carrier || 'Blue Dart Express');
    setEditTrackingNumber(order.trackingNumber || '');
    setEditNotes(order.notes || '');
    setIsDetailModalOpen(true);
  };

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setUpdating(true);
    try {
      const res = await api.updateOrder(selectedOrder.id, {
        status: editStatus,
        paymentStatus: editPaymentStatus,
        carrier: editCarrier || null,
        trackingNumber: editTrackingNumber || null,
        notes: editNotes || null,
      });

      if (res.success) {
        setIsDetailModalOpen(false);
        await fetchOrders({});
      } else {
        alert(res.message || 'Failed to update order');
      }
    } catch (err) {
      alert('Network error while updating order');
    } finally {
      setUpdating(false);
    }
  };

  const getWhatsAppUpdateLink = (order: OrderData) => {
    const text = encodeURIComponent(
      `Namaste ${order.customerName},\nThis is an update regarding your Royal Saree & Fashion order #${order.orderNumber}.\nStatus: ${order.status}\n${order.trackingNumber ? `Tracking No: ${order.trackingNumber} (${order.carrier || 'Express Courier'})` : ''}\nThank you for choosing Royal Saree & Fashion!`
    );
    const phone = order.customerPhone.replace(/[^0-9]/g, '');
    const cleanPhone = phone.startsWith('91') ? phone : `91${phone}`;
    return `https://wa.me/${cleanPhone}?text=${text}`;
  };

  return (
    <div className="space-y-4">
      {/* Clean Unboxed Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-serif font-bold text-stone-900 tracking-tight">
              Customer Orders &amp; Dispatch Fulfillment
            </h1>
            <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
              {totalOrders} orders
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Track customer shipments, update delivery stages, verify Razorpay settlements, and dispatch sarees.
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
              placeholder="Search by Order #, Customer Name, Email, or Phone..."
              value={search}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-4 py-1.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 font-medium transition-all"
            />
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
            {loading && (
              <Loader2 className="w-3.5 h-3.5 text-purple-600 animate-spin absolute right-3 top-2" />
            )}
          </div>

          <div className="w-44">
            <select
              value={statusFilter}
              onChange={handleStatusChange}
              aria-label="Filter by order status"
              className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-800 font-medium focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
            >
              <option value="">All Order Statuses</option>
              <option value="PENDING">Pending Approval</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PROCESSING">Processing</option>
              <option value="PACKED">Packed in Atelier</option>
              <option value="SHIPPED">Shipped with Courier</option>
              <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="w-40">
            <select
              value={paymentFilter}
              onChange={handlePaymentChange}
              aria-label="Filter by payment status"
              className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-800 font-medium focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
            >
              <option value="">All Payment Types</option>
              <option value="PAID">Paid (Razorpay/Verified)</option>
              <option value="PENDING">Pending Settlement</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>
        </div>

        {/* Viewport-Fitted Responsive Orders Table */}
        {loading && orders.length === 0 ? (
          <div className="flex h-72 items-center justify-center">
            <LoadingSpinner message="Loading orders registry from database..." />
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-stone-700">No matching customer orders found</p>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              Try adjusting your search query or reset status and payment filters.
            </p>
          </div>
        ) : (
          <div className="overflow-auto max-h-[calc(100vh-270px)] min-h-[360px]">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 z-10 bg-stone-100/95 backdrop-blur-xs border-b border-stone-200 text-stone-600 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">Order ID</th>
                  <th className="py-2.5 px-4">Customer Details</th>
                  <th className="py-2.5 px-4">Placement Date</th>
                  <th className="py-2.5 px-4">Fulfillment Status</th>
                  <th className="py-2.5 px-4">Payment</th>
                  <th className="py-2.5 px-4">Total Amount</th>
                  <th className="py-2.5 px-4">Courier Tracking</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-purple-50/20 transition-colors">
                    <td className="py-2.5 px-4 font-mono font-bold text-stone-900">
                      {order.orderNumber}
                    </td>

                    <td className="py-2.5 px-4">
                      <div className="font-semibold text-stone-900">{order.customerName}</div>
                      <div className="text-[11px] text-stone-400">{order.customerEmail}</div>
                      <div className="text-[10px] text-stone-500 font-mono">{order.customerPhone}</div>
                    </td>

                    <td className="py-2.5 px-4 font-mono text-[11px] text-stone-500">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="py-2.5 px-4">
                      <StatusBadge status={order.status} />
                    </td>

                    <td className="py-2.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          order.paymentStatus === 'PAID'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                      <div className="text-[10px] text-stone-400 uppercase font-mono mt-0.5">
                        {order.paymentMethod}
                      </div>
                    </td>

                    <td className="py-2.5 px-4 font-mono font-bold text-stone-900 text-xs">
                      <PriceDisplay amount={order.total} />
                    </td>

                    <td className="py-2.5 px-4 font-mono text-[11px] text-stone-600">
                      {order.trackingNumber ? (
                        <span className="bg-stone-100 px-2 py-0.5 rounded text-stone-800 font-medium">
                          {order.trackingNumber}
                        </span>
                      ) : (
                        <span className="text-stone-300 italic">Not Dispatched</span>
                      )}
                    </td>

                    <td className="py-2.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={getWhatsAppUpdateLink(order)}
                          target="_blank"
                          rel="noreferrer"
                          title="Send WhatsApp Update"
                          className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleOpenDetail(order)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-all"
                        >
                          <Eye className="w-3.5 h-3.5 text-purple-700" />
                          <span>Inspect</span>
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
            totalItems={totalOrders}
            limit={pageSize}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
            itemLabel="orders"
          />
        </div>
      </div>

      {/* Order Detail & Update Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Order Details: #${selectedOrder?.orderNumber}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-4">
            {/* Customer & Address Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs">
              <div>
                <h4 className="font-semibold text-stone-900 mb-1">Customer Information</h4>
                <p className="font-bold text-stone-800">{selectedOrder.customerName}</p>
                <p className="text-stone-600">{selectedOrder.customerEmail}</p>
                <p className="text-stone-600 font-mono">{selectedOrder.customerPhone}</p>
              </div>
              <div>
                <h4 className="font-semibold text-stone-900 mb-1">Shipping Destination</h4>
                <p className="text-stone-700">{selectedOrder.shippingAddress}</p>
                <p className="text-stone-700">
                  {selectedOrder.city}, {selectedOrder.state} - {selectedOrder.pinCode}
                </p>
                <p className="text-stone-500 font-medium">{selectedOrder.country}</p>
              </div>
            </div>

            {/* Items Purchased */}
            <div>
              <h4 className="text-xs font-semibold text-stone-900 mb-2">
                Purchased Sarees ({selectedOrder.items?.length || 0})
              </h4>
              <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden">
                {selectedOrder.items?.map((it: any) => (
                  <div key={it.id} className="p-3 flex items-center justify-between text-xs bg-white">
                    <div className="flex items-center gap-2.5">
                      {it.productImage && (
                        <div className="relative h-9 w-7 rounded overflow-hidden bg-stone-100 shrink-0">
                          <Image
                            src={it.productImage}
                            alt={it.productName}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-stone-900">{it.productName}</p>
                        <p className="text-[10px] text-stone-400 font-mono">
                          SKU: {it.productSku} • Qty: {it.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="text-right font-mono font-bold text-stone-900">
                      ₹{it.total}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Update Form */}
            <form onSubmit={handleUpdateOrder} className="pt-2 border-t border-stone-100 space-y-3">
              <h4 className="text-xs font-bold text-stone-900">
                Fulfillment Management &amp; Tracking
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Order Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as OrderStatus)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 font-medium focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="PROCESSING">PROCESSING</option>
                    <option value="PACKED">PACKED</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Payment Status
                  </label>
                  <select
                    value={editPaymentStatus}
                    onChange={(e) => setEditPaymentStatus(e.target.value as PaymentStatus)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 font-medium focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="PAID">PAID</option>
                    <option value="FAILED">FAILED</option>
                    <option value="REFUNDED">REFUNDED</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Courier Partner
                  </label>
                  <input
                    type="text"
                    value={editCarrier}
                    onChange={(e) => setEditCarrier(e.target.value)}
                    placeholder="e.g. Blue Dart Express, DTDC"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    AWB Tracking Number
                  </label>
                  <input
                    type="text"
                    value={editTrackingNumber}
                    onChange={(e) => setEditTrackingNumber(e.target.value)}
                    placeholder="e.g. BD98213812IN"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 font-mono focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  Internal Atelier Notes
                </label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Notes for packaging or customer delivery instructions..."
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#18181B] hover:bg-black text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5 text-purple-300" />
                  <span>{updating ? 'Updating Order...' : 'Save Fulfillment'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
}
