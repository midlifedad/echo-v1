CREATE TABLE `layout_tiles` (
	`layout_id` text NOT NULL,
	`tile_id` text NOT NULL,
	`breakpoint` text NOT NULL,
	`position` text NOT NULL,
	`is_visible` integer DEFAULT true,
	`inheritance_mode` text DEFAULT 'inherit',
	PRIMARY KEY(`layout_id`, `tile_id`, `breakpoint`),
	FOREIGN KEY (`layout_id`) REFERENCES `layouts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tile_id`) REFERENCES `tiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `layouts` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`is_default` integer DEFAULT false,
	`is_shared` integer DEFAULT false,
	`owner_id` text,
	`tags` text,
	`metadata` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `pages` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`layout_id` text NOT NULL,
	`filters` text,
	`refresh_interval` integer,
	`access` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`layout_id`) REFERENCES `layouts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pages_slug_unique` ON `pages` (`slug`);--> statement-breakpoint
CREATE TABLE `tiles` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`name` text,
	`description` text,
	`category` text,
	`tags` text,
	`is_template` integer DEFAULT false,
	`thumbnail` text,
	`owner_id` text,
	`is_public` integer DEFAULT false,
	`usage_count` integer DEFAULT 0,
	`config` text NOT NULL,
	`data` text,
	`data_source` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `user_tile_favorites` (
	`user_id` text NOT NULL,
	`tile_id` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY(`user_id`, `tile_id`),
	FOREIGN KEY (`tile_id`) REFERENCES `tiles`(`id`) ON UPDATE no action ON DELETE cascade
);
