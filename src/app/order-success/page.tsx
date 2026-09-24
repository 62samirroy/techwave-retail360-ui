'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  CheckCircle2,
  Package,
  Printer,
  MessageCircle,
  Truck,
  ArrowRight,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/ui/StatusBadge';
import { api } from '@/lib/api';
import { OrderData } from '@/types';
import { formatPrice, formatDate, buildWhatsAppLink } from '@/lib/utils';
import { APP_CONFIG } from '@/lib/constants';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.getOrderById(orderId);
        if (res.success && res.data) {
          setOrder(res.data);
        } else {
          // fallback track lookup
          const trackRes = await api.trackOrder(orderId);
          if (trackRes.success && trackRes.data) {
            setOrder(trackRes.data);
          }
        }
      } catch (err) {
        console.error('Error fetching order receipt:', err);
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  const whatsappShareUrl = order
    ? buildWhatsAppLink(
        `Namaste! My Order #${order.orderNumber} for ₹${order.total.toLocaleString(
          'en-IN'
        )} is confirmed at Royal Saree & Fashion. Please keep me updated on dispatch!`
      )
    : '';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Success Hero Card */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-6 sm:p-8 text-center space-y-3 shadow-xs">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white mx-auto shadow-md">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <h1 className="text-xl sm:text-2xl font-serif font-bold text-emerald-950">
          Order Confirmed & Payment Verified!
        </h1>

        <p className="text-xs text-emerald-800 max-w-md mx-auto leading-relaxed">
          Thank you for choosing <strong>{APP_CONFIG.demoStore}</strong>. Your payment via Razorpay has been securely verified and our master packaging team is preparing your sarees.
        </p>

        {order && (
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-white px-3 py-1 text-xs font-mono font-bold text-emerald-900 mt-2">
            Order ID: {order.orderNumber}
          </div>
        )}
      </div>

      {order ? (
        <div className="space-y-6">
          {/* Order Status & Timeline */}
          <div className="rounded-lg border border-brand-200 bg-white p-5 shadow-subtle space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-100 pb-3">
              <div>
                <p className="text-[11px] text-brand-400">Order Placed on</p>
                <p className="text-xs font-semibold text-brand-900">{formatDate(order.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2">
                <OrderStatusBadge status={order.status} />
                <PaymentStatusBadge status={order.paymentStatus} />
              </div>
            </div>

            {/* Visual Step Progress Tracker */}
            <div className="py-2">
              <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                <div className="space-y-1">
                  <div className="h-1.5 w-full bg-emerald-600 rounded-full" />
                  <p className="font-bold text-emerald-900">Order Placed</p>
                </div>
                <div className="space-y-1">
                  <div className="h-1.5 w-full bg-emerald-600 rounded-full" />
                  <p className="font-bold text-emerald-900">Payment Verified</p>
                </div>
                <div className="space-y-1">
                  <div className="h-1.5 w-full bg-brand-200 rounded-full" />
                  <p className="font-medium text-brand-400">Packaging</p>
                </div>
                <div className="space-y-1">
                  <div className="h-1.5 w-full bg-brand-200 rounded-full" />
                  <p className="font-medium text-brand-400">Out for Delivery</p>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery & Payment Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-lg border border-brand-200 bg-white p-4 shadow-subtle text-xs space-y-1.5">
              <h3 className="font-bold uppercase tracking-wider text-brand-900 mb-2 border-b border-brand-100 pb-1.5">
                Delivery Details
              </h3>
              <p className="font-semibold text-brand-950">{order.customerName}</p>
              <p className="text-brand-600">{order.shippingAddress}</p>
              <p className="text-brand-600">
                {order.city}, {order.state} - {order.pinCode}
              </p>
              <p className="text-brand-600 font-mono mt-1">Phone: {order.customerPhone}</p>
              <p className="text-brand-600">Email: {order.customerEmail}</p>
            </div>

            <div className="rounded-lg border border-brand-200 bg-white p-4 shadow-subtle text-xs space-y-1.5">
              <h3 className="font-bold uppercase tracking-wider text-brand-900 mb-2 border-b border-brand-100 pb-1.5">
                Payment Verification
              </h3>
              <p className="text-brand-600">Payment Method: <strong className="text-brand-900">{order.paymentMethod}</strong></p>
              {order.razorpayPaymentId && (
                <p className="text-brand-600 font-mono text-[11px]">
                  Payment ID: {order.razorpayPaymentId}
                </p>
              )}
              {order.carrier && (
                <p className="text-brand-600">
                  Assigned Courier: <strong>{order.carrier}</strong>
                </p>
              )}
              <div className="pt-2">
                <span className="inline-flex items-center gap-1 rounded bg-emerald-50 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Razorpay Verified Transaction
                </span>
              </div>
            </div>
          </div>

          {/* Items Receipt Table */}
          <div className="rounded-lg border border-brand-200 bg-white p-4 shadow-subtle space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-900 border-b border-brand-100 pb-2">
              Itemized Invoice Summary
            </h3>
            <div className="divide-y divide-brand-100 text-xs">
              {order.items.map((it) => (
                <div key={it.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-brand-900 truncate">{it.productName}</p>
                    <p className="text-[10px] text-brand-400 font-mono">
                      SKU: {it.productSku} • Qty: {it.quantity} × {formatPrice(it.unitPrice)}
                    </p>
                  </div>
                  <span className="font-semibold text-brand-950 shrink-0">
                    {formatPrice(it.total)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-brand-200 pt-3 space-y-1.5 text-xs text-brand-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-brand-900">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span>{order.shippingFee === 0 ? <strong className="text-emerald-700">FREE</strong> : formatPrice(order.shippingFee)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (5%)</span>
                <span>{formatPrice(order.tax)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-brand-950 border-t border-brand-200 pt-2">
                <span>Total Paid</span>
                <span className="text-primary-700">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                icon={<Printer className="w-3.5 h-3.5" />}
              >
                Print Receipt
              </Button>
              <a href={whatsappShareUrl} target="_blank" rel="noopener noreferrer">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                  icon={<MessageCircle className="w-3.5 h-3.5 text-emerald-600" />}
                >
                  WhatsApp Update
                </Button>
              </a>
            </div>

            <Link href={`/track-order?orderId=${order.orderNumber}`}>
              <Button variant="primary" size="sm" className="gap-1.5">
                <span>Track Order Live</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="text-center py-6">
          <Link href="/">
            <Button variant="primary" size="sm">
              Return to Store
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-xs text-brand-500">Loading order receipt...</div>}>
      <OrderSuccessContent />
    </React.Suspense>
  );
}

