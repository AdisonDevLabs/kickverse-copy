CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    reset_token TEXT,
    reset_token_expiry INTEGER
);



-- ==========================================
-- 1. CATEGORIES SCHEMA & DATA
-- ==========================================
DROP TABLE IF EXISTS categories;
CREATE TABLE categories (
    slug TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    label TEXT,
    image TEXT NOT NULL, -- This will eventually store your Cloudflare R2 URL
    span TEXT
);


-- ==========================================
-- 2. PRODUCTS SCHEMA & DATA
-- ==========================================
DROP TABLE IF EXISTS products;
CREATE TABLE products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price INTEGER NOT NULL,
    originalPrice INTEGER,
    image TEXT NOT NULL,         -- Cloudflare R2 URL
    images TEXT NOT NULL,        -- JSON Array of Cloudflare R2 URLs
    category TEXT NOT NULL,
    rating REAL DEFAULT 5.0,
    reviews INTEGER DEFAULT 0,
    sizes TEXT NOT NULL,         -- JSON Array
    colors TEXT NOT NULL,        -- JSON Array
    isNewArrival INTEGER DEFAULT 0,
    isBestSeller INTEGER DEFAULT 0,
    isFlashDeal INTEGER DEFAULT 0,
    description TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);


-- ==========================================
-- 3. TESTIMONIALS & REVIEWS SCHEMA & DATA
-- ==========================================
DROP TABLE IF EXISTS testimonials;
CREATE TABLE testimonials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    location TEXT,
    rating INTEGER NOT NULL DEFAULT 5,
    text TEXT NOT NULL,
    product TEXT,                -- Can link to product name or ID
    profile TEXT NOT NULL,       -- Cloudflare R2 URL for avatar
    date TEXT,                   -- E.g., '2 weeks ago'
    purchased INTEGER DEFAULT 0, -- Boolean: 1 if verified buyer
    is_global INTEGER DEFAULT 0  -- Boolean: 1 for homepage, 0 for specific products
);

INSERT INTO testimonials (name, location, rating, text, product, profile, date, purchased, is_global) VALUES
-- Global Testimonials (from testimonials array)
('Mary W. – Nairobi', 'Nairobi', 5, 'The shoes are exactly like the pictures. Very comfortable and delivery was fast.', 'Black Heels', 'https://picsum.photos/seed/mary/150/150', NULL, 0, 1),
('Grace M. – Mombasa', 'Mombasa', 5, 'I ordered via WhatsApp and received my pair the next day. Great service!', 'White Sneakers', 'https://picsum.photos/seed/grace/150/150', NULL, 0, 1),
('Faith K. – Kisumu', 'Kisumu', 5, 'Good quality and affordable. I will definitely order again. The sizing was perfect.', 'Office Loafers', 'https://picsum.photos/seed/faith/150/150', NULL, 0, 1),

-- Product Specific Reviews (from productReviews array)
('Mary W.', 'Nairobi', 5, 'The quality exceeded my expectations. So comfortable for office wear and they look exactly like the pictures.', NULL, 'https://picsum.photos/seed/mary/150/150', '2 weeks ago', 1, 0),
('Sarah J.', 'Mombasa', 4, 'Love the design and fast delivery. Fits perfectly.', NULL, 'https://picsum.photos/seed/sarah/150/150', '1 month ago', 1, 0);


-- ==========================================
-- 4. UTILITY TABLES (Size Guide & Color Map)
-- ==========================================
DROP TABLE IF EXISTS size_guide;
DROP TABLE IF EXISTS size_guides;

CREATE TABLE size_guides (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    headers TEXT NOT NULL,
    rows TEXT NOT NULL
);

INSERT INTO size_guides (id, name, headers, rows) VALUES
('shoes', 'Footwear Sizing', '["EU", "UK", "US", "Length (cm)"]', '[
    ["36", "3", "5", "22.5"],
    ["37", "4", "6", "23.5"],
    ["38", "5", "7", "24.0"],
    ["39", "6", "8", "25.0"],
    ["40", "7", "9", "25.5"],
    ["41", "8", "10", "26.5"],
    ["42", "9", "11", "27.0"],
    ["43", "10", "12", "27.5"],
    ["44", "11", "13", "28.0"]
]'),
('apparel', 'Tops & T-Shirts', '["Size", "Chest (in)", "Length (in)"]', '[
    ["S", "34-36", "27"], 
    ["M", "38-40", "28"], 
    ["L", "42-44", "29"],
    ["XL", "46-48", "30"],
    ["XXL", "50-52", "31"]
]');

DROP TABLE IF EXISTS color_map;
CREATE TABLE color_map (
    color_name TEXT PRIMARY KEY,
    hex_code TEXT NOT NULL
);

INSERT INTO color_map (color_name, hex_code) VALUES
('Black', '#000000'), ('White', '#ffffff'), ('Red', '#ff0000'),
('Beige', '#f5f5dc'), ('Nude', '#e3bc9a'), ('Brown', '#8b4513'),
('Silver', '#c0c0c0'), ('Gold', '#ffd700'), ('Blue', '#0000ff'),
('Pink', '#ffc0cb');