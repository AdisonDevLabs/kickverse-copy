// app/actions/public-reviews.ts
'use server';

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getDb } from '@/lib/db';
import { testimonials } from '@/lib/db/schema';

const R2_PUBLIC_URL = 'https://cdn.kickverse.co.ke';

const S3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function generateReviewUploadUrl() {
  try {
    const fileId = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const key = `public-reviews/${fileId}.webp`; 
    
    const command = new PutObjectCommand({
      Bucket: "kickverse-copy-images",
      Key: key,
      ContentType: 'image/webp' 
    });

    const uploadUrl = await getSignedUrl(S3, command, { expiresIn: 60 });
    
    return { success: true, uploadUrl, publicUrl: `${R2_PUBLIC_URL}/${key}` };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function submitPublicReview(data: { 
  name: string; 
  location: string;
  text: string; 
  rating: number; 
  productId?: string; 
  productName?: string;
  reviewImage?: string; 
  profile?: string;
}) {
  try {
    const db = await getDb();
    
    await db.insert(testimonials).values({
      name: data.name,
      location: data.location,
      rating: data.rating,
      text: data.text,
      product: data.productId || null,
      productName: data.productName || null,
      reviewImage: data.reviewImage || null,
      profile: data.profile || null, // Left null so the frontend falls back to the default avatar
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      purchased: false, // Must be verified by admin
      isGlobal: data.productId ? false : true, // If no product, it's a global store review
      isApproved: false // Goes to Admin moderation queue
    });
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}