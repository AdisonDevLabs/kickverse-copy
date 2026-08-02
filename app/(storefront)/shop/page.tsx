import { Metadata } from 'next';
import { Suspense } from 'react';
import { getDb } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { brand } from '@/lib/data/brand';
import ShopClient from './ShopClient';

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
      {/* Wrap the client component in a Suspense boundary here */}
      <Suspense 
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-brand-dark">
            <div className="w-8 h-8 rounded-full border-4 border-white/20 border-t-brand-primary animate-spin" />
          </div>
        }
      >
        <ShopClient initialProducts={allProducts} />
      </Suspense>
    </>
  );
}