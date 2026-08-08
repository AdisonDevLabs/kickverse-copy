PRAGMA foreign_keys=OFF;

-- 1. Create the new testimonials table with the exact new schema
CREATE TABLE `testimonials_new` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`location` text,
	`rating` integer DEFAULT 5 NOT NULL,
	`text` text NOT NULL,
	`product` text,
	`product_name` text,
	`profile` text,
	`review_image` text,
	`date` text,
	`purchased` integer DEFAULT false,
	`is_global` integer DEFAULT false,
	`is_approved` integer DEFAULT false
);

-- 2. Safely copy your existing live reviews over to the new table
INSERT INTO `testimonials_new` (`id`, `name`, `location`, `rating`, `text`, `product`, `profile`, `date`, `purchased`, `is_global`, `is_approved`)
SELECT `id`, `name`, `location`, `rating`, `text`, `product`, `profile`, `date`, `purchased`, `is_global`, `is_approved` FROM `testimonials`;

-- 3. Drop the old table and rename the new one into place
DROP TABLE `testimonials`;
ALTER TABLE `testimonials_new` RENAME TO `testimonials`;

-- 4. Create the store_settings table if it hasn't been created yet
CREATE TABLE IF NOT EXISTS `store_settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`happy_customers_text` text DEFAULT '500+ Happy Customers' NOT NULL,
	`default_avatar` text DEFAULT '/pexels-wedding-maps-130174465-10114295.jpg' NOT NULL,
	`fallback_rating` text DEFAULT '4.8' NOT NULL
);

-- 5. Seed the default settings
INSERT OR IGNORE INTO `store_settings` (`id`, `happy_customers_text`, `default_avatar`, `fallback_rating`) 
VALUES (1, '500+ Happy Customers', '/pexels-wedding-maps-130174465-10114295.jpg', '4.8');

PRAGMA foreign_keys=ON;