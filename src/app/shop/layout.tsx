import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'All Handloom Sarees & Collections',
  description:
    'Shop authentic handwoven Kanjivaram, Banarasi, Chanderi, Organza, Patola, and Gadwal sarees. Filter by weave, color, price, and instant dispatch.',
  alternates: {
    canonical: '/shop',
  },
  openGraph: {
    title: 'Handloom Saree Collection | Royal Saree & Family',
    description:
      'Curated authentic silk sarees crafted with pure zari. Nationwide delivery across India.',
  },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
