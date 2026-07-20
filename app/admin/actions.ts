// app/admin/actions.ts
'use server';

import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getDb } from '@/lib/db';
import { products, categories, colorMap, sizeGuides } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

const R2_PUBLIC_URL = 'https://pub-f155ba911ca84f60b68320b0d5bb35df.r2.dev'; 

export async function createProduct(formData: FormData) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = await getDb();

    // 1. Process Main Image
    const mainImageFile = formData.get('mainImage') as File;
    if (!mainImageFile || mainImageFile.size === 0) throw new Error('Main image is required');

    const mainImageKey = `products/${Date.now()}-main-${mainImageFile.name.replace(/\s+/g, '-')}`;
    await env.PRODUCT_IMAGES.put(mainImageKey, await mainImageFile.arrayBuffer(), { httpMetadata: { contentType: mainImageFile.type } });
    const mainImageUrl = `${R2_PUBLIC_URL}/${mainImageKey}`;

    // 2. Process Gallery Images (Multiple files)
    const galleryFiles = formData.getAll('galleryImages') as File[];
    const validGalleryFiles = galleryFiles.filter(file => file && file.size > 0);

    const uploadPromises = validGalleryFiles.map(async (file) => {
      const key = `products/${Date.now()}-gallery-${file.name.replace(/\s+/g, '-')}`;
      await env.PRODUCT_IMAGES.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } });
      return `${R2_PUBLIC_URL}/${key}`;
    });

    const galleryUrls = await Promise.all(uploadPromises);

    // 3. Construct the array: Main Image is ALWAYS index 0
    const finalImagesArray = [mainImageUrl, ...galleryUrls];

    const newProduct = {
      id: `p-${Date.now()}`,
      name: formData.get('name') as string,
      price: parseInt(formData.get('price') as string, 10),
      originalPrice: formData.get('originalPrice') ? parseInt(formData.get('originalPrice') as string, 10) : null,
      
      // Store the single main image and the combined array
      image: mainImageUrl,
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

    // Fetch existing product
    const existing = await db.select().from(products).where(eq(products.id, id)).limit(1);
    if (!existing[0]) throw new Error('Product not found');

    let finalMainImageUrl = existing[0].image;
    let finalImagesArray = existing[0].images; // Current gallery array

    // 1. Process New Main Image (if provided)
    const mainImageFile = formData.get('mainImage') as File;
    if (mainImageFile && mainImageFile.size > 0) {
      const mainImageKey = `products/${Date.now()}-main-${mainImageFile.name.replace(/\s+/g, '-')}`;
      await env.PRODUCT_IMAGES.put(mainImageKey, await mainImageFile.arrayBuffer(), { httpMetadata: { contentType: mainImageFile.type } });
      finalMainImageUrl = `${R2_PUBLIC_URL}/${mainImageKey}`;
      
      // If only the main image is updated, swap out index 0 of the existing array
      if (finalImagesArray.length > 0) {
        finalImagesArray[0] = finalMainImageUrl;
      } else {
        finalImagesArray = [finalMainImageUrl];
      }
    }

    // 2. Process New Gallery Images (if provided)
    const galleryFiles = formData.getAll('galleryImages') as File[];
    const validGalleryFiles = galleryFiles.filter(file => file && file.size > 0);
    
    if (validGalleryFiles.length > 0) {
      // Create an array of upload tasks
      const uploadPromises = validGalleryFiles.map(async (file) => {
        const key = `products/${Date.now()}-gallery-${file.name.replace(/\s+/g, '-')}`;
        await env.PRODUCT_IMAGES.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } });
        return `${R2_PUBLIC_URL}/${key}`;
      });

      // Execute all uploads at the exact same time
      const galleryUrls = await Promise.all(uploadPromises);
      
      // Overwrite the old gallery. Main Image is ALWAYS index 0
      finalImagesArray = [finalMainImageUrl, ...galleryUrls];
    }

    const updatedData = {
      name: formData.get('name') as string,
      price: parseInt(formData.get('price') as string, 10),
      originalPrice: formData.get('originalPrice') ? parseInt(formData.get('originalPrice') as string, 10) : null,
      
      // Update both columns securely
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
      image: '/pexels-wedding-maps-130174465-10114295.jpg', // Safe fallback image from your existing assets
      span: 'md:col-span-2'
    });
    
    revalidatePath('/admin');
    return { success: true, category: { name, slug } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Add these to app/admin/actions.ts
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

    // Upload to R2
    const key = `categories/${slug}-${Date.now()}`;
    await env.PRODUCT_IMAGES.put(key, await imageFile.arrayBuffer(), { 
        httpMetadata: { contentType: imageFile.type } 
    });
    const imageUrl = `https://pub-f155ba911ca84f60b68320b0d5bb35df.r2.dev/${key}`;

    // Insert FULL row into categories table
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
    
    // Fetch existing category to keep old image if a new one isn't provided
    const existing = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
    if (!existing[0]) throw new Error('Category not found');

    let imageUrl = existing[0].image;
    const imageFile = formData.get('image') as File;
    
    // Only upload to R2 if a new image was selected
    if (imageFile && imageFile.size > 0) {
      const key = `categories/${slug}-${Date.now()}`;
      await env.PRODUCT_IMAGES.put(key, await imageFile.arrayBuffer(), { 
          httpMetadata: { contentType: imageFile.type } 
      });
      imageUrl = `https://pub-f155ba911ca84f60b68320b0d5bb35df.r2.dev/${key}`;
    }

    // Update the row. We do not change the slug so product associations don't break.
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

// ==========================================
// COLOR MAP ACTIONS
// ==========================================
export async function saveColor(colorName: string, hexCode: string, isEdit: boolean) {
  try {
    const db = await getDb();
    
    if (isEdit) {
      await db.update(colorMap).set({ hexCode }).where(eq(colorMap.colorName, colorName));
    } else {
      // Check if exists first to avoid PK collision
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

// ==========================================
// SIZE GUIDE ACTIONS
// ==========================================
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