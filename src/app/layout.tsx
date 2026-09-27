import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppLayoutWrapper } from '@/components/layout/AppLayoutWrapper';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://royalsaree.techwavesolutions.dev';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Royal Saree & Family | Authentic Handloom Silks, Kanjivaram & Bridal Sarees',
    template: '%s | Royal Saree & Family',
  },
  description:
    'Exquisite Silk Mark certified handloom Kanjivaram silk, Varanasi Banarasi brocades, and designer organza sarees with pure gold and silver zari. Shop online with nationwide delivery.',
  keywords: [
    'Handloom Sarees',
    'Pure Silk Sarees',
    'Kanjivaram Silk Saree',
    'Banarasi Brocade Saree',
    'Organza Floral Saree',
    'Chanderi Silk',
    'Bridal Wedding Sarees',
    'Royal Saree and Family',
    'Pure Zari Sarees',
    'Silk Mark Certified Sarees',
  ],
  authors: [{ name: 'Royal Saree & Family', url: siteUrl }],
  creator: 'Royal Saree & Family',
  publisher: 'Royal Saree & Family',
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Royal Saree & Family | Authentic Handloom Silks & Bridal Sarees',
    description:
      'Curated masterweaver authentic handlooms, pure zari borders, and contemporary draping.',
    url: siteUrl,
    type: 'website',
    locale: 'en_IN',
    siteName: 'Royal Saree & Family',
    images: [
      {
        url: '/hero-banner-1.jpg',
        width: 1200,
        height: 630,
        alt: 'Royal Saree & Family Handloom Silk Collection',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Royal Saree & Family | Authentic Handloom Silks',
    description:
      'Curated masterweaver authentic handlooms with pure zari and generational artistry.',
    images: ['/hero-banner-1.jpg'],
  },
};

export const viewport: Viewport = {
  themeColor: '#540924',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ClothingStore',
  name: 'Royal Saree & Family',
  url: siteUrl,
  image: `${siteUrl}/hero-banner-1.jpg`,
  description:
    'Silk Mark certified handloom sarees, Kanjivaram silk, Banarasi brocades, and bridal ensembles.',
  priceRange: '₹₹₹',
  currenciesAccepted: 'INR',
  paymentAccepted: 'Credit Card, Debit Card, UPI, Net Banking, Cash on Delivery',
  telephone: '+919641145871',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Chowk Heritage Weavers Lane',
    addressLocality: 'Varanasi',
    addressRegion: 'Uttar Pradesh',
    postalCode: '221001',
    addressCountry: 'IN',
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: `${siteUrl}/shop?search={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&display=swap"
          rel="stylesheet"
        />
        {/* Schema.org Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Razorpay Checkout SDK Script */}
        <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
        {/* Google Identity Services SDK Script */}
        <script src="https://accounts.google.com/gsi/client" async defer></script>
      </head>
      <body className="min-h-screen bg-[#FAF8F5] text-stone-900 font-sans antialiased">
        <AppLayoutWrapper>{children}</AppLayoutWrapper>
      </body>
    </html>
  );
}
