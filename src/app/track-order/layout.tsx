import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Track Your Saree Order',
  description:
    'Track live courier delivery and dispatch status for your handloom saree order with your order ID or registered phone number.',
  alternates: {
    canonical: '/track-order',
  },
  openGraph: {
    title: 'Track Your Order | Royal Saree & Family',
    description:
      'Check real-time shipping updates, tracking numbers, and delivery status for your sarees.',
  },
};

export default function TrackOrderLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
