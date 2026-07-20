// app/admin/products/new/page.tsx
import { getDb } from '@/lib/db';
import { categories } from '@/lib/db/schema';
import NewFormClient from './NewFormClient';

export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
  const db = await getDb();
  
  // Fetch all active categories from D1
  const allCategories = await db.select().from(categories);

  return <NewFormClient initialCategories={allCategories} />;
}