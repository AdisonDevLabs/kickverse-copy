// lib/db/schema.ts
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

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
  category: text('category').notNull(),
  rating: real('rating').default(5.0),
  reviews: integer('reviews').default(0),
  sizes: text('sizes', { mode: 'json' }).$type<string[]>().notNull(),
  colors: text('colors', { mode: 'json' }).$type<string[]>().notNull(),
  isNewArrival: integer('isNewArrival', { mode: 'boolean' }).default(false),
  isBestSeller: integer('isBestSeller', { mode: 'boolean' }).default(false),
  isFlashDeal: integer('isFlashDeal', { mode: 'boolean' }).default(false),
  description: text('description').notNull(),
  created_at: text('created_at') // SQLite stores timestamps as text/strings by default
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
// This single table handles both your global testimonials and product-specific reviews
export const testimonials = sqliteTable('testimonials', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  location: text('location'),
  rating: integer('rating').default(5).notNull(),
  text: text('text').notNull(),
  product: text('product'),
  profile: text('profile').notNull(),
  date: text('date'),
  purchased: integer('purchased', { mode: 'boolean' }).default(false),
  // Use this boolean to filter: true = show on homepage, false = show on product pages
  isGlobal: integer('is_global', { mode: 'boolean' }).default(false) 
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