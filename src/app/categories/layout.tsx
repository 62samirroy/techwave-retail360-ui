import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Masterloom Categories & Heritage Weaves',
  description:
    'Explore India’s finest regional saree crafts: Kanjivaram Silks, Banarasi Brocades, Gadwal Pattu, Patola Ikats, Baluchari Silks, and Mysore Crepe.',
  alternates: {
    canonical: '/categories',
  },
  openGraph: {
    title: 'Masterloom Saree Categories | Royal Saree & Family',
    description:
      'Explore certified Silk Mark handlooms woven across India’s historic weaving corridors.',
  },
};

export default function CategoriesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
