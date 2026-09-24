'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  Smartphone,
  Building,
  QrCode,
  ShieldCheck,
  Check,
  Loader2,
  X,
  Lock,
  ArrowRight,
  Wallet,
} from 'lucide-react';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';

interface RazorpayModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  amount: number; // in rupees
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  onSuccess: (paymentDetails: {
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
}

export function RazorpayModal({
  isOpen,
  onClose,
  orderNumber,
  amount,
  customerName,
  customerEmail,
  customerPhone,
  onSuccess,
}: RazorpayModalProps) {
  const [activeTab, setActiveTab] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState(
    customerEmail ? `${customerEmail.split('@')[0]}@okaxis` : 'priya.sharma@okaxis'
  );
  const [cardNumber, setCardNumber] = useState('4111 •••• •••• 1111');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');
  const [selectedBank, setSelectedBank] = useState('HDFC');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStage, setProcessStage] = useState('');

  if (!isOpen) return null;

  const handlePay = async () => {
    setIsProcessing(true);
    setProcessStage('Connecting to Razorpay gateway...');

    await new Promise((r) => setTimeout(r, 600));
    setProcessStage('Authorizing with issuing bank...');

    await new Promise((r) => setTimeout(r, 700));
    setProcessStage('Verifying HMAC SHA256 signature...');

    await new Promise((r) => setTimeout(r, 500));

    const mockPaymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const mockSignature = `sim_test_sig_${Date.now()}`;

    setIsProcessing(false);
    onSuccess({
      razorpay_payment_id: mockPaymentId,
      razorpay_signature: mockSignature,
    });
  };

  const handleAutofillCard = () => {
    setCardNumber('4111 2222 3333 4444');
    setCardExpiry('08/29');
    setCardCvv('789');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-stone-200 animate-in zoom-in-95 duration-200">
        {/* Razorpay Brand Header */}
        <div className="bg-[#0C2340] text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 shadow-md">
              <span className="font-serif font-black text-xs text-[#0C2340] tracking-tighter">
                RSF
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm tracking-tight">Royal Saree &amp; Fashion</h3>
                <span className="bg-[#00BAF2] text-[#0C2340] font-black text-[9px] uppercase px-1.5 py-0.2 rounded font-sans">
                  Razorpay
                </span>
              </div>
              <p className="text-[11px] text-stone-300 font-mono">
                Order #{orderNumber} • {customerName || 'Customer'}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-stone-400 uppercase font-semibold tracking-wider block">
              Amount to Pay
            </span>
            <span className="text-lg font-bold font-mono text-emerald-400">
              {formatPrice(amount)}
            </span>
          </div>

          <button
            onClick={onClose}
            disabled={isProcessing}
            aria-label="Close payment modal"
            className="absolute top-3 right-3 text-stone-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-30"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Payment Tabs Navigation */}
        <div className="flex border-b border-stone-200 bg-stone-50 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('upi')}
            disabled={isProcessing}
            className={`flex-1 py-3 px-2 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'upi'
                ? 'border-purple-600 text-purple-700 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>UPI / QR</span>
          </button>
          <button
            onClick={() => setActiveTab('card')}
            disabled={isProcessing}
            className={`flex-1 py-3 px-2 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'card'
                ? 'border-purple-600 text-purple-700 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Cards</span>
          </button>
          <button
            onClick={() => setActiveTab('netbanking')}
            disabled={isProcessing}
            className={`flex-1 py-3 px-2 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'netbanking'
                ? 'border-purple-600 text-purple-700 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>NetBanking</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 space-y-4">
          {/* TAB 1: UPI / QR */}
          {activeTab === 'upi' && (
            <div className="space-y-4">
              {/* QR Code Block */}
              <div className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-purple-50/50 rounded-xl border border-purple-100">
                <div className="h-24 w-24 bg-white p-2 rounded-lg border border-purple-200 shadow-xs flex items-center justify-center shrink-0">
                  <div className="text-center">
                    <QrCode className="w-14 h-14 mx-auto text-purple-900" />
                    <span className="text-[8px] font-bold uppercase tracking-wider text-purple-700">
                      Scan &amp; Pay
                    </span>
                  </div>
                </div>
                <div className="text-center sm:text-left text-xs">
                  <p className="font-bold text-stone-900">Scan QR Code with any UPI App</p>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Google Pay, PhonePe, Paytm, CRED, or BHIM.
                  </p>
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 mt-2">
                    <span className="px-2 py-0.5 rounded bg-white border border-stone-200 text-[10px] font-bold text-stone-700">
                      GPay
                    </span>
                    <span className="px-2 py-0.5 rounded bg-white border border-stone-200 text-[10px] font-bold text-stone-700">
                      PhonePe
                    </span>
                    <span className="px-2 py-0.5 rounded bg-white border border-stone-200 text-[10px] font-bold text-stone-700">
                      Paytm
                    </span>
                  </div>
                </div>
              </div>

              {/* UPI ID Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-stone-700">
                  Or enter Virtual Payment Address (UPI ID)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="mobilenumber@upi"
                    className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
                  />
                  <button
                    type="button"
                    onClick={() => setUpiId(`${customerEmail ? customerEmail.split('@')[0] : 'customer'}@okaxis`)}
                    className="px-2.5 py-1 text-[11px] font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors shrink-0"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Card Payment */}
          {activeTab === 'card' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-stone-700">
                  Card Details (Razorpay Sandbox)
                </label>
                <button
                  type="button"
                  onClick={handleAutofillCard}
                  className="text-[11px] text-purple-700 hover:text-purple-900 font-semibold underline"
                >
                  ⚡ Use Test Card
                </button>
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="Card Number (4111 2222 3333 4444)"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
                />

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="MM/YY"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono text-stone-900 text-center focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
                  />
                  <input
                    type="password"
                    maxLength={4}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    placeholder="CVV"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono text-stone-900 text-center focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-stone-500 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Test sandbox card mode enabled. No real money will be charged.</span>
              </div>
            </div>
          )}

          {/* TAB 3: NetBanking */}
          {activeTab === 'netbanking' && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-stone-700">
                Choose Your Bank
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {['HDFC', 'SBI', 'ICICI', 'Axis', 'Kotak', 'PNB'].map((bank) => (
                  <button
                    key={bank}
                    type="button"
                    onClick={() => setSelectedBank(bank)}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                      selectedBank === bank
                        ? 'border-purple-600 bg-purple-50 text-purple-900 shadow-xs'
                        : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    {bank} Bank
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Processing Status Overlay */}
          {isProcessing && (
            <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 flex items-center gap-3 text-xs text-purple-900 animate-pulse">
              <Loader2 className="w-4 h-4 text-purple-600 animate-spin shrink-0" />
              <span className="font-semibold">{processStage}</span>
            </div>
          )}

          {/* CTA Pay Button */}
          <button
            onClick={handlePay}
            disabled={isProcessing}
            className="w-full py-3.5 px-4 rounded-xl bg-[#0C2340] hover:bg-[#123157] text-white font-bold text-xs shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                <span>Processing Payment...</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Pay {formatPrice(amount)} Securely</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 text-stone-300" />
              </>
            )}
          </button>

          {/* Razorpay Footer Badges */}
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-400">
            <span className="flex items-center gap-1 font-mono">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              256-Bit SSL Encrypted
            </span>
            <span className="font-bold tracking-wider text-stone-500 uppercase">
              Razorpay Trusted
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
