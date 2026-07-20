import { getDb } from '@/lib/db';
import { colorMap } from '@/lib/db/schema';
import ColorsClient from './ColorsClient';

export const dynamic = 'force-dynamic';

export default async function ColorsPage() {
  const db = await getDb();
  const colors = await db.select().from(colorMap);
  
  return <ColorsClient initialColors={colors} />;
}