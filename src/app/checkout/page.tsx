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
  AlertCircle,
  Loader2,
  Truck,
  Key,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api } from '@/lib/api';
import { CartData } from '@/types';
import { formatPrice } from '@/lib/utils';

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
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('custom');

  // Payment Method Selection
  const [paymentMethod, setPaymentMethod] = useState<'RAZORPAY' | 'COD'>('RAZORPAY');

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

  // Pre-fill user details and saved addresses if logged in
  useEffect(() => {
    async function initCheckout() {
      try {
        const [cartRes, meRes, addrRes] = await Promise.all([
          api.getCart(),
          api.getMe(),
          api.getAddresses(),
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

        if (addrRes.success && addrRes.data && addrRes.data.length > 0) {
          setSavedAddresses(addrRes.data);
          const defaultAddr = addrRes.data.find((a: any) => a.isDefault) || addrRes.data[0];
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr.id);
            setFormData((prev) => ({
              ...prev,
              customerName: defaultAddr.name || prev.customerName,
              customerPhone: defaultAddr.phone || prev.customerPhone,
              shippingAddress: defaultAddr.streetAddress,
              city: defaultAddr.city,
              state: defaultAddr.state,
              pinCode: defaultAddr.pinCode,
              country: defaultAddr.country || 'India',
            }));
          }
        }
      } catch (err) {
        console.error('Checkout init error:', err);
      } finally {
        setLoading(false);
      }
    }

    initCheckout();
  }, [router]);

  // Dynamically load Razorpay standard checkout.js SDK
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
      // 1. Create Razorpay order on the backend
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

      if (paymentMethod === 'RAZORPAY') {
        const isLoaded = await loadRazorpaySDK();

        if (!isLoaded || typeof window.Razorpay === 'undefined') {
          throw new Error('Unable to load Razorpay SDK. Please check your internet connection.');
        }

        // 2. Launch Official Razorpay Modal
        const options = {
          key: keyId,
          amount: amount, // amount in paise
          currency: currency || 'INR',
          name: 'Royal Saree & Fashion',
          description: `Order #${orderNumber}`,
          image: 'https://images.pexels.com/photos/1488312/pexels-photo-1488312.jpeg?auto=compress&cs=tinysrgb&w=120',
          order_id: razorpayOrderId,
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
            color: '#9333EA',
          },
          handler: async function (response: any) {
            try {
              setProcessing(true);
              // 3. Verify Payment Signature with Backend
              const verifyRes = await api.verifyPayment({
                orderId,
                orderNumber,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              if (!verifyRes.success) {
                throw new Error(verifyRes.message || 'Payment signature verification failed.');
              }

              await api.clearCart();
              window.dispatchEvent(new Event('cart-updated'));
              router.push(`/order-success?orderId=${orderNumber}`);
            } catch (err: any) {
              console.error('Signature verification error:', err);
              setErrorMessage(err.message || 'Signature verification failed.');
              setProcessing(false);
            }
          },
          modal: {
            ondismiss: function () {
              setProcessing(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          setErrorMessage(response.error?.description || 'Razorpay payment was declined.');
          setProcessing(false);
        });
        rzp.open();
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

        await api.clearCart();
        window.dispatchEvent(new Event('cart-updated'));
        router.push(`/order-success?orderId=${orderNumber}`);
      }
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
            Real encrypted transactions powered by Razorpay 256-bit SSL gateway.
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
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900 border-b border-stone-100 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-100 text-purple-700 text-[10px]">
                  2
                </span>
                <span>Delivery Address</span>
              </div>
              {savedAddresses.length > 0 && (
                <span className="text-[11px] text-stone-500 font-normal">
                  {savedAddresses.length} Saved {savedAddresses.length === 1 ? 'Address' : 'Addresses'}
                </span>
              )}
            </h2>

            {/* Saved Addresses Selector Cards */}
            {savedAddresses.length > 0 && (
              <div className="space-y-2">
                <label className="block text-xs font-medium text-stone-700">
                  Select from your saved addresses:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {savedAddresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => {
                          setSelectedAddressId(addr.id);
                          setFormData((prev) => ({
                            ...prev,
                            customerName: addr.name || prev.customerName,
                            customerPhone: addr.phone || prev.customerPhone,
                            shippingAddress: addr.streetAddress,
                            city: addr.city,
                            state: addr.state,
                            pinCode: addr.pinCode,
                            country: addr.country || 'India',
                          }));
                        }}
                        className={`cursor-pointer rounded-xl border p-3 text-xs space-y-1 transition-all ${
                          isSelected
                            ? 'border-purple-600 bg-purple-50/40 ring-1 ring-purple-600/30'
                            : 'border-stone-200 bg-white hover:bg-stone-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-stone-900">{addr.name}</span>
                          {addr.isDefault && (
                            <span className="rounded bg-stone-100 text-stone-700 text-[9px] font-bold px-1.5 py-0.2">
                              DEFAULT
                            </span>
                          )}
                        </div>
                        <p className="text-stone-600 line-clamp-2">{addr.streetAddress}, {addr.city}</p>
                        <p className="text-stone-400 font-mono text-[10px]">{addr.pinCode} • {addr.phone}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

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
                <span>Payment Method</span>
              </h2>
            </div>

            <div className="space-y-3">
              {/* Option 1: Official Razorpay Payment */}
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
                      <CreditCard className="w-4 h-4 text-purple-600" />
                      <span>Razorpay Payment Gateway</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-700">
                        OFFICIAL
                      </span>
                    </p>
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Direct integration with Razorpay checkout: UPI (Google Pay, PhonePe, Paytm, BHIM), Credit/Debit Cards, NetBanking, and Wallets.
                  </p>
                </div>
              </label>

              {/* Option 2: Cash on Delivery */}
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
                'Opening Razorpay...'
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
              <span>Official Razorpay Payment Gateway • 256-Bit SSL</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
