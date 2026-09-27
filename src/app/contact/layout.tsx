import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us & Heritage Store Visit',
  description:
    'Get in touch with Royal Saree & Family. Inquire about custom bridal weaves, wholesale silk orders, video shopping appointments, and store visits.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact Royal Saree & Family',
    description:
      'Inquire about custom bridal handlooms, wholesale orders, and video shopping consultations.',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
