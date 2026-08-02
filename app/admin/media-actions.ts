// app/admin/media-actions.ts
'use server';

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getDb } from '@/lib/db';
import { mediaAssets } from '@/lib/db/schema'; // <-- Added schema import
import { revalidatePath } from 'next/cache';

const R2_PUBLIC_URL = 'https://cdn.kickverse.co.ke';

const S3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function generatePresignedUrls(fileNames: string[]) {
  try {
    const urls = await Promise.all(
      fileNames.map(async (fileName) => {
        const fileId = `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const key = `products/${fileId}-${fileName.replace(/\s+/g, '-')}`;
        
        const command = new PutObjectCommand({
          Bucket: "kickverse-copy-images",
          Key: key,
        });

        const uploadUrl = await getSignedUrl(S3, command, { expiresIn: 3600 });
        
        return {
          id: fileId,
          uploadUrl,
          publicUrl: `${R2_PUBLIC_URL}/${key}`,
          fileName,
        };
      })
    );
    return { success: true, urls };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function saveMediaAssetsToDb(assets: { id: string, url: string, fileName: string }[]) {
  try {
    const db = await getDb();
    
    // Map the array to match your exact Drizzle schema structure
    const insertData = assets.map(a => ({
      id: a.id,
      url: a.url,
      fileName: a.fileName,
      isAssigned: false, // matches the schema default
    }));
    
    // Execute a native Drizzle ORM bulk insert
    await db.insert(mediaAssets).values(insertData);
    
    revalidatePath('/admin');
    revalidatePath('/admin/products/new');
    return { success: true };
  } catch (error: any) {
    console.error("Database Insert Error:", error);
    return { success: false, error: error.message };
  }
}