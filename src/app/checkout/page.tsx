'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShieldCheck,
  CreditCard,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api } from '@/lib/api';
import { CartData } from '@/types';
import { formatPrice } from '@/lib/utils';
import { APP_CONFIG } from '@/lib/constants';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();

  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingAddress: '',
    city: '',
    state: '',
    pinCode: '',
    country: 'India',
  });

  // Pre-fill user details if logged in
  useEffect(() => {
    async function initCheckout() {
      try {
        const [cartRes, meRes] = await Promise.all([
          api.getCart(),
          api.getMe(),
        ]);

        if (cartRes.success && cartRes.data) {
          setCart(cartRes.data);
          if (cartRes.data.items.length === 0) {
            router.push('/cart');
            return;
          }
        }

        if (meRes.success && meRes.data?.user) {
          const u = meRes.data.user;
          setFormData((prev) => ({
            ...prev,
            customerName: u.name || '',
            customerEmail: u.email || '',
            customerPhone: u.phone || '',
          }));
        }
      } catch (err) {
        console.error('Checkout init error:', err);
      } finally {
        setLoading(false);
      }
    }

    initCheckout();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTestAutofill = () => {
    setFormData({
      customerName: 'Priya Sharma',
      customerEmail: 'priya.sharma@example.com',
      customerPhone: '+91 9830123456',
      shippingAddress: 'Flat 4B, Silver Oak Residency, Southern Avenue',
      city: 'Kolkata',
      state: 'West Bengal',
      pinCode: '700029',
      country: 'India',
    });
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (
      !formData.customerName ||
      !formData.customerEmail ||
      !formData.customerPhone ||
      !formData.shippingAddress ||
      !formData.city ||
      !formData.state ||
      !formData.pinCode
    ) {
      setErrorMessage('Please fill in all customer and shipping address fields.');
      return;
    }

    if (!cart || cart.items.length === 0) {
      setErrorMessage('Your cart is empty.');
      return;
    }

    setProcessing(true);

    try {
      // 1. Create Razorpay order on backend
      const orderPayload = {
        ...formData,
        items: cart.items.map((it) => ({
          productId: it.productId,
          productName: it.product.name,
          quantity: it.quantity,
        })),
      };

      const orderRes = await api.createRazorpayOrder(orderPayload);

      if (!orderRes.success || !orderRes.data) {
        throw new Error(orderRes.message || 'Failed to initiate order.');
      }

      const { orderId, orderNumber, razorpayOrderId, amount, currency, keyId } = orderRes.data;

      // 2. Open Razorpay Checkout or Seamless Test Simulation
      const openRazorpayCheckout = () => {
        return new Promise<{ razorpay_payment_id: string; razorpay_signature: string }>((resolve, reject) => {
          if (typeof window !== 'undefined' && window.Razorpay && keyId && !keyId.includes('placeholder')) {
            const options = {
              key: keyId,
              amount: amount,
              currency: currency || 'INR',
              name: APP_CONFIG.demoStore,
              description: `Order #${orderNumber}`,
              order_id: razorpayOrderId,
              prefill: {
                name: formData.customerName,
                email: formData.customerEmail,
                contact: formData.customerPhone,
              },
              theme: { color: '#4f46e5' },
              handler: function (response: any) {
                resolve({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                });
              },
              modal: {
                ondismiss: function () {
                  reject(new Error('Payment window was closed by the user.'));
                },
              },
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response: any) {
              reject(new Error(response.error?.description || 'Payment failed'));
            });
            rzp.open();
          } else {
            // Test Mode Simulator fallback for instant demo testing
            setTimeout(() => {
              const mockPaymentId = `pay_test_${Date.now()}`;
              const mockSignature = `sim_test_sig_${Date.now()}`;
              resolve({
                razorpay_payment_id: mockPaymentId,
                razorpay_signature: mockSignature,
              });
            }, 800);
          }
        });
      };

      const paymentResult = await openRazorpayCheckout();

      // 3. Verify Payment Signature on Backend Server
      const verifyRes = await api.verifyPayment({
        orderId,
        orderNumber,
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: paymentResult.razorpay_payment_id,
        razorpay_signature: paymentResult.razorpay_signature,
      });

      if (!verifyRes.success) {
        throw new Error(verifyRes.message || 'Payment signature verification failed.');
      }

      // 4. Clear cart & redirect to Order Success page
      await api.clearCart();
      window.dispatchEvent(new Event('cart-updated'));

      router.push(`/order-success?orderId=${orderNumber}`);
    } catch (err: any) {
      console.error('Checkout error:', err);
      setErrorMessage(err.message || 'An unexpected error occurred during payment processing.');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="border-b border-brand-200 pb-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-brand-950">
            Secure Checkout
          </h1>
          <p className="text-xs text-brand-500">
            Fast, encrypted checkout powered by Razorpay Test Gateway
          </p>
        </div>
        <button
          type="button"
          onClick={handleTestAutofill}
          className="text-xs bg-brand-100 hover:bg-brand-200 text-brand-800 px-2.5 py-1 rounded font-medium border border-brand-300"
        >
          ⚡ Autofill Demo Details
        </button>
      </div>

      {errorMessage && (
        <div className="rounded-md border border-rose-200 bg-rose-50 p-3 flex items-center gap-2 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handlePayment} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Customer & Delivery Address Form */}
        <div className="lg:col-span-7 space-y-5">
          {/* Customer Contact */}
          <div className="rounded-lg border border-brand-200 bg-white p-4 shadow-subtle space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-900 border-b border-brand-100 pb-2">
              1. Customer Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Full Name"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                required
                placeholder="Priya Sharma"
              />
              <Input
                label="Phone Number"
                name="customerPhone"
                type="tel"
                value={formData.customerPhone}
                onChange={handleChange}
                required
                placeholder="+91 9830123456"
              />
            </div>
            <Input
              label="Email Address"
              name="customerEmail"
              type="email"
              value={formData.customerEmail}
              onChange={handleChange}
              required
              placeholder="priya.sharma@example.com"
              helperText="Order confirmation & tracking receipts will be sent to this email."
            />
          </div>

          {/* Delivery Address */}
          <div className="rounded-lg border border-brand-200 bg-white p-4 shadow-subtle space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-900 border-b border-brand-100 pb-2">
              2. Delivery Address
            </h2>
            <Input
              label="Street Address / Flat No."
              name="shippingAddress"
              value={formData.shippingAddress}
              onChange={handleChange}
              required
              placeholder="Flat 4B, Silver Oak Residency, Southern Avenue"
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                placeholder="Kolkata"
              />
              <Input
                label="State"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                placeholder="West Bengal"
              />
              <Input
                label="PIN Code"
                name="pinCode"
                value={formData.pinCode}
                onChange={handleChange}
                required
                placeholder="700029"
              />
            </div>
            <Input
              label="Country"
              name="country"
              value={formData.country}
              disabled
              className="bg-brand-50"
            />
          </div>

          {/* Payment Method Notice */}
          <div className="rounded-lg border border-brand-200 bg-white p-4 shadow-subtle space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-900 border-b border-brand-100 pb-2">
              3. Payment Method
            </h2>
            <div className="flex items-center gap-3 p-3 rounded-md border border-primary-200 bg-primary-50/50 text-xs">
              <div className="h-4 w-4 rounded-full border-4 border-primary-600 bg-white shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-brand-900 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-primary-600" />
                  <span>Razorpay Payment Gateway (Test Mode)</span>
                </p>
                <p className="text-[11px] text-brand-500 mt-0.5">
                  Supports UPI, Google Pay, PhonePe, NetBanking, Credit and Debit Cards.
                </p>
              </div>
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Pay CTA */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-lg border border-brand-200 bg-white p-4 shadow-subtle space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-900 border-b border-brand-100 pb-2">
              Order Items ({cart?.items.length || 0})
            </h2>

            {/* Micro items list */}
            <div className="space-y-2 max-h-56 overflow-y-auto divide-y divide-brand-100 pr-1">
              {cart?.items.map((it) => (
                <div key={it.id} className="pt-2 flex items-center gap-2.5 text-xs">
                  <div className="relative h-12 w-10 shrink-0 rounded overflow-hidden border border-brand-200 bg-brand-100">
                    <Image
                      src={it.product.images?.[0]?.url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'}
                      alt={it.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-brand-900 truncate">{it.product.name}</p>
                    <p className="text-[10px] text-brand-400">
                      Qty: {it.quantity} × {formatPrice(it.price)}
                    </p>
                  </div>
                  <span className="font-semibold text-brand-900 shrink-0">
                    {formatPrice(it.itemTotal)}
                  </span>
                </div>
              ))}
            </div>

            {/* Pricing breakdown */}
            <div className="space-y-1.5 border-t border-brand-200 pt-3 text-xs text-brand-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-brand-900">{formatPrice(cart?.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{cart?.shippingFee === 0 ? <strong className="text-emerald-700">FREE</strong> : formatPrice(cart?.shippingFee)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (5%)</span>
                <span>{formatPrice(cart?.tax)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-brand-950 border-t border-brand-200 pt-2">
                <span>Total Due</span>
                <span className="text-primary-700">{formatPrice(cart?.grandTotal)}</span>
              </div>
            </div>

            {/* Pay Button */}
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={processing}
              isLoading={processing}
              className="w-full gap-2 mt-2"
            >
              {processing ? (
                'Verifying Payment Signature...'
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Pay {formatPrice(cart?.grandTotal)} via Razorpay</span>
                </>
              )}
            </Button>

            <p className="text-[10px] text-center text-brand-400 pt-1">
              Clicking pay triggers Razorpay Test Mode checkout with automatic signature verification.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
