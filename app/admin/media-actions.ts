// app/admin/media-actions.ts
'use server';

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// Using your specific public URL[cite: 7, 11]
const R2_PUBLIC_URL = 'https://pub-f155ba911ca84f60b68320b0d5bb35df.r2.dev';

// Configure S3 client for Cloudflare R2
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
          Bucket: "kickverse-copy-images", // Your specific bucket name
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
    
    // Using raw SQL for bulk insert ease, or use Drizzle bulk insert if configured
    const values = assets.map(a => `('${a.id}', '${a.url}', '${a.fileName}', 0)`).join(',');
    
    await db.run(`INSERT INTO media_assets (id, url, file_name, is_assigned) VALUES ${values}`);
    
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}