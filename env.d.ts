// env.d.ts

// Tell TypeScript to merge this interface with the global one
declare global {
  interface CloudflareEnv {
    kickverse_copy_db: D1Database;
    PRODUCT_IMAGES: R2Bucket;
  }
}

export {};