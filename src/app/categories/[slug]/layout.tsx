import type { Metadata } from 'next';

const CATEGORY_META: Record<string, { title: string; desc: string }> = {
  'kanjivaram-silk': {
    title: 'Pure Kanjivaram Silk Sarees',
    desc: 'Handwoven certified pure Kanchipuram silk sarees with authentic gold and silver zari temple borders.',
  },
  'banarasi-brocade': {
    title: 'Varanasi Banarasi Brocade Sarees',
    desc: 'Authentic Varanasi kadwa and katan silk brocades hand-interlocked with rich meenakari artistry.',
  },
  'organza-floral': {
    title: 'Ethereal Organza Silk Sarees',
    desc: 'Sheer, lightweight organza drapes featuring hand-painted motifs and delicate scalloped borders.',
  },
  'chanderi-linen': {
    title: 'Artisan Chanderi & Linen Sarees',
    desc: 'Featherlight Chanderi silks and breathable natural linen handlooms with subtle metallic zari butis.',
  },
  'bandhani-leheriya': {
    title: 'Traditional Bandhani & Leheriya Sarees',
    desc: 'Vibrant tie-and-dye Rajasthani and Gujarati festive drapes crafted on fine pure georgette.',
  },
  'gadwal-pattu': {
    title: 'Sacred Gadwal Pattu Sarees',
    desc: 'South Indian handlooms with contrasting kuttu temple borders and lustrous pure silk bodies.',
  },
  'patola-sarees': {
    title: 'Heritage Double Ikat Patola Sarees',
    desc: 'Masterpiece Patan and Rajkot geometric double-ikat handlooms dyed with natural pigments.',
  },
  'baluchari-silks': {
    title: 'Bishnupur Baluchari & Swarnachari Silks',
    desc: 'Mythological narrative handloom sarees hand-woven with historical epics and courtly motifs.',
  },
  'mysore-crepe': {
    title: 'Pure Mysore Silk Crepe Sarees',
    desc: 'Karnataka Silk Board certified fluid pure crepe silks with authentic gold zari borders.',
  },
  'soft-silk-sarees': {
    title: 'Lightweight Pure Soft Silk Sarees',
    desc: 'Feather-light mulberry soft silk sarees woven for effortless modern festive drape.',
  },
};

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const slug = params?.slug || '';
  const known = CATEGORY_META[slug];
  const formattedName = slug
    ? slug
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
    : 'Collection';

  const title = known?.title || `${formattedName} Sarees`;
  const description =
    known?.desc ||
    `Browse authentic ${formattedName} sarees handcrafted by masterweavers with Silk Mark certification.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/categories/${slug}`,
    },
    openGraph: {
      title: `${title} | Royal Saree & Family`,
      description,
      type: 'website',
    },
  };
}

export default function CategorySlugLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
