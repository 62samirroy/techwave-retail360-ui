import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppLayoutWrapper } from '@/components/layout/AppLayoutWrapper';

export const metadata: Metadata = {
  title: 'Royal Saree & Fashion | TechWave Retail360',
  description:
    'Exquisite handloom Kanjivaram silk, Banarasi brocades, and designer organza sarees. Built with TechWave Retail360 AI-powered commerce platform.',
  keywords: [
    'Sarees',
    'Kanjivaram Silk',
    'Banarasi Saree',
    'Organza Saree',
    'Handloom Saree',
    'Indian Fashion',
    'TechWave Retail360',
    'Bridal Sarees',
  ],
  authors: [{ name: 'TechWave Solutions', url: 'https://techwavesolutions.dev' }],
  openGraph: {
    title: 'Royal Saree & Fashion | TechWave Retail360',
    description:
      'Curated masterweaver authentic handlooms, pure zari borders, and contemporary draping.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'Royal Saree & Fashion',
  },
};

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap"
          rel="stylesheet"
        />
        {/* Razorpay Checkout SDK Script */}
        <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
      </head>
      <body className="min-h-screen bg-white text-brand-900 font-sans antialiased">
        <AppLayoutWrapper>{children}</AppLayoutWrapper>
      </body>
    </html>
  );
}
