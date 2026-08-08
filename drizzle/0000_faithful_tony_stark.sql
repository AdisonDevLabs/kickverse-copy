CREATE TABLE `categories` (
	`slug` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`label` text,
	`image` text NOT NULL,
	`span` text
);
--> statement-breakpoint
CREATE TABLE `color_map` (
	`color_name` text PRIMARY KEY NOT NULL,
	`hex_code` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `media_assets` (
	`id` text PRIMARY KEY NOT NULL,
	`url` text NOT NULL,
	`file_name` text NOT NULL,
	`is_assigned` integer DEFAULT false
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`price` integer NOT NULL,
	`originalPrice` integer,
	`image` text NOT NULL,
	`images` text NOT NULL,
	`product_type` text DEFAULT 'Sneakers' NOT NULL,
	`category` text NOT NULL,
	`rating` real DEFAULT 5,
	`reviews` integer DEFAULT 0,
	`sizes` text NOT NULL,
	`colors` text NOT NULL,
	`isNewArrival` integer DEFAULT false,
	`isBestSeller` integer DEFAULT false,
	`isFlashDeal` integer DEFAULT false,
	`is_pinned` integer DEFAULT false,
	`is_accessory` integer DEFAULT false,
	`description` text NOT NULL,
	`created_at` text
);
--> statement-breakpoint
CREATE TABLE `size_guides` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`headers` text NOT NULL,
	`rows` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `store_settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`happy_customers_text` text DEFAULT '500+ Happy Customers' NOT NULL,
	`default_avatar` text DEFAULT '/pexels-wedding-maps-130174465-10114295.jpg' NOT NULL,
	`fallback_rating` text DEFAULT '4.8' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `testimonials` (
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
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`reset_token` text,
	`reset_token_expiry` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);