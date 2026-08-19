CREATE TABLE `content_report` (
	`id` text PRIMARY KEY NOT NULL,
	`reporter_user_id` text,
	`target_link_id` text,
	`target_list_id` text,
	`reason` text NOT NULL,
	`explanation` text,
	`status` text DEFAULT 'open' NOT NULL,
	`reviewer_user_id` text,
	`reviewed_at` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`reporter_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`target_link_id`) REFERENCES `link`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`target_list_id`) REFERENCES `list`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`reviewer_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "content_report_target_check" CHECK((("content_report"."target_link_id" is not null) and ("content_report"."target_list_id" is null)) or (("content_report"."target_link_id" is null) and ("content_report"."target_list_id" is not null)))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `content_report_open_link_uidx` ON `content_report` (`reporter_user_id`,`target_link_id`) WHERE "content_report"."status" = 'open' and "content_report"."target_link_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX `content_report_open_list_uidx` ON `content_report` (`reporter_user_id`,`target_list_id`) WHERE "content_report"."status" = 'open' and "content_report"."target_list_id" is not null;--> statement-breakpoint
CREATE INDEX `content_report_status_idx` ON `content_report` (`status`,`created_at`);--> statement-breakpoint
CREATE TABLE `link` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_user_id` text,
	`list_id` text,
	`added_by_user_id` text,
	`submitted_url` text NOT NULL,
	`normalized_url` text NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`visibility` text,
	`position` integer,
	`moderation_state` text DEFAULT 'active' NOT NULL,
	`metadata_status` text DEFAULT 'pending' NOT NULL,
	`metadata_generation` integer DEFAULT 1 NOT NULL,
	`metadata_requested_at` integer,
	`metadata_attempted_at` integer,
	`metadata_retry_at` integer,
	`title_manually_edited` integer DEFAULT false NOT NULL,
	`description_manually_edited` integer DEFAULT false NOT NULL,
	`published_at` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`owner_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`list_id`) REFERENCES `list`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`added_by_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "link_context_check" CHECK((("link"."owner_user_id" is not null) and ("link"."list_id" is null)) or (("link"."owner_user_id" is null) and ("link"."list_id" is not null))),
	CONSTRAINT "link_context_fields_check" CHECK((("link"."owner_user_id" is not null) and ("link"."visibility" is not null) and ("link"."position" is null)) or (("link"."list_id" is not null) and ("link"."visibility" is null) and ("link"."position" is not null)))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `link_personal_url_uidx` ON `link` (`owner_user_id`,`normalized_url`) WHERE "link"."owner_user_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX `link_list_url_uidx` ON `link` (`list_id`,`normalized_url`) WHERE "link"."list_id" is not null;--> statement-breakpoint
CREATE INDEX `link_personal_feed_idx` ON `link` (`owner_user_id`,`visibility`,`moderation_state`,`published_at`);--> statement-breakpoint
CREATE INDEX `link_list_position_idx` ON `link` (`list_id`,`position`);--> statement-breakpoint
CREATE TABLE `link_tag` (
	`link_id` text NOT NULL,
	`tag_id` text NOT NULL,
	PRIMARY KEY(`link_id`, `tag_id`),
	FOREIGN KEY (`link_id`) REFERENCES `link`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tag`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `link_tag_tag_idx` ON `link_tag` (`tag_id`);--> statement-breakpoint
CREATE TABLE `list` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_user_id` text NOT NULL,
	`route_profile_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`slug` text NOT NULL,
	`visibility` text DEFAULT 'private' NOT NULL,
	`moderation_state` text DEFAULT 'active' NOT NULL,
	`published_at` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`owner_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`route_profile_id`) REFERENCES `profile`(`user_id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `list_route_slug_uidx` ON `list` (`route_profile_id`,lower("slug"));--> statement-breakpoint
CREATE INDEX `list_owner_idx` ON `list` (`owner_user_id`);--> statement-breakpoint
CREATE INDEX `list_public_feed_idx` ON `list` (`visibility`,`moderation_state`,`updated_at`);--> statement-breakpoint
CREATE TABLE `list_invitation` (
	`id` text PRIMARY KEY NOT NULL,
	`list_id` text NOT NULL,
	`invited_by_user_id` text NOT NULL,
	`recipient_user_id` text,
	`recipient_email` text,
	`token_hash` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`expires_at` integer NOT NULL,
	`accepted_at` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`list_id`) REFERENCES `list`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`invited_by_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`recipient_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "list_invitation_recipient_check" CHECK((("list_invitation"."recipient_user_id" is not null) and ("list_invitation"."recipient_email" is null)) or (("list_invitation"."recipient_user_id" is null) and ("list_invitation"."recipient_email" is not null)))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `list_invitation_token_hash_unique` ON `list_invitation` (`token_hash`);--> statement-breakpoint
CREATE UNIQUE INDEX `list_invitation_pending_user_uidx` ON `list_invitation` (`list_id`,`recipient_user_id`) WHERE "list_invitation"."status" = 'pending' and "list_invitation"."recipient_user_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX `list_invitation_pending_email_uidx` ON `list_invitation` (`list_id`,`recipient_email`) WHERE "list_invitation"."status" = 'pending' and "list_invitation"."recipient_email" is not null;--> statement-breakpoint
CREATE INDEX `list_invitation_user_idx` ON `list_invitation` (`recipient_user_id`,`status`);--> statement-breakpoint
CREATE INDEX `list_invitation_email_idx` ON `list_invitation` (`recipient_email`,`status`);--> statement-breakpoint
CREATE TABLE `list_member` (
	`list_id` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	PRIMARY KEY(`list_id`, `user_id`),
	FOREIGN KEY (`list_id`) REFERENCES `list`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `list_member_user_idx` ON `list_member` (`user_id`);--> statement-breakpoint
CREATE TABLE `platform_admin` (
	`user_id` text PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `profile` (
	`user_id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`display_name` text NOT NULL,
	`bio` text,
	`avatar_url` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `profile_username_uidx` ON `profile` (lower("username"));--> statement-breakpoint
CREATE TABLE `search_document` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`kind` text NOT NULL,
	`entity_id` text NOT NULL,
	`list_id` text,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`url` text DEFAULT '' NOT NULL,
	`tags` text DEFAULT '' NOT NULL,
	`curators` text DEFAULT '' NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`list_id`) REFERENCES `list`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `search_document_kind_entity_uidx` ON `search_document` (`kind`,`entity_id`);--> statement-breakpoint
CREATE INDEX `search_document_list_idx` ON `search_document` (`list_id`);--> statement-breakpoint
CREATE TABLE `tag` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`normalized_name` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tag_normalized_name_uidx` ON `tag` (`normalized_name`);--> statement-breakpoint
DROP TABLE `task`;--> statement-breakpoint
CREATE TRIGGER `profile_username_immutable`
BEFORE UPDATE OF `username` ON `profile`
WHEN NEW.`username` <> OLD.`username`
BEGIN
	SELECT RAISE(ABORT, 'username is immutable');
END;--> statement-breakpoint
CREATE TRIGGER `list_slug_immutable`
BEFORE UPDATE OF `slug` ON `list`
WHEN NEW.`slug` <> OLD.`slug`
BEGIN
	SELECT RAISE(ABORT, 'list slug is immutable');
END;--> statement-breakpoint
CREATE TRIGGER `list_route_profile_immutable`
BEFORE UPDATE OF `route_profile_id` ON `list`
WHEN NEW.`route_profile_id` <> OLD.`route_profile_id`
BEGIN
	SELECT RAISE(ABORT, 'list route is immutable');
END;--> statement-breakpoint
CREATE VIRTUAL TABLE `search_document_fts` USING fts5(
	`title`, `description`, `url`, `tags`, `curators`,
	content='search_document', content_rowid='id', tokenize='unicode61'
);--> statement-breakpoint
CREATE TRIGGER `search_document_ai` AFTER INSERT ON `search_document` BEGIN
	INSERT INTO `search_document_fts`(rowid, title, description, url, tags, curators)
	VALUES (new.id, new.title, new.description, new.url, new.tags, new.curators);
END;--> statement-breakpoint
CREATE TRIGGER `search_document_ad` AFTER DELETE ON `search_document` BEGIN
	INSERT INTO `search_document_fts`(`search_document_fts`, rowid, title, description, url, tags, curators)
	VALUES ('delete', old.id, old.title, old.description, old.url, old.tags, old.curators);
END;--> statement-breakpoint
CREATE TRIGGER `search_document_au` AFTER UPDATE ON `search_document` BEGIN
	INSERT INTO `search_document_fts`(`search_document_fts`, rowid, title, description, url, tags, curators)
	VALUES ('delete', old.id, old.title, old.description, old.url, old.tags, old.curators);
	INSERT INTO `search_document_fts`(rowid, title, description, url, tags, curators)
	VALUES (new.id, new.title, new.description, new.url, new.tags, new.curators);
END;
