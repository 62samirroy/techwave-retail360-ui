import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { APP_CONFIG } from './constants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getDiscountPercentage(original: number, discounted: number): number {
  if (!original || original <= 0 || !discounted || discounted >= original) return 0;
  return Math.round(((original - discounted) / original) * 100);
}

export function buildWhatsAppLink(messageOrPhone: string, customPhoneOrMessage?: string): string {
  let message = messageOrPhone;
  let phone = APP_CONFIG.whatsapp;

  if (customPhoneOrMessage) {
    if (messageOrPhone.startsWith('+') || /^\d{10,}$/.test(messageOrPhone.replace(/[\s+-]/g, ''))) {
      phone = messageOrPhone;
      message = customPhoneOrMessage;
    } else {
      message = messageOrPhone;
      phone = customPhoneOrMessage;
    }
  }

  const cleanPhone = (phone || APP_CONFIG.whatsapp).replace(/[^0-9]/g, '');
  const encoded = encodeURIComponent(message || '');
  return `https://wa.me/${cleanPhone}?text=${encoded}`;
}

export function formatImageUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') {
    return 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800';
  }
  // Convert any http://localhost:5000/uploads/... or http://127.0.0.1:5000/uploads/...
  // to /uploads/... so Next.js serves it statically directly from public/uploads without server proxy lag
  if (url.includes('/uploads/')) {
    const match = url.match(/\/uploads\/[^?#\s]+/);
    if (match) return match[0];
  }
  return url;
}

