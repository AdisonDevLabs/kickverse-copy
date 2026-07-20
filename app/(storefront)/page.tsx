// app/page.tsx
import { getDb } from '@/lib/db';
import { products, categories, testimonials } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import HomeClient from './HomeClient';

// 1. Tell Next.js to use Cloudflare's Edge network
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // 2. Await the database initialization
  const db = await getDb();

  const allProducts = await db.select().from(products);
  
  const heroCategories = await db.select().from(categories).limit(8);
  
  const globalTestimonials = await db
    .select()
    .from(testimonials)
    .where(eq(testimonials.isGlobal, true));

  return (
    <HomeClient 
      initialProducts={allProducts} 
      initialCategories={heroCategories} 
      initialTestimonials={globalTestimonials} 
    />
  );
}