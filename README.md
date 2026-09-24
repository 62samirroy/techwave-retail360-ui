# TechWave Retail360 — Storefront & SaaS Management UI Application

> **Demo Client Business:** Royal Saree & Fashion  
> **Parent Enterprise Platform:** TechWave Solutions  
> **Tagline:** Build • Innovate • Transform  
> **Contact:** Phone: +91 9641145871 | Email: techwavesolutions.dev@gmail.com  

---

## 🌟 Overview

**TechWave Retail360 (UI)** is a high-performance, modern, compact, SaaS-grade commerce application engineered with **Next.js 14 (App Router)**, **React 18**, **TypeScript**, and **Tailwind CSS**. It is architecturally decoupled from the backend REST API and operates as a standalone repository and deployment target.

### Key Capabilities

1. **Luxury Indian Saree Storefront**:
   - 12-section high-converting landing page with hero storytelling, weave collections, testimonials, authentic craftsmanship assurance, and interactive consultation.
   - Comprehensive Shop page with real-time multi-facet filtering (weave categories, price sliders, stock availability, sorting).
   - Rich product details with multi-angle galleries, fabric specifications, Silk Mark indicators, stock level badges, reviews, and direct WhatsApp weaver inquiry.
   - Cart with free shipping milestone indicator, coupon validation, and stock caps.
   - Razorpay test-mode checkout with customer address book, order summary, and signature verification.
   - Self-service Order Tracking with courier status timeline (AWB verification, Blue Dart Express).
   - Customer Portal: Orders history, saved wishlist, profile management.

2. **Full-Featured Executive Admin Portal** (`/admin`):
   - **Executive Dashboard**: KPI summary cards (30d revenue, today's sales, pending actions, low-stock count, customer count, AOV), SVG trend sparkline, sales-by-category progress meters, and recent orders.
   - **Product Catalog Management** (`/admin/products`): Full CRUD, image management, live stock counters, badges (Featured, Bestseller), status toggles.
   - **Weave Categories** (`/admin/categories`): Category CRUD, slug generator, product counts, cover banners.
   - **Inventory Health & Ledger** (`/admin/inventory`): Live multi-channel stock matrix, low-stock filter, stock adjustments (+/-) with auditable reasons and historical audit logs.
   - **Orders & Fulfillment** (`/admin/orders`): Order inspector, status transitions (`PENDING`, `CONFIRMED`, `PROCESSING`, `PACKED`, `SHIPPED`, `OUT_FOR_DELIVERY`, `DELIVERED`), tracking number management, and 1-click WhatsApp customer update links.
   - **Customer Directory** (`/admin/customers`): Registered shoppers, lifetime spend, order volume, default addresses, direct WhatsApp action.
   - **Bridal Consultation Inquiries** (`/admin/inquiries`): Inquiry tickets, status management, admin follow-up notes.
   - **Sales Analytics** (`/admin/analytics`): Multi-range turnover analysis (7d, 30d, 90d, all), top grossing items, category volume shares.
   - **AI Business Copilot** (`/admin/ai-assistant`): Real-time chat assistant grounded in live SQLite database records, sales trends, low stock alerts, and instant marketing copy generator with 1-click clipboard copy.
   - **Platform Configuration** (`/admin/settings`): Business identity, tax rates, free shipping thresholds, WhatsApp routing, announcement banner controls.

3. **Floating Customer AI Shopping Stylist**:
   - Available on storefront with natural language recommendations, saree styling advice, and bridal package guidance.

---

## 🔑 Demo Access Credentials

| Role | Email | Password | Quick Login |
|------|-------|----------|-------------|
| **Administrator** | `admin@royal.techwavesolutions.dev` | `admin123` | 1-Click button on `/login` |
| **Customer** | `priya.sharma@example.com` | `customer123` | 1-Click button on `/login` |

---

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5+
- **Styling**: Tailwind CSS with custom TechWave design system tokens
- **Icons**: Lucide React
- **API Client**: Native `fetch` with credentials cookie support

---

## 🚀 Getting Started

### 1. Environment Configuration

Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the Development Server

```bash
npm run dev
```

The application will be accessible at: `http://localhost:3000`

---

## 🏢 Brand & Corporate Credits

- **Platform Architect**: TechWave Solutions
- **Tagline**: Build • Innovate • Transform
- **Client Showcase**: Royal Saree & Fashion (Varanasi, India)
