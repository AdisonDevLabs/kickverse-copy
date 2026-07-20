// app/admin/products/new/page.tsx
import { getDb } from '@/lib/db';
import { categories, mediaAssets } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import NewFormClient from './NewFormClient';

export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
  const db = await getDb();
  
  // Fetch data
  const allCategories = await db.select().from(categories);
  
  // Fetch media assets for mapping
  let allMedia: any[] = [];
  try {
     allMedia = await db.select().from(mediaAssets).orderBy(desc(mediaAssets.id));
  } catch (e) {
     console.error("Please ensure you've exported mediaAssets in schema.ts", e);
  }

  return <NewFormClient initialCategories={allCategories} initialMedia={allMedia} />;
}