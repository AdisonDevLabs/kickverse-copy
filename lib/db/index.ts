// lib/db/index.ts
import { drizzle } from 'drizzle-orm/d1';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import * as schema from './schema';

// 1. Add 'async' to the function definition
export async function getDb() {
  // 2. Await the context and pass { async: true }
  const { env } = await getCloudflareContext({ async: true });
  
  return drizzle(env.kickverse_copy_db, { schema });
}