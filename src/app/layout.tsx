import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppLayoutWrapper } from '@/components/layout/AppLayoutWrapper';

export const metadata: Metadata = {
  title: 'Royal Saree & Family | Retail 360°',
  description:
    'Exquisite handloom Kanjivaram silk, Banarasi brocades, and designer organza sarees. Curated by Royal Saree & Family powered by Retail 360°.',
  keywords: [
    'Sarees',
    'Kanjivaram Silk',
    'Banarasi Saree',
    'Organza Saree',
    'Handloom Saree',
    'Indian Fashion',
    'Retail 360',
    'Royal Saree & Family',
    'Bridal Sarees',
  ],
  authors: [{ name: 'Retail 360° Solutions', url: 'https://techwavesolutions.dev' }],
  openGraph: {
    title: 'Royal Saree & Family | Retail 360°',
    description:
      'Curated masterweaver authentic handlooms, pure zari borders, and contemporary draping.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'Royal Saree & Family',
  },
};

export const viewport: Viewport = {
  themeColor: '#540924',
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
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&display=swap"
          rel="stylesheet"
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
