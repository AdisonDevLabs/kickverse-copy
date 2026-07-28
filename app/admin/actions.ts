// app/admin/actions.ts
'use server';

import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getDb } from '@/lib/db';
import { products, categories, colorMap, sizeGuides, mediaAssets } from '@/lib/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

const R2_PUBLIC_URL = 'https://pub-f155ba911ca84f60b68320b0d5bb35df.r2.dev'; 

export async function createProduct(formData: FormData) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = await getDb();

    // 1. Process Unified Images
    const imageLayoutStr = formData.get('imageLayout') as string;
    let finalImagesArray: string[] = [];
    const mediaIdsToDelete: string[] = [];

    if (imageLayoutStr) {
      // NEW LOGIC: Unified Drag & Drop
      const imageLayout = JSON.parse(imageLayoutStr);
      const imageFiles = formData.getAll('imageFiles') as File[];
      
      for (const item of imageLayout) {
        if (item.type === 'library') {
          finalImagesArray.push(item.url);
          if (item.mediaId) mediaIdsToDelete.push(item.mediaId);
        } else if (item.type === 'file') {
          const file = imageFiles[item.fileIndex];
          if (file && file.size > 0) {
            const key = `products/${Date.now()}-unified-${file.name.replace(/\s+/g, '-')}`;
            await env.PRODUCT_IMAGES.put(key, new Uint8Array(await file.arrayBuffer()), { httpMetadata: { contentType: file.type } });
            finalImagesArray.push(`${R2_PUBLIC_URL}/${key}`);
          }
        }
      }
    } else {
      // OLD LOGIC: Legacy Fallback
      const mediaMainImage = formData.get('mediaMainImage') as string;
      let mainImageUrl = mediaMainImage;

      if (!mainImageUrl) {
        const mainImageFile = formData.get('mainImage') as File;
        if (!mainImageFile || mainImageFile.size === 0) throw new Error('Main image is required');

        const mainImageKey = `products/${Date.now()}-main-${mainImageFile.name.replace(/\s+/g, '-')}`;
        await env.PRODUCT_IMAGES.put(mainImageKey, new Uint8Array(await mainImageFile.arrayBuffer()), { httpMetadata: { contentType: mainImageFile.type } });
        mainImageUrl = `${R2_PUBLIC_URL}/${mainImageKey}`;
      }

      let galleryUrls: string[] = [];
      const mediaGalleryImagesStr = formData.get('mediaGalleryImages') as string;
      if (mediaGalleryImagesStr) {
         const parsed = JSON.parse(mediaGalleryImagesStr);
         if (Array.isArray(parsed)) galleryUrls = parsed;
      }

      const galleryFiles = formData.getAll('galleryImages') as File[];
      const validGalleryFiles = galleryFiles.filter(file => file && file.size > 0);

      if (validGalleryFiles.length > 0) {
        const uploadPromises = validGalleryFiles.map(async (file) => {
          const key = `products/${Date.now()}-gallery-${file.name.replace(/\s+/g, '-')}`;
          await env.PRODUCT_IMAGES.put(key, new Uint8Array(await file.arrayBuffer()), { httpMetadata: { contentType: file.type } });
          return `${R2_PUBLIC_URL}/${key}`;
        });
        const newGalleryUrls = await Promise.all(uploadPromises);
        galleryUrls = [...galleryUrls, ...newGalleryUrls];
      }
      
      finalImagesArray = [mainImageUrl, ...galleryUrls];
    }

    if (finalImagesArray.length === 0) throw new Error('At least one product image is required');

    // Index 0 is always the main image based on the unified order
    const finalMainImageUrl = finalImagesArray[0];

    const newProduct = {
      id: `p-${Date.now()}`,
      name: formData.get('name') as string,
      price: parseInt(formData.get('price') as string, 10),
      originalPrice: formData.get('originalPrice') ? parseInt(formData.get('originalPrice') as string, 10) : null,
      
      image: finalMainImageUrl,
      images: finalImagesArray, 
      
      category: formData.get('category') as string,
      description: formData.get('description') as string,
      sizes: (formData.get('sizes') as string).split(',').map(s => s.trim()).filter(Boolean),
      colors: (formData.get('colors') as string).split(',').map(c => c.trim()).filter(Boolean),
      isNewArrival: formData.get('isNewArrival') === 'on',
      isBestSeller: formData.get('isBestSeller') === 'on',
      isFlashDeal: formData.get('isFlashDeal') === 'on',
      rating: 5.0,
      reviews: 0,
      created_at: new Date().toISOString(),
    };

    await db.insert(products).values(newProduct);

    // If media assets were utilized from the library, automatically clear them out
    if (mediaIdsToDelete.length > 0) {
      await db.delete(mediaAssets).where(inArray(mediaAssets.id, mediaIdsToDelete));
    }

    revalidatePath('/shop');
    revalidatePath('/');
    revalidatePath('/admin');

    return { success: true, message: 'Product created successfully!' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateProduct(id: string, formData: FormData) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = await getDb();

    const existing = await db.select().from(products).where(eq(products.id, id)).limit(1);
    if (!existing[0]) throw new Error('Product not found');

    const imageLayoutStr = formData.get('imageLayout') as string;
    let finalMainImageUrl = existing[0].image;
    let finalImagesArray = existing[0].images || [];
    const mediaIdsToDelete: string[] = [];

    if (imageLayoutStr) {
      // NEW LOGIC: Unified Drag & Drop Integration (if you upgrade your edit form)
      const imageLayout = JSON.parse(imageLayoutStr);
      const imageFiles = formData.getAll('imageFiles') as File[];
      finalImagesArray = [];
      
      for (const item of imageLayout) {
        if (item.type === 'library' || item.type === 'existing') {
          finalImagesArray.push(item.url);
          if (item.mediaId) mediaIdsToDelete.push(item.mediaId);
        } else if (item.type === 'file') {
          const file = imageFiles[item.fileIndex];
          if (file && file.size > 0) {
            const key = `products/${Date.now()}-unified-${file.name.replace(/\s+/g, '-')}`;
            await env.PRODUCT_IMAGES.put(key, new Uint8Array(await file.arrayBuffer()), { httpMetadata: { contentType: file.type } });
            finalImagesArray.push(`${R2_PUBLIC_URL}/${key}`);
          }
        }
      }
      if (finalImagesArray.length > 0) {
         finalMainImageUrl = finalImagesArray[0];
      }
    } else {
      // OLD LOGIC: Keeping backward compatibility just in case
      const mediaMainImage = formData.get('mediaMainImage') as string;
      if (mediaMainImage) {
        finalMainImageUrl = mediaMainImage; 
      } else {
        const mainImageFile = formData.get('mainImage') as File;
        if (mainImageFile && mainImageFile.size > 0) {
          const mainImageKey = `products/${Date.now()}-main-${mainImageFile.name.replace(/\s+/g, '-')}`;
          await env.PRODUCT_IMAGES.put(mainImageKey, new Uint8Array(await mainImageFile.arrayBuffer()), { httpMetadata: { contentType: mainImageFile.type } });
          finalMainImageUrl = `${R2_PUBLIC_URL}/${mainImageKey}`;
        }
      }

      let galleryUrls: string[] = [];
      const mediaGalleryImagesStr = formData.get('mediaGalleryImages') as string;
      if (mediaGalleryImagesStr) {
        const parsed = JSON.parse(mediaGalleryImagesStr);
        if (Array.isArray(parsed)) galleryUrls = parsed;
      }

      const galleryFiles = formData.getAll('galleryImages') as File[];
      const validGalleryFiles = galleryFiles.filter(file => file && file.size > 0);
      
      if (validGalleryFiles.length > 0) {
        const uploadPromises = validGalleryFiles.map(async (file) => {
          const key = `products/${Date.now()}-gallery-${file.name.replace(/\s+/g, '-')}`;
          await env.PRODUCT_IMAGES.put(key, new Uint8Array(await file.arrayBuffer()), { httpMetadata: { contentType: file.type } });
          return `${R2_PUBLIC_URL}/${key}`;
        });
        const directGalleryUrls = await Promise.all(uploadPromises);
        galleryUrls = [...galleryUrls, ...directGalleryUrls];
      }

      finalImagesArray = [finalMainImageUrl, ...galleryUrls];
    }

    const updatedData = {
      name: formData.get('name') as string,
      price: parseInt(formData.get('price') as string, 10),
      originalPrice: formData.get('originalPrice') ? parseInt(formData.get('originalPrice') as string, 10) : null,
      
      image: finalMainImageUrl,
      images: finalImagesArray,
      
      category: formData.get('category') as string,
      description: formData.get('description') as string,
      sizes: (formData.get('sizes') as string).split(',').map(s => s.trim()).filter(Boolean),
      colors: (formData.get('colors') as string).split(',').map(c => c.trim()).filter(Boolean),
      isNewArrival: formData.get('isNewArrival') === 'on',
      isBestSeller: formData.get('isBestSeller') === 'on',
      isFlashDeal: formData.get('isFlashDeal') === 'on',
    };

    await db.update(products).set(updatedData).where(eq(products.id, id));
    
    // Automatically wipe assigned media from the library pool during updates as well
    if (mediaIdsToDelete.length > 0) {
      await db.delete(mediaAssets).where(inArray(mediaAssets.id, mediaIdsToDelete));
    }

    revalidatePath('/shop');
    revalidatePath('/');
    revalidatePath('/admin');
    revalidatePath(`/product/${id}`);

    return { success: true, message: 'Product updated successfully!' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteProduct(id: string) {
  try {
    const db = await getDb();
    await db.delete(products).where(eq(products.id, id));
    
    revalidatePath('/shop');
    revalidatePath('/');
    revalidatePath('/admin');
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createQuickCategory(name: string) {
  try {
    const db = await getDb();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    await db.insert(categories).values({
      slug,
      name,
      label: 'New Category',
      image: '/pexels-wedding-maps-130174465-10114295.jpg',
      span: 'md:col-span-2'
    });
    
    revalidatePath('/admin');
    return { success: true, category: { name, slug } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createCategory(formData: FormData) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = await getDb();
    
    const name = formData.get('name') as string;
    const label = formData.get('label') as string;
    const span = formData.get('span') as string || 'md:col-span-2';
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    const imageFile = formData.get('image') as File;
    if (!imageFile || imageFile.size === 0) {
        throw new Error('Category image is required');
    }

    const key = `categories/${slug}-${Date.now()}`;
    await env.PRODUCT_IMAGES.put(key, new Uint8Array(await imageFile.arrayBuffer()), { 
        httpMetadata: { contentType: imageFile.type } 
    });
    const imageUrl = `https://pub-f155ba911ca84f60b68320b0d5bb35df.r2.dev/${key}`;

    await db.insert(categories).values({ 
        slug, 
        name, 
        label, 
        span, 
        image: imageUrl 
    });
    
    revalidatePath('/admin');
    revalidatePath('/shop');
    revalidatePath('/');
    
    return { success: true, category: { name, slug } };
  } catch (e: any) { 
    return { success: false, error: e.message }; 
  }
}

export async function deleteCategory(slug: string) {
  const db = await getDb();
  await db.delete(categories).where(eq(categories.slug, slug));
  revalidatePath('/admin');
  return { success: true };
}

export async function updateCategory(slug: string, formData: FormData) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = await getDb();
    
    const name = formData.get('name') as string;
    const label = formData.get('label') as string;
    const span = formData.get('span') as string || 'md:col-span-2';
    
    const existing = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
    if (!existing[0]) throw new Error('Category not found');

    let imageUrl = existing[0].image;
    const imageFile = formData.get('image') as File;
    
    if (imageFile && imageFile.size > 0) {
      const key = `categories/${slug}-${Date.now()}`;
      await env.PRODUCT_IMAGES.put(key, new Uint8Array(await imageFile.arrayBuffer()), { 
          httpMetadata: { contentType: imageFile.type } 
      });
      imageUrl = `https://pub-f155ba911ca84f60b68320b0d5bb35df.r2.dev/${key}`;
    }

    await db.update(categories).set({ 
        name, 
        label, 
        span, 
        image: imageUrl 
    }).where(eq(categories.slug, slug));
    
    revalidatePath('/admin');
    revalidatePath('/shop');
    revalidatePath('/');
    
    return { success: true, category: { name, slug } };
  } catch (e: any) { 
    return { success: false, error: e.message }; 
  }
}

export async function saveColor(colorName: string, hexCode: string, isEdit: boolean) {
  try {
    const db = await getDb();
    
    if (isEdit) {
      await db.update(colorMap).set({ hexCode }).where(eq(colorMap.colorName, colorName));
    } else {
      const existing = await db.select().from(colorMap).where(eq(colorMap.colorName, colorName)).limit(1);
      if (existing.length > 0) throw new Error("Color already exists.");
      await db.insert(colorMap).values({ colorName, hexCode });
    }
    
    revalidatePath('/admin/colors');
    revalidatePath('/product/[id]', 'page');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function deleteColor(colorName: string) {
  try {
    const db = await getDb();
    await db.delete(colorMap).where(eq(colorMap.colorName, colorName));
    revalidatePath('/admin/colors');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function saveSizeGuide(id: string, name: string, headers: string[], rows: string[][], isEdit: boolean) {
  try {
    const db = await getDb();
    
    if (isEdit) {
      await db.update(sizeGuides).set({ name, headers, rows }).where(eq(sizeGuides.id, id));
    } else {
      const existing = await db.select().from(sizeGuides).where(eq(sizeGuides.id, id)).limit(1);
      if (existing.length > 0) throw new Error("Size guide ID already exists.");
      await db.insert(sizeGuides).values({ id, name, headers, rows });
    }
    
    revalidatePath('/admin/size-guides');
    revalidatePath('/product/[id]', 'page');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function deleteSizeGuide(id: string) {
  try {
    const db = await getDb();
    await db.delete(sizeGuides).where(eq(sizeGuides.id, id));
    revalidatePath('/admin/size-guides');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}