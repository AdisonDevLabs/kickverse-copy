// lib/db/schema.ts
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// Export this array so you can map over it in your Admin Panel's upload forms
export const productTypeEnum = ['Sneakers', 'Soccer Cleats'] as const;

// ==========================================
// 1. PRODUCTS
// ==========================================

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  resetToken: text('reset_token'),
  resetTokenExpiry: integer('reset_token_expiry') // Stored as Unix timestamp
});

export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  price: integer('price').notNull(),
  originalPrice: integer('originalPrice'),
  image: text('image').notNull(),
  images: text('images', { mode: 'json' }).$type<string[]>().notNull(),
  productType: text('product_type', { enum: productTypeEnum }).notNull().default('Sneakers'), 
  category: text('category').notNull(),
  rating: real('rating').default(5.0),
  reviews: integer('reviews').default(0),
  sizes: text('sizes', { mode: 'json' }).$type<string[]>().notNull(),
  colors: text('colors', { mode: 'json' }).$type<string[]>().notNull(),
  isNewArrival: integer('isNewArrival', { mode: 'boolean' }).default(false),
  isBestSeller: integer('isBestSeller', { mode: 'boolean' }).default(false),
  isFlashDeal: integer('isFlashDeal', { mode: 'boolean' }).default(false),
  isPinned: integer('is_pinned', { mode: 'boolean' }).default(false),
  isAccessory: integer('is_accessory', { mode: 'boolean' }).default(false),
  description: text('description').notNull(),
  createdAt: text('created_at')
});

// ==========================================
// 2. CATEGORIES
// ==========================================
export const categories = sqliteTable('categories', {
  slug: text('slug').primaryKey(),
  name: text('name').notNull(),
  label: text('label'),
  image: text('image').notNull(),
  span: text('span')
});

// ==========================================
// 3. TESTIMONIALS & REVIEWS
// ==========================================
export const testimonials = sqliteTable('testimonials', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  location: text('location'),
  rating: integer('rating').default(5).notNull(),
  text: text('text').notNull(),
  
  product: text('product'), // Keeps existing relation (Stores the ID)
  productName: text('product_name'), // NEW: Snapshot of the name
  
  profile: text('profile'), // CHANGED: Now nullable!
  reviewImage: text('review_image'), // NEW: Photo of the actual shoes
  
  date: text('date'),
  purchased: integer('purchased', { mode: 'boolean' }).default(false),
  isGlobal: integer('is_global', { mode: 'boolean' }).default(false),
  isApproved: integer('is_approved', { mode: 'boolean' }).default(false)
});

// ==========================================
// 4. UTILITIES
// ==========================================
export const sizeGuides = sqliteTable('size_guides', {
  id: text('id').primaryKey(), // e.g., 'shoes', 'apparel'
  name: text('name').notNull(), // e.g., 'Footwear Size Guide', 'Tops & Tees'
  headers: text('headers', { mode: 'json' }).$type<string[]>().notNull(),
  rows: text('rows', { mode: 'json' }).$type<string[][]>().notNull()
});

export const colorMap = sqliteTable('color_map', {
  colorName: text('color_name').primaryKey(),
  hexCode: text('hex_code').notNull()
});

// ==========================================
// 5. MEDIA ASSETS
// ==========================================
export const mediaAssets = sqliteTable('media_assets', {
  id: text('id').primaryKey(),
  url: text('url').notNull(),
  fileName: text('file_name').notNull(),
  isAssigned: integer('is_assigned', { mode: 'boolean' }).default(false)
});

// ==========================================
// 7. STORE SETTINGS (Global CMS)
// ==========================================
export const storeSettings = sqliteTable('store_settings', {
  id: integer('id').primaryKey(), // We will only ever use ID 1
  happyCustomersText: text('happy_customers_text').notNull().default('500+ Happy Customers'),
  defaultAvatar: text('default_avatar').notNull().default('/pexels-wedding-maps-130174465-10114295.jpg'),
  fallbackRating: text('fallback_rating').notNull().default('4.8')
});