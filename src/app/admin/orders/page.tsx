'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { api } from '@/lib/api';
import { OrderData, OrderStatus, PaymentStatus } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadingSpinner } from '@/components/ui/LoadingState';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');

  // Order Details Modal
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editStatus, setEditStatus] = useState<OrderStatus>('PENDING');
  const [editPaymentStatus, setEditPaymentStatus] = useState<PaymentStatus>('PENDING');
  const [editCarrier, setEditCarrier] = useState('');
  const [editTrackingNumber, setEditTrackingNumber] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await api.getOrders();
      if (res.success && res.data) {
        setOrders(res.data.orders || res.data);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
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
        await loadOrders();
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

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || o.status === statusFilter;
    const matchesPayment = !paymentFilter || o.paymentStatus === paymentFilter;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-lg border border-brand-200 shadow-xs">
        <div>
          <h1 className="text-base font-bold text-brand-950 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-primary-600" />
            <span>Customer Orders & Dispatch Fulfillment</span>
          </h1>
          <p className="text-xs text-brand-500">
            Track customer shipments, update fulfillment stages, and verify payment settlements.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-lg border border-brand-200 shadow-xs flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search by Order #, Customer Name, or Email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-3.5 h-3.5 text-brand-400" />}
          />
        </div>
        <div className="w-40">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { label: 'All Order Statuses', value: '' },
              { label: 'Pending', value: 'PENDING' },
              { label: 'Confirmed', value: 'CONFIRMED' },
              { label: 'Processing', value: 'PROCESSING' },
              { label: 'Packed', value: 'PACKED' },
              { label: 'Shipped', value: 'SHIPPED' },
              { label: 'Out for Delivery', value: 'OUT_FOR_DELIVERY' },
              { label: 'Delivered', value: 'DELIVERED' },
              { label: 'Cancelled', value: 'CANCELLED' },
            ]}
          />
        </div>
        <div className="w-36">
          <Select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            options={[
              { label: 'All Payments', value: '' },
              { label: 'Paid', value: 'PAID' },
              { label: 'Pending', value: 'PENDING' },
              { label: 'Failed', value: 'FAILED' },
              { label: 'Refunded', value: 'REFUNDED' },
            ]}
          />
        </div>
        <span className="text-xs font-mono text-brand-500 ml-auto">
          {filteredOrders.length} orders
        </span>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="flex h-64 items-center justify-center bg-white rounded-lg border border-brand-200">
          <LoadingSpinner message="Loading orders registry..." />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white p-8 rounded-lg border border-brand-200 text-center text-xs text-brand-500">
          No orders found matching the selected criteria.
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-brand-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-50 border-b border-brand-200 text-brand-600 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Order Number</th>
                  <th className="py-2.5 px-3">Customer Details</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Order Status</th>
                  <th className="py-2.5 px-3">Payment</th>
                  <th className="py-2.5 px-3">Total Amount</th>
                  <th className="py-2.5 px-3">Tracking</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-brand-50/50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-brand-950">
                      {order.orderNumber}
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-brand-900">{order.customerName}</div>
                      <div className="text-[10px] text-brand-400">{order.customerEmail}</div>
                      <div className="text-[10px] text-brand-500 font-mono">{order.customerPhone}</div>
                    </td>

                    <td className="py-2.5 px-3 font-mono text-[11px] text-brand-500">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="py-2.5 px-3">
                      <StatusBadge status={order.status} />
                    </td>

                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          order.paymentStatus === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                      <div className="text-[10px] text-brand-400 uppercase font-mono mt-0.5">
                        {order.paymentMethod}
                      </div>
                    </td>

                    <td className="py-2.5 px-3 font-mono font-bold text-brand-950">
                      <PriceDisplay amount={order.total} />
                    </td>

                    <td className="py-2.5 px-3 font-mono text-[10px] text-brand-600">
                      {order.trackingNumber ? (
                        <span className="bg-brand-100 px-1.5 py-0.5 rounded text-brand-800">
                          {order.trackingNumber}
                        </span>
                      ) : (
                        <span className="text-brand-300 italic">Not Dispatched</span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={getWhatsAppUpdateLink(order)}
                          target="_blank"
                          rel="noreferrer"
                          title="Send WhatsApp Update"
                          className="p-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenDetail(order)}
                          leftIcon={<Eye className="w-3 h-3 text-primary-600" />}
                        >
                          Inspect
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

      {/* Order Detail & Update Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Order Details: ${selectedOrder?.orderNumber}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-4">
            {/* Customer & Address Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-brand-50 p-3 rounded-lg border border-brand-200 text-xs">
              <div>
                <h4 className="font-semibold text-brand-900 mb-1">Customer Information</h4>
                <p className="font-medium text-brand-950">{selectedOrder.customerName}</p>
                <p className="text-brand-600">{selectedOrder.customerEmail}</p>
                <p className="text-brand-600 font-mono">{selectedOrder.customerPhone}</p>
              </div>

              <div>
                <h4 className="font-semibold text-brand-900 mb-1">Delivery Destination</h4>
                <p className="text-brand-800">{selectedOrder.shippingAddress}</p>
                <p className="text-brand-800">
                  {selectedOrder.city}, {selectedOrder.state} - {selectedOrder.pinCode}
                </p>
                <p className="text-brand-500 font-medium">{selectedOrder.country || 'India'}</p>
              </div>
            </div>

            {/* Items Summary */}
            <div>
              <h4 className="text-xs font-semibold text-brand-900 mb-2">Purchased Items</h4>
              <div className="border border-brand-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-brand-50 text-brand-600 font-medium border-b border-brand-200">
                    <tr>
                      <th className="py-2 px-3">Item</th>
                      <th className="py-2 px-3">SKU</th>
                      <th className="py-2 px-3">Price</th>
                      <th className="py-2 px-3">Qty</th>
                      <th className="py-2 px-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-100">
                    {selectedOrder.items?.map((item) => (
                      <tr key={item.id}>
                        <td className="py-2 px-3 font-medium text-brand-900">
                          {item.productName}
                        </td>
                        <td className="py-2 px-3 font-mono text-[10px] text-brand-500">
                          {item.productSku}
                        </td>
                        <td className="py-2 px-3 font-mono">₹{item.unitPrice}</td>
                        <td className="py-2 px-3 font-mono font-bold">{item.quantity}</td>
                        <td className="py-2 px-3 font-mono font-bold text-right text-brand-950">
                          ₹{item.total}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end pt-2 text-xs font-mono space-y-0.5 text-right">
                <div className="w-48 space-y-1">
                  <div className="flex justify-between text-brand-600">
                    <span>Subtotal:</span>
                    <span>₹{selectedOrder.subtotal}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount:</span>
                      <span>-₹{selectedOrder.discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-brand-600">
                    <span>Shipping:</span>
                    <span>{selectedOrder.shippingFee === 0 ? 'FREE' : `₹${selectedOrder.shippingFee}`}</span>
                  </div>
                  <div className="flex justify-between text-brand-600">
                    <span>Taxes:</span>
                    <span>₹{selectedOrder.tax}</span>
                  </div>
                  <div className="flex justify-between text-brand-950 font-bold border-t border-brand-200 pt-1 text-sm">
                    <span>Total:</span>
                    <span>₹{selectedOrder.total}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Update Form */}
            <form onSubmit={handleUpdateOrder} className="border-t border-brand-200 pt-3 space-y-3">
              <h4 className="text-xs font-bold text-brand-900">Fulfillment & Status Update</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Select
                    label="Order Status"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as OrderStatus)}
                    options={[
                      { label: 'Pending Payment / Confirmation', value: 'PENDING' },
                      { label: 'Confirmed (Payment Verified)', value: 'CONFIRMED' },
                      { label: 'Processing (Warehouse Preparing)', value: 'PROCESSING' },
                      { label: 'Packed & Weave Verified', value: 'PACKED' },
                      { label: 'Shipped (Handed to Carrier)', value: 'SHIPPED' },
                      { label: 'Out For Delivery (Local Courier)', value: 'OUT_FOR_DELIVERY' },
                      { label: 'Delivered (Received by Customer)', value: 'DELIVERED' },
                      { label: 'Cancelled', value: 'CANCELLED' },
                    ]}
                  />
                </div>

                <div>
                  <Select
                    label="Payment Status"
                    value={editPaymentStatus}
                    onChange={(e) => setEditPaymentStatus(e.target.value as PaymentStatus)}
                    options={[
                      { label: 'Pending Payment', value: 'PENDING' },
                      { label: 'Paid & Settled', value: 'PAID' },
                      { label: 'Failed', value: 'FAILED' },
                      { label: 'Refunded', value: 'REFUNDED' },
                    ]}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Input
                    label="Courier / Carrier"
                    value={editCarrier}
                    onChange={(e) => setEditCarrier(e.target.value)}
                    placeholder="Blue Dart, DTDC, Delhivery"
                  />
                </div>

                <div>
                  <Input
                    label="Tracking AWB / Number"
                    value={editTrackingNumber}
                    onChange={(e) => setEditTrackingNumber(e.target.value)}
                    placeholder="e.g. BD-89218932"
                  />
                </div>
              </div>

              <div>
                <Input
                  label="Internal Dispatch Notes"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="e.g. Silk mark certificate attached in package"
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <a
                  href={getWhatsAppUpdateLink(selectedOrder)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-800 font-medium"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Send Customer WhatsApp Update</span>
                </a>

                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsDetailModalOpen(false)}>
                    Close
                  </Button>
                  <Button type="submit" size="sm" isLoading={updating} leftIcon={<Save className="w-3.5 h-3.5" />}>
                    Save Order Status
                  </Button>
                </div>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
}
