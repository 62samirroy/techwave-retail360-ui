'use client';

import React, { useState } from 'react';
import { Phone, Mail, MapPin, MessageCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api } from '@/lib/api';
import { APP_CONFIG } from '@/lib/constants';
import { buildWhatsAppLink } from '@/lib/utils';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    inquiryType: 'GENERAL',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.submitInquiry(formData);
      if (res.success) {
        setSuccess(true);
        setFormData({ name: '', email: '', phone: '', message: '', inquiryType: 'GENERAL' });
      } else {
        setError(res.message || 'Failed to submit inquiry.');
      }
    } catch (err: any) {
      setError('Connection error submitting inquiry.');
    } finally {
      setLoading(false);
    }
  };

  const whatsappDirectUrl = buildWhatsAppLink(
    'Namaste Royal Saree team, I would like to speak with a styling and customization consultant.'
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="text-center space-y-1">
        <h1 className="text-2xl sm:text-4xl font-serif font-bold text-[#540924]">
          Get in Touch with our Curators
        </h1>
        <p className="text-xs sm:text-sm text-stone-500">
          We are here to assist you with custom orders, bridal consultations, and dispatch queries.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Contact Info */}
        <div className="md:col-span-5 space-y-4">
          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs space-y-4 text-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#540924] font-serif border-b border-stone-100 pb-2">
              Contact Channels
            </h2>

            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-[#b48325] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-stone-900">Phone Support</p>
                  <p className="text-stone-600">{APP_CONFIG.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-[#b48325] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-stone-900">Email Address</p>
                  <p className="text-stone-600 truncate">{APP_CONFIG.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#b48325] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-stone-900">Registered Flagship</p>
                  <p className="text-stone-600 leading-relaxed text-[11px]">{APP_CONFIG.address}</p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-100">
              <a href={whatsappDirectUrl} target="_blank" rel="noopener noreferrer">
                <button className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-rose-300 bg-rose-50/50 hover:bg-rose-100/60 text-[#540924] px-4 py-2.5 text-xs font-semibold transition-colors shadow-2xs">
                  <MessageCircle className="w-4 h-4 text-[#540924]" />
                  <span>Chat on WhatsApp Directly</span>
                </button>
              </a>
            </div>
          </div>
        </div>

        {/* Inquiry Form */}
        <div className="md:col-span-7">
          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#540924] font-serif border-b border-stone-100 pb-2">
              Send an Inquiry
            </h2>

            {success && (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 flex items-center gap-2 text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Thank you! Your message has been recorded. Our consultants will contact you shortly.</span>
              </div>
            )}

            {error && (
              <div className="rounded-md border border-rose-200 bg-rose-50 p-3 flex items-center gap-2 text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Your Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Kavita Sen"
                />
                <Input
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 9830012345"
                />
              </div>

              <Input
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="kavita.sen@example.com"
              />

              <div>
                <label className="block text-xs font-medium text-brand-700 mb-1">
                  Inquiry Topic
                </label>
                <select
                  name="inquiryType"
                  value={formData.inquiryType}
                  onChange={handleChange}
                  className="w-full rounded-md border border-brand-300 bg-white px-3 py-1.5 text-xs text-brand-900 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="GENERAL">General Store Question</option>
                  <option value="PRODUCT">Specific Saree / Weave Details</option>
                  <option value="ORDER">Order Tracking & Dispatch Assistance</option>
                  <option value="CUSTOM_ORDER">Bridal / Bulk Trousseau Customization</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-brand-700 mb-1">
                  Message
                </label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us what you are looking for..."
                  className="w-full rounded-md border border-brand-300 px-3 py-1.5 text-xs text-brand-900 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <Button type="submit" variant="primary" size="md" isLoading={loading} className="w-full">
                Submit Inquiry
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
