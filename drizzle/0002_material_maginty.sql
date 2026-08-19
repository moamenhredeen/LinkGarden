PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_list` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_user_id` text NOT NULL,
	`route_profile_id` text,
	`route_username` text NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`slug` text NOT NULL,
	`visibility` text DEFAULT 'private' NOT NULL,
	`moderation_state` text DEFAULT 'active' NOT NULL,
	`published_at` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`owner_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`route_profile_id`) REFERENCES `profile`(`user_id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_list`("id", "owner_user_id", "route_profile_id", "route_username", "title", "description", "slug", "visibility", "moderation_state", "published_at", "created_at", "updated_at") SELECT "id", "owner_user_id", "route_profile_id", (SELECT "username" FROM "profile" WHERE "profile"."user_id" = "list"."route_profile_id"), "title", "description", "slug", "visibility", "moderation_state", "published_at", "created_at", "updated_at" FROM `list`;--> statement-breakpoint
DROP TABLE `list`;--> statement-breakpoint
ALTER TABLE `__new_list` RENAME TO `list`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `list_route_slug_uidx` ON `list` (`route_username`,`slug`);--> statement-breakpoint
CREATE INDEX `list_owner_idx` ON `list` (`owner_user_id`);--> statement-breakpoint
CREATE INDEX `list_public_feed_idx` ON `list` (`visibility`,`moderation_state`,`updated_at`);
--> statement-breakpoint
CREATE TRIGGER `list_slug_immutable`
BEFORE UPDATE OF `slug` ON `list`
WHEN NEW.`slug` <> OLD.`slug`
BEGIN SELECT RAISE(ABORT, 'list slug is immutable'); END;
--> statement-breakpoint
CREATE TRIGGER `list_route_username_immutable`
BEFORE UPDATE OF `route_username` ON `list`
WHEN NEW.`route_username` <> OLD.`route_username`
BEGIN SELECT RAISE(ABORT, 'list route is immutable'); END;
