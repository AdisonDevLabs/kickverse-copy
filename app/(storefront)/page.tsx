// app/(storefront)/page.tsx
import { getDb } from '@/lib/db';
import { products, categories, testimonials, storeSettings } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { brand } from '@/lib/data/brand';
import HomeClient from './HomeClient';

// 1. Tell Next.js to use Cloudflare's Edge network
export const revalidate = 60;

export default async function HomePage() {
  // 2. Await the database initialization
  const db = await getDb();

  const allProducts = await db.select({
    id: products.id,
    name: products.name,
    price: products.price,
    originalPrice: products.originalPrice,
    image: products.image,
    productType: products.productType,
    category: products.category,
    rating: products.rating,
    reviews: products.reviews,
    isNewArrival: products.isNewArrival,
    isBestSeller: products.isBestSeller,
    isFlashDeal: products.isFlashDeal,
    createdAt: products.createdAt,
  })
  .from(products)
  .orderBy(desc(products.createdAt));
  
  const heroCategories = await db.select().from(categories);
  
  const globalTestimonials = await db
    .select({
      id: testimonials.id,
      name: testimonials.name,
      location: testimonials.location,
      rating: testimonials.rating,
      text: testimonials.text,
      profile: testimonials.profile,
      date: testimonials.date,
      purchased: testimonials.purchased,
      isGlobal: testimonials.isGlobal,
      productName: products.name, // Grabs the clean product name from products table
    })
    .from(testimonials)
    .leftJoin(products, eq(testimonials.product, products.id))
    .where(and(
      eq(testimonials.isGlobal, true),
      eq(testimonials.isApproved, true)
    ));

  // --- NEW: Fetch Global Store Settings ---
  const settingsResult = await db.select().from(storeSettings).where(eq(storeSettings.id, 1)).limit(1);
  const storeConfig = settingsResult[0] || { 
    happyCustomersText: '500+ Happy Customers', 
    defaultAvatar: '/pexels-wedding-maps-130174465-10114295.jpg',
    fallbackRating: '4.8'
  };

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
        storeConfig={storeConfig} 
      />
    </>
  );
}