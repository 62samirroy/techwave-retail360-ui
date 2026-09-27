import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const id = params?.id || '';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  try {
    const res = await fetch(`${apiUrl}/products/${id}`, {
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        const prod = json.data;
        const price = prod.discountPrice || prod.price;
        const img = prod.images?.[0]?.url;

        return {
          title: prod.name,
          description:
            prod.shortDescription ||
            `Buy ${prod.name} at Royal Saree & Family. Authentic handloom with Silk Mark certification. Price: ₹${price}`,
          alternates: {
            canonical: `/product/${prod.slug || prod.id}`,
          },
          openGraph: {
            title: `${prod.name} | Royal Saree & Family`,
            description:
              prod.shortDescription ||
              `Buy ${prod.name} at Royal Saree & Family. Authentic handloom silk.`,
            images: img ? [{ url: img, alt: prod.name }] : undefined,
            type: 'website',
          },
          twitter: {
            card: 'summary_large_image',
            title: prod.name,
            description: prod.shortDescription || `Authentic handloom saree ₹${price}`,
            images: img ? [img] : undefined,
          },
        };
      }
    }
  } catch {
    // Fallback if API is unreachable during build
  }

  const formattedName = id
    ? id
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
    : 'Handloom Saree';

  return {
    title: formattedName,
    description: `Exquisite handwoven saree with Silk Mark certification and pure zari borders.`,
    alternates: {
      canonical: `/product/${id}`,
    },
  };
}

export default function ProductDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
