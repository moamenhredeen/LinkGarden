CREATE TABLE `collection` (
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
CREATE UNIQUE INDEX `collection_route_slug_uidx` ON `collection` (`route_username`,`slug`);--> statement-breakpoint
CREATE INDEX `collection_owner_idx` ON `collection` (`owner_user_id`);--> statement-breakpoint
CREATE INDEX `collection_public_feed_idx` ON `collection` (`visibility`,`moderation_state`,`updated_at`);--> statement-breakpoint
CREATE TABLE `collection_invitation` (
	`id` text PRIMARY KEY NOT NULL,
	`collection_id` text NOT NULL,
	`invited_by_user_id` text NOT NULL,
	`recipient_user_id` text,
	`recipient_email` text,
	`token_hash` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`expires_at` integer NOT NULL,
	`accepted_at` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`collection_id`) REFERENCES `collection`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`invited_by_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`recipient_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "collection_invitation_recipient_check" CHECK((("collection_invitation"."recipient_user_id" is not null) and ("collection_invitation"."recipient_email" is null)) or (("collection_invitation"."recipient_user_id" is null) and ("collection_invitation"."recipient_email" is not null)))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `collection_invitation_token_hash_unique` ON `collection_invitation` (`token_hash`);--> statement-breakpoint
CREATE UNIQUE INDEX `collection_invitation_pending_user_uidx` ON `collection_invitation` (`collection_id`,`recipient_user_id`) WHERE "collection_invitation"."status" = 'pending' and "collection_invitation"."recipient_user_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX `collection_invitation_pending_email_uidx` ON `collection_invitation` (`collection_id`,`recipient_email`) WHERE "collection_invitation"."status" = 'pending' and "collection_invitation"."recipient_email" is not null;--> statement-breakpoint
CREATE INDEX `collection_invitation_user_idx` ON `collection_invitation` (`recipient_user_id`,`status`);--> statement-breakpoint
CREATE INDEX `collection_invitation_email_idx` ON `collection_invitation` (`recipient_email`,`status`);--> statement-breakpoint
CREATE TABLE `collection_member` (
	`collection_id` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	PRIMARY KEY(`collection_id`, `user_id`),
	FOREIGN KEY (`collection_id`) REFERENCES `collection`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `collection_member_user_idx` ON `collection_member` (`user_id`);--> statement-breakpoint
CREATE TABLE `content_report` (
	`id` text PRIMARY KEY NOT NULL,
	`reporter_user_id` text,
	`target_link_id` text,
	`target_collection_id` text,
	`reason` text NOT NULL,
	`explanation` text,
	`status` text DEFAULT 'open' NOT NULL,
	`reviewer_user_id` text,
	`reviewed_at` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`reporter_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`target_link_id`) REFERENCES `link`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`target_collection_id`) REFERENCES `collection`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`reviewer_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "content_report_target_check" CHECK((("content_report"."target_link_id" is not null) and ("content_report"."target_collection_id" is null)) or (("content_report"."target_link_id" is null) and ("content_report"."target_collection_id" is not null)))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `content_report_open_link_uidx` ON `content_report` (`reporter_user_id`,`target_link_id`) WHERE "content_report"."status" = 'open' and "content_report"."target_link_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX `content_report_open_collection_uidx` ON `content_report` (`reporter_user_id`,`target_collection_id`) WHERE "content_report"."status" = 'open' and "content_report"."target_collection_id" is not null;--> statement-breakpoint
CREATE INDEX `content_report_status_idx` ON `content_report` (`status`,`created_at`);--> statement-breakpoint
CREATE TABLE `link` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_user_id` text,
	`collection_id` text,
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
	FOREIGN KEY (`collection_id`) REFERENCES `collection`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`added_by_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "link_context_check" CHECK((("link"."owner_user_id" is not null) and ("link"."collection_id" is null)) or (("link"."owner_user_id" is null) and ("link"."collection_id" is not null))),
	CONSTRAINT "link_context_fields_check" CHECK((("link"."owner_user_id" is not null) and ("link"."visibility" is not null) and ("link"."position" is null)) or (("link"."collection_id" is not null) and ("link"."visibility" is null) and ("link"."position" is not null)))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `link_personal_url_uidx` ON `link` (`owner_user_id`,`normalized_url`) WHERE "link"."owner_user_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX `link_collection_url_uidx` ON `link` (`collection_id`,`normalized_url`) WHERE "link"."collection_id" is not null;--> statement-breakpoint
CREATE INDEX `link_personal_feed_idx` ON `link` (`owner_user_id`,`visibility`,`moderation_state`,`published_at`);--> statement-breakpoint
CREATE INDEX `link_collection_position_idx` ON `link` (`collection_id`,`position`);--> statement-breakpoint
CREATE TABLE `link_tag` (
	`link_id` text NOT NULL,
	`tag_id` text NOT NULL,
	PRIMARY KEY(`link_id`, `tag_id`),
	FOREIGN KEY (`link_id`) REFERENCES `link`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tag`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `link_tag_tag_idx` ON `link_tag` (`tag_id`);--> statement-breakpoint
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
	`collection_id` text,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`url` text DEFAULT '' NOT NULL,
	`tags` text DEFAULT '' NOT NULL,
	`curators` text DEFAULT '' NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`collection_id`) REFERENCES `collection`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `search_document_kind_entity_uidx` ON `search_document` (`kind`,`entity_id`);--> statement-breakpoint
CREATE INDEX `search_document_collection_idx` ON `search_document` (`collection_id`);--> statement-breakpoint
CREATE TABLE `tag` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`normalized_name` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tag_normalized_name_uidx` ON `tag` (`normalized_name`);--> statement-breakpoint
CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`issuer` text NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `account_issuer_accountId_uidx` ON `account` (`issuer`,`account_id`);--> statement-breakpoint
CREATE INDEX `account_userId_idx` ON `account` (`user_id`);--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE INDEX `session_userId_idx` ON `session` (`user_id`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `verification_identifier_idx` ON `verification` (`identifier`);--> statement-breakpoint
CREATE TRIGGER `profile_username_immutable`
BEFORE UPDATE OF `username` ON `profile`
WHEN NEW.`username` <> OLD.`username`
BEGIN
	SELECT RAISE(ABORT, 'username is immutable');
END;--> statement-breakpoint
CREATE TRIGGER `collection_slug_immutable`
BEFORE UPDATE OF `slug` ON `collection`
WHEN NEW.`slug` <> OLD.`slug`
BEGIN
	SELECT RAISE(ABORT, 'collection slug is immutable');
END;--> statement-breakpoint
CREATE TRIGGER `collection_route_username_immutable`
BEFORE UPDATE OF `route_username` ON `collection`
WHEN NEW.`route_username` <> OLD.`route_username`
BEGIN
	SELECT RAISE(ABORT, 'collection route is immutable');
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