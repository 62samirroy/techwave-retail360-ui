'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  ExternalLink,
  MessageCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/ui/StatusBadge';
import { api } from '@/lib/api';
import { OrderData } from '@/types';
import { formatPrice, formatDate, buildWhatsAppLink } from '@/lib/utils';
import { ORDER_STATUS_LABELS } from '@/lib/constants';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get('orderId') || '';

  const [orderNumber, setOrderNumber] = useState(initialOrderId);
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<OrderData | null>(null);
  const [error, setError] = useState('');

  const handleTrack = async (searchNum?: string) => {
    const numToSearch = (searchNum || orderNumber).trim();
    if (!numToSearch) {
      setError('Please enter your 5-digit Order ID (e.g., TW-ORD-10021)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.trackOrder(numToSearch, identifier.trim() || undefined);
      if (res.success && res.data) {
        setOrder(res.data);
      } else {
        setOrder(null);
        setError(res.message || 'No matching order found for this ID and contact.');
      }
    } catch (err: any) {
      setError('Failed to fetch tracking details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderId) {
      setOrderNumber(initialOrderId);
      handleTrack(initialOrderId);
    }
  }, [initialOrderId]);

  // Order lifecycle steps
  const orderSteps = [
    { key: 'CONFIRMED', label: 'Order Confirmed', desc: 'Payment verified & weaving cluster notified' },
    { key: 'PROCESSING', label: 'Quality Check & Ironing', desc: 'Inspecting zari borders and fold purity' },
    { key: 'PACKED', label: 'Artisan Packaging', desc: 'Packed in tamper-proof festive saree box' },
    { key: 'SHIPPED', label: 'Dispatched in Transit', desc: 'Handed over to courier express hub' },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', desc: 'Delivery partner arriving at your doorstep' },
    { key: 'DELIVERED', label: 'Delivered Safely', desc: 'Package received by customer' },
  ];

  const getStepIndex = (status: string) => {
    const map: Record<string, number> = {
      PENDING: 0,
      CONFIRMED: 0,
      PROCESSING: 1,
      PACKED: 2,
      SHIPPED: 3,
      OUT_FOR_DELIVERY: 4,
      DELIVERED: 5,
    };
    return map[status] ?? 0;
  };

  const currentStepIdx = order ? getStepIndex(order.status) : 0;

  const waTrackUrl = order
    ? buildWhatsAppLink(
        `Hello Royal Saree Support, I am tracking Order #${order.orderNumber} for ${order.customerName}. Could you share an update on expected arrival?`
      )
    : '';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-[11px] font-semibold text-primary-700 border border-primary-200">
          <Truck className="w-3.5 h-3.5" />
          <span>Real-Time Express Tracking</span>
        </div>
        <h1 className="text-xl sm:text-3xl font-serif font-bold text-brand-950">
          Track Your Saree Order
        </h1>
        <p className="text-xs text-brand-500">
          Enter your Order Number (e.g. <strong>TW-ORD-10021</strong>) to check live packaging, transit, and delivery progress.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="rounded-lg border border-brand-200 bg-white p-4 sm:p-6 shadow-subtle max-w-2xl mx-auto space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleTrack();
          }}
          className="space-y-3"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Order ID"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="e.g. TW-ORD-10021"
              required
            />
            <Input
              label="Email or Phone (Optional)"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. priya.sharma@example.com"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full gap-2"
            isLoading={loading}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Track Order Status</span>
          </Button>
        </form>

        {/* Quick Demo Pre-fill Links */}
        <div className="pt-2 border-t border-brand-100 flex items-center justify-between text-[11px] text-brand-500">
          <span>Try demo order IDs:</span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setOrderNumber('TW-ORD-10021');
                handleTrack('TW-ORD-10021');
              }}
              className="text-primary-600 font-mono hover:underline"
            >
              TW-ORD-10021 (Delivered)
            </button>
            <span>•</span>
            <button
              onClick={() => {
                setOrderNumber('TW-ORD-10022');
                handleTrack('TW-ORD-10022');
              }}
              className="text-primary-600 font-mono hover:underline"
            >
              TW-ORD-10022 (Shipped)
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 p-3 max-w-2xl mx-auto flex items-center gap-2 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tracking Results Card */}
      {order && (
        <div className="rounded-lg border border-brand-200 bg-white p-6 shadow-subtle space-y-6">
          {/* Order Header Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-brand-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-brand-950">
                  Order #{order.orderNumber}
                </h2>
                <OrderStatusBadge status={order.status} />
              </div>
              <p className="text-xs text-brand-500 mt-0.5">
                Ordered by <strong>{order.customerName}</strong> on {formatDate(order.createdAt)} • Total: {formatPrice(order.total)}
              </p>
            </div>

            {order.carrier && (
              <div className="text-right text-xs">
                <span className="text-brand-500">Courier Partner:</span>
                <p className="font-semibold text-brand-900">{order.carrier}</p>
                {order.trackingNumber && (
                  <p className="font-mono text-[11px] text-primary-700">
                    AWB: {order.trackingNumber}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Interactive Status Timeline */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-900">
              Shipment Status Timeline
            </h3>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-brand-200">
              {orderSteps.map((step, idx) => {
                const isCompleted = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;

                return (
                  <div key={step.key} className="relative flex items-start gap-3 text-xs">
                    <div
                      className={`absolute -left-6 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 text-[10px] ${
                        isCompleted
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-brand-300 bg-white text-brand-400'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                    </div>

                    <div className="flex-1">
                      <p className={`font-semibold ${isCurrent ? 'text-emerald-700 text-sm' : isCompleted ? 'text-brand-900' : 'text-brand-400'}`}>
                        {step.label}
                      </p>
                      <p className="text-[11px] text-brand-500 mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Shipping Destination */}
          <div className="rounded-md bg-brand-50 p-3.5 border border-brand-200 text-xs flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-brand-900">Destination Address:</p>
              <p className="text-brand-600 mt-0.5">
                {order.shippingAddress}, {order.city}, {order.state} - {order.pinCode}
              </p>
            </div>
          </div>

          {/* Inquire on WhatsApp */}
          <div className="pt-2 flex justify-end">
            <a href={waTrackUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="gap-1.5 text-emerald-700 border-emerald-300 hover:bg-emerald-50">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Contact Dispatch Team on WhatsApp</span>
              </Button>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-xs text-brand-500">Loading tracking portal...</div>}>
      <TrackOrderContent />
    </React.Suspense>
  );
}

