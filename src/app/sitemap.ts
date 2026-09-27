import { MetadataRoute } from 'next';

const CATEGORY_SLUGS = [
  'kanjivaram-silk',
  'banarasi-brocade',
  'organza-floral',
  'chanderi-linen',
  'bandhani-leheriya',
  'party-cocktail-wear',
  'gadwal-pattu',
  'patola-sarees',
  'baluchari-silks',
  'mysore-crepe',
  'soft-silk-sarees',
];

const SEED_PRODUCT_SLUGS = [
  'royal-crimson-kanjivaram-silk',
  'emerald-peacock-kanjivaram-weave',
  'varanasi-royal-navy-kadwa-banarasi',
  'vintage-gulab-pink-banarasi-tanchoi',
  'ruby-red-paithani-silk-peacock-pallu',
  'midnight-emerald-ruffle-glamour',
  'natural-beige-tussar-silk-floral-hand-block',
  'lavender-mist-satin-georgette',
  'powder-blue-scallop-hand-painted-organza',
  'marigold-yellow-traditional-bandhani-georgette',
  'midnight-black-sequin-draped-cocktail',
  'maharani-gold-zari-gadwal-pattu',
  'teal-contrast-magenta-gadwal-silk',
  'heritage-double-ikat-rajkot-patola',
  'patan-crimson-silk-patola-saree',
  'bishnupur-swarnachari-baluchari-silk',
  'royal-purple-mythological-baluchari',
  'pure-mysore-silk-crepe-gold-zari',
  'royal-sapphire-blue-mysore-crepe',
  'pastel-lavender-pure-soft-silk',
  'rose-gold-lightweight-soft-silk',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://royalsaree.techwavesolutions.dev';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const staticRoutes = [
    { url: `${baseUrl}`, priority: 1.0, changeFrequency: 'daily' as const },
    { url: `${baseUrl}/shop`, priority: 0.9, changeFrequency: 'daily' as const },
    { url: `${baseUrl}/categories`, priority: 0.9, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/about`, priority: 0.7, changeFrequency: 'monthly' as const },
    { url: `${baseUrl}/contact`, priority: 0.7, changeFrequency: 'monthly' as const },
    { url: `${baseUrl}/track-order`, priority: 0.6, changeFrequency: 'monthly' as const },
    { url: `${baseUrl}/policies/shipping`, priority: 0.5, changeFrequency: 'monthly' as const },
    { url: `${baseUrl}/policies/refund`, priority: 0.5, changeFrequency: 'monthly' as const },
    { url: `${baseUrl}/policies/privacy`, priority: 0.5, changeFrequency: 'monthly' as const },
    { url: `${baseUrl}/policies/terms`, priority: 0.5, changeFrequency: 'monthly' as const },
  ];

  const categoryRoutes = CATEGORY_SLUGS.map((slug) => ({
    url: `${baseUrl}/categories/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Fetch live products or fallback to seed slugs
  let productSlugs = SEED_PRODUCT_SLUGS;
  try {
    const res = await fetch(`${apiUrl}/products?limit=100`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data?.products?.length > 0) {
        productSlugs = data.data.products.map((p: any) => p.slug || p.id);
      }
    }
  } catch {
    // Fall back to seed product slugs if API offline
  }

  const productRoutes = productSlugs.map((slug) => ({
    url: `${baseUrl}/product/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    ...staticRoutes.map((r) => ({ ...r, lastModified: new Date() })),
    ...categoryRoutes,
    ...productRoutes,
  ];
}
