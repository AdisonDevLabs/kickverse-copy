import { getDb } from '@/lib/db';
import { categories, mediaAssets, productTypeEnum } from '@/lib/db/schema'; // <-- Add productTypeEnum
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

  // Pass the productTypeEnum to the client
  return <NewFormClient initialCategories={allCategories} initialMedia={allMedia} productTypes={productTypeEnum} />;
}