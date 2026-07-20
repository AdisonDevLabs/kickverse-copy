// app/shop/page.tsx

import { getDb } from '@/lib/db';
import { products } from '@/lib/db/schema';
import ShopClient from './ShopClient';

export const dynamic = 'force-dynamic';

export default async function ShopPage() {
  // Wait for the OpenNext / Cloudflare bindings to initialize
  const db = await getDb();
  
  // Fetch every single product from the database
  const allProducts = await db.select().from(products);

  // Pass them cleanly down to your interactive UI
  return <ShopClient initialProducts={allProducts} />;
}