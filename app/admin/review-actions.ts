// app/admin/review-actions.ts
'use server';

import { getDb } from '@/lib/db';
import { testimonials, products, storeSettings } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// Helper function to keep product ratings perfectly synced
async function syncProductRating(db: any, productId: string | null) {
  if (!productId) return;
  
  const allProductReviews = await db.select({ rating: testimonials.rating })
    .from(testimonials)
    .where(and(
       eq(testimonials.product, productId), 
       eq(testimonials.isApproved, true)
    ));
  
  const totalReviews = allProductReviews.length;
  const averageRating = totalReviews > 0 
    ? allProductReviews.reduce((acc: number, curr: any) => acc + curr.rating, 0) / totalReviews 
    : 5.0; // Default back to 5.0 if no reviews exist
  
  await db.update(products)
    .set({ 
      rating: Number(averageRating.toFixed(1)), 
      reviews: totalReviews 
    })
    .where(eq(products.id, productId));
}

export async function approveReview(reviewId: number, productId: string | null) {
  try {
    const db = await getDb();
    await db.update(testimonials).set({ isApproved: true }).where(eq(testimonials.id, reviewId));
    
    if (productId) await syncProductRating(db, productId);
    
    revalidatePath('/admin/reviews');
    if (productId) revalidatePath(`/product/${productId}`);
    revalidatePath('/shop');
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteReview(reviewId: number, productId: string | null) {
  try {
    const db = await getDb();
    await db.delete(testimonials).where(eq(testimonials.id, reviewId));
    
    if (productId) await syncProductRating(db, productId);
    
    revalidatePath('/admin/reviews');
    if (productId) revalidatePath(`/product/${productId}`);
    revalidatePath('/');
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleGlobalReview(reviewId: number, currentStatus: boolean) {
  try {
    const db = await getDb();
    await db.update(testimonials).set({ isGlobal: !currentStatus }).where(eq(testimonials.id, reviewId));
    
    revalidatePath('/admin/reviews');
    revalidatePath('/'); // Global reviews affect the homepage marquee
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addWhatsappReview(data: { name: string; location: string; rating: number; text: string; productId: string; profile: string }) {
  try {
    const db = await getDb();
    
    await db.insert(testimonials).values({
      name: data.name,
      location: data.location,
      rating: data.rating,
      text: data.text,
      product: data.productId,
      profile: data.profile, // Now dynamic!
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      purchased: true, 
      isGlobal: false, 
      isApproved: true 
    });

    await syncProductRating(db, data.productId);
    
    revalidatePath('/admin/reviews');
    revalidatePath(`/product/${data.productId}`);
    revalidatePath('/');
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// NEW: Edit an existing review
export async function updateReview(id: number, data: { name: string; location: string; rating: number; text: string; productId: string; profile: string }) {
  try {
    const db = await getDb();
    
    await db.update(testimonials).set({
      name: data.name,
      location: data.location,
      rating: data.rating,
      text: data.text,
      product: data.productId,
      profile: data.profile,
    }).where(eq(testimonials.id, id));

    await syncProductRating(db, data.productId);
    
    revalidatePath('/admin/reviews');
    revalidatePath(`/product/${data.productId}`);
    revalidatePath('/');
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}


export async function updateStoreSettings(data: { happyCustomersText: string; defaultAvatar: string; fallbackRating: string }) {
  try {
    const db = await getDb();
    
    await db.update(storeSettings).set({
      happyCustomersText: data.happyCustomersText,
      defaultAvatar: data.defaultAvatar,
      fallbackRating: data.fallbackRating
    }).where(eq(storeSettings.id, 1));
    
    // Refresh both the admin panel and the storefront homepage
    revalidatePath('/admin/reviews');
    revalidatePath('/'); 
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}