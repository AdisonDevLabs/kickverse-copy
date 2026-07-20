// app/admin/products/[id]/edit/page.tsx
import { getDb } from '@/lib/db';
import { products, categories } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import EditFormClient from './EditFormClient';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const db = await getDb();
  
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  const product = result[0];
  
  // 1. Fetch the categories from the database
  const allCategories = await db.select().from(categories);

  if (!product) {
    return (
      <div className="h-full flex items-center justify-center text-white">
        <p className="text-gray-400 font-display text-xl uppercase tracking-widest">Product not found</p>
      </div>
    );
  }

  // 2. Pass both props into the client form
  return <EditFormClient product={product} initialCategories={allCategories} />;
}