// app/(storefront)/page.tsx
import { getDb } from '@/lib/db';
import { products, categories, testimonials } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { brand } from '@/lib/data/brand';
import HomeClient from './HomeClient';

// 1. Tell Next.js to use Cloudflare's Edge network
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // 2. Await the database initialization
  const db = await getDb();

  const allProducts = await db.select().from(products);
  
  const heroCategories = await db.select().from(categories);
  
  const globalTestimonials = await db
    .select()
    .from(testimonials)
    .where(eq(testimonials.isGlobal, true));

  // 3. Construct JSON-LD Schema.org Data for the Storefront Homepage
  const storeJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'OnlineStore',
    name: brand.name,
    url: brand.url,
    logo: `${brand.url.replace(/\/$/, '')}${brand.logo.startsWith('/') ? '' : '/'}${brand.logo}`,
    description: brand.description,
    address: {
      '@type': 'PostalAddress',
      // Dynamically grabs "Nairobi" from "Nairobi, Kenya" in your brand config
      addressLocality: brand.location.split(',')[0].trim(), 
      addressCountry: 'KE',
    },
    // Optional but highly recommended for e-commerce search results
    priceRange: 'KSh 3,000 - KSh 25,000', 
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(storeJsonLd) }}
      />
      <HomeClient 
        initialProducts={allProducts} 
        initialCategories={heroCategories} 
        initialTestimonials={globalTestimonials} 
      />
    </>
  );
}