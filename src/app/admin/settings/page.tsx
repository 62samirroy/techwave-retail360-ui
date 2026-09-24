'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  CheckCircle,
  Building,
  CreditCard,
  MessageCircle,
  Megaphone,
  Sparkles,
  Phone,
  Mail,
  AlertCircle,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingState';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Form state
  const [settings, setSettings] = useState({
    store_name: 'Royal Saree & Fashion',
    company_name: 'TechWave Solutions',
    tagline: 'Build • Innovate • Transform',
    contact_phone: '+91 9641145871',
    contact_email: 'techwavesolutions.dev@gmail.com',
    store_address: '14/B Heritage Handloom Lane, Varanasi, Uttar Pradesh 221001',
    currency: 'INR',
    currency_symbol: '₹',
    free_shipping_threshold: '1999',
    standard_shipping_fee: '150',
    tax_rate: '5',
    whatsapp_number: '919641145871',
    whatsapp_welcome_message: 'Namaste! Welcome to Royal Saree & Fashion. How may I help you choose your saree?',
    announcement_banner: '✨ Festive Season Sale: Enjoy Complimentary Pan-India Shipping on orders above ₹1,999!',
    enable_announcement: 'true',
    enable_ai_assistant: 'true',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await api.getSettings();
      if (res.success && res.data) {
        setSettings((prev) => ({
          ...prev,
          ...res.data,
        }));
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      const res = await api.updateSettings(settings);
      if (res.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setSaveError(res.message || 'Failed to update settings');
      }
    } catch (err: any) {
      setSaveError(err.message || 'Network error updating settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner message="Loading store configuration..." />
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-lg border border-brand-200 shadow-xs">
        <div>
          <h1 className="text-base font-bold text-brand-950 flex items-center gap-2">
            <Settings className="w-4 h-4 text-primary-600" />
            <span>Store Configuration & Platform Settings</span>
          </h1>
          <p className="text-xs text-brand-500">
            Maintain TechWave company branding, tax rules, shipping fees, and WhatsApp routing.
          </p>
        </div>

        <Button
          size="sm"
          onClick={handleSave}
          isLoading={saving}
          leftIcon={<Save className="w-3.5 h-3.5" />}
        >
          Save Configuration
        </Button>
      </div>

      {saveSuccess && (
        <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">All settings have been successfully updated in the database!</span>
        </div>
      )}

      {saveError && (
        <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        {/* Section 1: Business Identity */}
        <div className="bg-white p-4 rounded-lg border border-brand-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-brand-100">
            <Building className="w-4 h-4 text-royal-600" />
            <h2 className="text-xs font-bold text-brand-950">Store Brand & Business Identity</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Input
                label="Storefront Name"
                value={settings.store_name}
                onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
                required
              />
            </div>
            <div>
              <Input
                label="Parent Company"
                value={settings.company_name}
                onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Input
                label="Company Tagline"
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
              />
            </div>
            <div>
              <Input
                label="Support Phone (Customer Facing)"
                value={settings.contact_phone}
                onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Input
                label="Support Email"
                type="email"
                value={settings.contact_email}
                onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                required
              />
            </div>
            <div>
              <Input
                label="Registered Business Address"
                value={settings.store_address}
                onChange={(e) => setSettings({ ...settings, store_address: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Commerce, Shipping & Tax */}
        <div className="bg-white p-4 rounded-lg border border-brand-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-brand-100">
            <CreditCard className="w-4 h-4 text-primary-600" />
            <h2 className="text-xs font-bold text-brand-950">Commerce, Taxes & Delivery Tariffs</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Input
                label="Free Shipping Order Threshold (₹)"
                type="number"
                value={settings.free_shipping_threshold}
                onChange={(e) =>
                  setSettings({ ...settings, free_shipping_threshold: e.target.value })
                }
                required
              />
              <p className="text-[10px] text-brand-400 mt-0.5">Orders above this get ₹0 delivery</p>
            </div>

            <div>
              <Input
                label="Standard Shipping Fee (₹)"
                type="number"
                value={settings.standard_shipping_fee}
                onChange={(e) =>
                  setSettings({ ...settings, standard_shipping_fee: e.target.value })
                }
                required
              />
              <p className="text-[10px] text-brand-400 mt-0.5">Charged when below threshold</p>
            </div>

            <div>
              <Input
                label="Saree GST Tax Rate (%)"
                type="number"
                value={settings.tax_rate}
                onChange={(e) => setSettings({ ...settings, tax_rate: e.target.value })}
                required
              />
              <p className="text-[10px] text-brand-400 mt-0.5">Standard Indian handloom GST</p>
            </div>
          </div>
        </div>

        {/* Section 3: WhatsApp & AI Integration */}
        <div className="bg-white p-4 rounded-lg border border-brand-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-brand-100">
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <h2 className="text-xs font-bold text-brand-950">WhatsApp Commerce & Floating AI Copilot</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Input
                label="WhatsApp Business Mobile (with country code)"
                value={settings.whatsapp_number}
                onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                placeholder="919641145871"
                required
              />
            </div>
            <div>
              <Input
                label="Default WhatsApp Greeting Message"
                value={settings.whatsapp_welcome_message}
                onChange={(e) =>
                  setSettings({ ...settings, whatsapp_welcome_message: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-1">
            <label className="flex items-center gap-2 text-xs text-brand-800 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enable_ai_assistant === 'true'}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    enable_ai_assistant: e.target.checked ? 'true' : 'false',
                  })
                }
                className="rounded text-primary-600 focus:ring-primary-500"
              />
              <span className="font-medium">Enable Floating AI Shopping Stylist on Storefront</span>
            </label>
          </div>
        </div>

        {/* Section 4: Storefront Announcement Ribbon */}
        <div className="bg-white p-4 rounded-lg border border-brand-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-brand-100">
            <Megaphone className="w-4 h-4 text-amber-500" />
            <h2 className="text-xs font-bold text-brand-950">Storefront Header Announcement</h2>
          </div>

          <div>
            <Input
              label="Banner Ticker Content"
              value={settings.announcement_banner}
              onChange={(e) => setSettings({ ...settings, announcement_banner: e.target.value })}
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-xs text-brand-800 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enable_announcement === 'true'}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    enable_announcement: e.target.checked ? 'true' : 'false',
                  })
                }
                className="rounded text-primary-600 focus:ring-primary-500"
              />
              <span className="font-medium">Display Announcement Banner on Public Header</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            size="sm"
            isLoading={saving}
            leftIcon={<Save className="w-3.5 h-3.5" />}
          >
            Save All Platform Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
