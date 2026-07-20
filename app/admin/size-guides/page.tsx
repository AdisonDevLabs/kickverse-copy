// app/admin/size-guides/page.tsx

import { getDb } from '@/lib/db';
import { sizeGuides } from '@/lib/db/schema';
import SizeGuidesClient from './SizeGuidesClient';

export const dynamic = 'force-dynamic';

export default async function SizeGuidesPage() {
  const db = await getDb();
  const guides = await db.select().from(sizeGuides);
  
  return <SizeGuidesClient initialGuides={guides} />;
}