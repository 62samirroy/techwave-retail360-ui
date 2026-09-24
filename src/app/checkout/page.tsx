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
  Truck,
  Sparkles,
  Smartphone,
  Building,
  Key,
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

  // Payment Method Selection
  const [paymentMethod, setPaymentMethod] = useState<'RAZORPAY' | 'RAZORPAY_SIMULATION' | 'COD'>('RAZORPAY');
  const [customKeyId, setCustomKeyId] = useState('');
  const [showKeyConfig, setShowKeyConfig] = useState(false);

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

  // Ensure Razorpay SDK script is loaded
  const loadRazorpaySDK = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') return resolve(false);
      if (window.Razorpay) return resolve(true);

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

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
      // 1. Create Razorpay Order on Backend
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
        throw new Error(orderRes.message || 'Failed to initiate Razorpay order.');
      }

      const { orderId, orderNumber, razorpayOrderId, amount, currency, keyId } = orderRes.data;
      const effectiveKeyId = customKeyId.trim() || keyId;

      // 2. Process Chosen Payment Flow
      if (paymentMethod === 'RAZORPAY') {
        const isLoaded = await loadRazorpaySDK();

        if (!isLoaded || typeof window.Razorpay === 'undefined') {
          throw new Error('Unable to connect to Razorpay gateway. Please check your internet connection or try Demo Simulation mode.');
        }

        const paymentResult = await new Promise<{ razorpay_payment_id: string; razorpay_signature: string }>((resolve, reject) => {
          const options = {
            key: effectiveKeyId,
            amount: amount,
            currency: currency || 'INR',
            name: 'Royal Saree & Fashion',
            description: `Atelier Order #${orderNumber}`,
            image: 'https://images.pexels.com/photos/1488312/pexels-photo-1488312.jpeg?auto=compress&cs=tinysrgb&w=120',
            order_id: razorpayOrderId.startsWith('order_test_') ? undefined : razorpayOrderId,
            prefill: {
              name: formData.customerName,
              email: formData.customerEmail,
              contact: formData.customerPhone,
            },
            notes: {
              orderNumber,
              customerEmail: formData.customerEmail,
            },
            theme: {
              color: '#9333EA', // Luxury royal purple
            },
            handler: function (response: any) {
              resolve({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature || 'sig_verified_mock_checksum',
              });
            },
            modal: {
              ondismiss: function () {
                reject(new Error('Razorpay payment modal closed by customer.'));
              },
            },
          };

          try {
            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response: any) {
              reject(new Error(response.error?.description || 'Razorpay payment was declined.'));
            });
            rzp.open();
          } catch (initErr: any) {
            reject(new Error(initErr.message || 'Failed to open Razorpay modal with provided key.'));
          }
        });

        // 3. Verify Payment Signature with backend API
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
      } else if (paymentMethod === 'RAZORPAY_SIMULATION') {
        // Fast Test Simulation Mode (bypasses popups for automated/demo test runs)
        await new Promise((r) => setTimeout(r, 600));

        const mockPaymentId = `pay_sim_${Date.now()}`;
        const mockSignature = `sim_test_sig_${Date.now()}`;

        const verifyRes = await api.verifyPayment({
          orderId,
          orderNumber,
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: mockPaymentId,
          razorpay_signature: mockSignature,
        });

        if (!verifyRes.success) {
          throw new Error(verifyRes.message || 'Signature verification failed.');
        }
      } else {
        // Cash on Delivery Mode
        const verifyRes = await api.verifyPayment({
          orderId,
          orderNumber,
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: `pay_cod_${Date.now()}`,
          razorpay_signature: `sim_test_sig_cod_${Date.now()}`,
        });

        if (!verifyRes.success) {
          throw new Error(verifyRes.message || 'Failed to confirm COD order.');
        }
      }

      // 4. Clear Cart & Redirect to Order Confirmation
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
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="border-b border-stone-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-purple-700 block mb-1">
            Atelier Checkout
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
            Review &amp; Place Your Order
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Encrypted transactions powered by Razorpay 256-bit SSL gateway.
          </p>
        </div>
        <button
          type="button"
          onClick={handleTestAutofill}
          className="self-start sm:self-auto text-xs bg-stone-100 hover:bg-stone-200 text-stone-800 px-3.5 py-1.5 rounded-full font-semibold border border-stone-200 shadow-xs transition-all"
        >
          ⚡ Autofill Sample Details
        </button>
      </div>

      {errorMessage && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-4 flex items-center gap-3 text-xs text-rose-800 shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <div className="flex-1">
            <span className="font-semibold block">Payment Notice:</span>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      <form onSubmit={handlePayment} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Customer & Delivery Address Form */}
        <div className="lg:col-span-7 space-y-6">
          {/* Customer Contact */}
          <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-100 text-purple-700 text-[10px]">
                1
              </span>
              <span>Customer Information</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-100 text-purple-700 text-[10px]">
                2
              </span>
              <span>Delivery Address</span>
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
              className="bg-stone-50"
            />
          </div>

          {/* Payment Method Selector */}
          <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-100 text-purple-700 text-[10px]">
                  3
                </span>
                <span>Select Payment Gateway</span>
              </h2>
              <button
                type="button"
                onClick={() => setShowKeyConfig(!showKeyConfig)}
                className="text-[11px] text-purple-700 hover:text-purple-900 font-medium flex items-center gap-1"
              >
                <Key className="w-3 h-3" />
                <span>{showKeyConfig ? 'Hide Gateway Key' : 'Custom Razorpay Key'}</span>
              </button>
            </div>

            {showKeyConfig && (
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1.5">
                <label className="font-semibold text-stone-700 block">
                  Custom Razorpay Key ID (Optional Test/Live Key)
                </label>
                <input
                  type="text"
                  placeholder="e.g. rzp_test_..."
                  value={customKeyId}
                  onChange={(e) => setCustomKeyId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-mono text-stone-900 focus:outline-none focus:ring-1 focus:ring-purple-600"
                />
                <p className="text-[10px] text-stone-400">
                  Leave empty to use the system default configured in .env.
                </p>
              </div>
            )}

            <div className="space-y-3">
              {/* Option 1: Official Razorpay Gateway Modal */}
              <label
                onClick={() => setPaymentMethod('RAZORPAY')}
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'RAZORPAY'
                    ? 'border-purple-600 bg-purple-50/30 ring-1 ring-purple-600/30'
                    : 'border-stone-200 bg-white hover:bg-stone-50'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'RAZORPAY'}
                  onChange={() => setPaymentMethod('RAZORPAY')}
                  className="mt-0.5 text-purple-600 focus:ring-purple-500"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-stone-900 text-xs flex items-center gap-2">
                      <span>Razorpay Online Payment</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-700">
                        RECOMMENDED
                      </span>
                    </p>
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">
                    UPI (Google Pay, PhonePe, Paytm, BHIM), Credit &amp; Debit Cards, NetBanking, and Wallets.
                  </p>
                </div>
              </label>

              {/* Option 2: Razorpay Express Demo Simulator */}
              <label
                onClick={() => setPaymentMethod('RAZORPAY_SIMULATION')}
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'RAZORPAY_SIMULATION'
                    ? 'border-purple-600 bg-purple-50/30 ring-1 ring-purple-600/30'
                    : 'border-stone-200 bg-white hover:bg-stone-50'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'RAZORPAY_SIMULATION'}
                  onChange={() => setPaymentMethod('RAZORPAY_SIMULATION')}
                  className="mt-0.5 text-purple-600 focus:ring-purple-500"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-stone-900 text-xs flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Instant Test Simulator (No Popup Needed)</span>
                    </p>
                    <span className="text-[10px] font-mono text-stone-400">Sandbox</span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Simulates a verified 200 OK payment with signature hashing immediately for lightning-fast testing.
                  </p>
                </div>
              </label>

              {/* Option 3: Cash on Delivery */}
              <label
                onClick={() => setPaymentMethod('COD')}
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-purple-600 bg-purple-50/30 ring-1 ring-purple-600/30'
                    : 'border-stone-200 bg-white hover:bg-stone-50'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="mt-0.5 text-purple-600 focus:ring-purple-500"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-stone-900 text-xs flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-stone-600" />
                      <span>Cash on Delivery (COD)</span>
                    </p>
                    <span className="text-[10px] font-mono text-stone-500">Pay at Doorstep</span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Inspect your handloom saree upon delivery and pay via cash or UPI to the courier agent.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Pay CTA */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-xs space-y-4 sticky top-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900 border-b border-stone-100 pb-3 flex items-center justify-between">
              <span>Order Summary</span>
              <span className="font-mono text-purple-700">
                {cart?.items.length || 0} {cart?.items.length === 1 ? 'saree' : 'sarees'}
              </span>
            </h2>

            {/* Cart Items List */}
            <div className="divide-y divide-stone-100 max-h-72 overflow-y-auto pr-1 space-y-2">
              {cart?.items.map((it) => (
                <div key={it.id} className="pt-2 first:pt-0 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {it.product.images?.[0]?.url && (
                      <div className="relative h-12 w-9 rounded-lg overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                        <Image
                          src={it.product.images[0].url}
                          alt={it.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-stone-900 truncate max-w-[180px]">
                        {it.product.name}
                      </p>
                      <p className="text-[10px] text-stone-500">Qty: {it.quantity}</p>
                    </div>
                  </div>
                  <span className="font-semibold font-mono text-stone-900 shrink-0">
                    {formatPrice(it.itemTotal)}
                  </span>
                </div>
              ))}
            </div>

            {/* Pricing breakdown */}
            <div className="space-y-2 border-t border-stone-200 pt-3 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-stone-900 font-mono">
                  {formatPrice(cart?.subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Shipping &amp; Handling</span>
                <span>
                  {cart?.shippingFee === 0 ? (
                    <strong className="text-emerald-700 font-bold">FREE</strong>
                  ) : (
                    <span className="font-mono">{formatPrice(cart?.shippingFee)}</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span>GST (5% Handloom)</span>
                <span className="font-mono">{formatPrice(cart?.tax)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-stone-950 border-t border-stone-200 pt-3">
                <span className="font-serif">Total Due</span>
                <span className="text-purple-700 font-mono">
                  {formatPrice(cart?.grandTotal)}
                </span>
              </div>
            </div>

            {/* Pay Button */}
            <Button
              type="submit"
              size="lg"
              disabled={processing}
              isLoading={processing}
              className="w-full gap-2 mt-3 bg-[#18181B] hover:bg-black text-white rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              {processing ? (
                'Processing Order with Razorpay...'
              ) : (
                <>
                  <Lock className="w-4 h-4 text-purple-300" />
                  <span>
                    Pay {formatPrice(cart?.grandTotal)}{' '}
                    {paymentMethod === 'COD' ? '(Confirm COD)' : 'via Razorpay'}
                  </span>
                </>
              )}
            </Button>

            <div className="pt-2 flex items-center justify-center gap-2 text-[10px] text-stone-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Razorpay Verified • Instant SMS &amp; WhatsApp Receipt</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
