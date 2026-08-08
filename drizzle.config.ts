import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './lib/db/schema.ts', // Points to your schema file
  out: './drizzle',             // Where the SQL migration files will be saved
  dialect: 'sqlite',            // Cloudflare D1 uses SQLite
});