// app/actions/reviews.ts

'use server';

import { getDb } from '@/lib/db';
import { testimonials } from '@/lib/db/schema';

export async function submitProductReview(data: { name: string; location: string; rating: number; text: string; productId: string }) {
  try {
    const db = await getDb();
    
    await db.insert(testimonials).values({
      name: data.name,
      location: data.location,
      rating: data.rating,
      text: data.text,
      product: data.productId,
      profile: '/pexels-wedding-maps-130174465-10114295.jpg', // Default avatar fallback
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      purchased: false,
      isGlobal: false,
      isApproved: false // Hidden until Godfrey approves it
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}