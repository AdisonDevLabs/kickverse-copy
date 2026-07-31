// app/(storefront)/shop/page.tsx
import { Metadata } from 'next';
import { getDb } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { brand } from '@/lib/data/brand';
import ShopClient from './ShopClient';

export const dynamic = 'force-dynamic';

// 1. Static SEO Metadata for the Shop Page
export const metadata: Metadata = {
  title: 'Shop All Footwear', // Layout template will append "| KICKVERSE"
  description: 'Browse our complete catalog of authentic sneakers, firm ground soccer cleats, and astro turf boots. Swift delivery across Kenya.',
  openGraph: {
    title: `Shop Collection | ${brand.shortName}`,
    description: 'Browse our complete catalog of authentic sneakers and football boots in Kenya.',
    url: `${brand.url}shop`,
  },
};

export default async function ShopPage() {
  // Wait for the OpenNext / Cloudflare bindings to initialize
  const db = await getDb();
  
  // Fetch every single product from the database
  const allProducts = await db.select().from(products);

  // 2. Construct JSON-LD Schema.org Data for the Collection Page
  // We map through the products to create a structured list for Google crawlers
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

  // Pass them cleanly down to your interactive UI
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ShopClient initialProducts={allProducts} />
    </>
  );
}