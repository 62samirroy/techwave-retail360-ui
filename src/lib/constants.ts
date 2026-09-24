export const APP_CONFIG = {
  name: 'TechWave Retail360',
  company: 'TechWave Solutions',
  tagline: 'Build • Innovate • Transform',
  demoStore: 'Royal Saree & Fashion',
  phone: '+91 9641145871',
  email: 'techwavesolutions.dev@gmail.com',
  whatsapp: '+919641145871',
  currency: 'INR',
  currencySymbol: '₹',
  standardShippingFee: 99,
  freeShippingThreshold: 1999,
  taxRate: 5,
  address: 'TechWave Tower, Sector V, Salt Lake, Kolkata, West Bengal 700091',
};

export const DEMO_CREDENTIALS = {
  admin: {
    email: 'admin@royal.techwavesolutions.dev',
    password: 'admin123',
    role: 'ADMIN',
    name: 'Prakash Roy (Store Admin)',
  },
  customer: {
    email: 'priya.sharma@example.com',
    password: 'customer123',
    role: 'CUSTOMER',
    name: 'Priya Sharma',
  },
};

export const ORDER_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Order Placed', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  CONFIRMED: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  PROCESSING: { label: 'Processing', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  PACKED: { label: 'Quality Checked & Packed', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  SHIPPED: { label: 'Shipped (In Transit)', color: 'bg-sky-100 text-sky-800 border-sky-200' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', color: 'bg-teal-100 text-teal-800 border-teal-200' },
  DELIVERED: { label: 'Delivered', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  CANCELLED: { label: 'Cancelled', color: 'bg-rose-100 text-rose-800 border-rose-200' },
};

export const PAYMENT_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pending', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  PAID: { label: 'Paid (Verified)', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  FAILED: { label: 'Failed', color: 'bg-rose-100 text-rose-800 border-rose-200' },
  REFUNDED: { label: 'Refunded', color: 'bg-slate-100 text-slate-800 border-slate-200' },
};
