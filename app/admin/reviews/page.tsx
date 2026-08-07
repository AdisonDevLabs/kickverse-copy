// app/admin/reviews/page.tsx
import { getDb } from '@/lib/db';
import { testimonials, products } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import ReviewsClient from './ReviewsClient';

export const revalidate = 0; // Admin data should always be fresh

export default async function AdminReviewsPage() {
  const db = await getDb();
  
  // Fetch all reviews and attach the associated product name and image
  const allReviewsData = await db.select({
    review: testimonials,
    productName: products.name,
    productImage: products.image
  })
  .from(testimonials)
  .leftJoin(products, eq(testimonials.product, products.id))
  .orderBy(desc(testimonials.id));

  // Fetch a lightweight list of all products for the "Add WhatsApp Review" dropdown
  const allProducts = await db.select({
    id: products.id,
    name: products.name,
  })
  .from(products)
  .orderBy(desc(products.createdAt));

  return <ReviewsClient initialReviews={allReviewsData} products={allProducts} />;
}