import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { getDb } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { brand } from '@/lib/data/brand';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Shop All Footwear',
  description: 'Browse our complete catalog of authentic sneakers, firm ground soccer cleats, and astro turf boots. Swift delivery across Kenya.',
  openGraph: {
    title: `Shop Collection | ${brand.shortName}`,
    description: 'Browse our complete catalog of authentic sneakers and football boots in Kenya.',
    url: `${brand.url}shop`,
  },
};

// 1. Dynamically import ShopClient and strictly disable SSR
const ShopClient = dynamic(() => import('./ShopClient'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-brand-dark">
      <div className="w-8 h-8 rounded-full border-4 border-white/20 border-t-brand-primary animate-spin" />
    </div>
  ),
});

export default async function ShopPage() {
  const db = await getDb();
  const allProducts = await db.select().from(products);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Kickverse Complete Collection',
    description: 'All available sneakers and football boots at Kickverse Kenya.',
    url: `${brand.url.replace(/\/$/, '')}/shop`,
    numberOfItems: allProducts.length,
    itemListElement: allProducts.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${brand.url.replace(/\/$/, '')}/product/${product.id}`,
      name: product.name,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* 2. Render the dynamic component directly without a Suspense wrapper */}
      <ShopClient initialProducts={allProducts} />
    </>
  );
}