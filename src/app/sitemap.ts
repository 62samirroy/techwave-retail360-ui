import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://royalsaree.techwavesolutions.dev';

  const staticRoutes = [
    '',
    '/shop',
    '/categories/kanjivaram-silk',
    '/categories/banarasi-brocade',
    '/categories/organza-floral',
    '/categories/chanderi-linen',
    '/categories/bandhani-leheriya',
    '/categories/party-cocktail-wear',
    '/about',
    '/contact',
    '/policies',
    '/track-order',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : route.startsWith('/shop') ? 0.9 : 0.7,
  }));

  return staticRoutes;
}
