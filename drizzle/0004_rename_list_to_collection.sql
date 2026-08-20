ALTER TABLE `list` RENAME TO `collection`;--> statement-breakpoint
ALTER TABLE `list_member` RENAME TO `collection_member`;--> statement-breakpoint
ALTER TABLE `list_invitation` RENAME TO `collection_invitation`;--> statement-breakpoint
ALTER TABLE `link` RENAME COLUMN `list_id` TO `collection_id`;--> statement-breakpoint
ALTER TABLE `collection_member` RENAME COLUMN `list_id` TO `collection_id`;--> statement-breakpoint
ALTER TABLE `collection_invitation` RENAME COLUMN `list_id` TO `collection_id`;--> statement-breakpoint
ALTER TABLE `search_document` RENAME COLUMN `list_id` TO `collection_id`;--> statement-breakpoint
ALTER TABLE `content_report` RENAME COLUMN `target_list_id` TO `target_collection_id`;--> statement-breakpoint
DROP INDEX `list_route_slug_uidx`;--> statement-breakpoint
CREATE UNIQUE INDEX `collection_route_slug_uidx` ON `collection` (`route_username`,`slug`);--> statement-breakpoint
DROP INDEX `list_owner_idx`;--> statement-breakpoint
CREATE INDEX `collection_owner_idx` ON `collection` (`owner_user_id`);--> statement-breakpoint
DROP INDEX `list_public_feed_idx`;--> statement-breakpoint
CREATE INDEX `collection_public_feed_idx` ON `collection` (`visibility`,`moderation_state`,`updated_at`);--> statement-breakpoint
DROP INDEX `link_list_url_uidx`;--> statement-breakpoint
CREATE UNIQUE INDEX `link_collection_url_uidx` ON `link` (`collection_id`,`normalized_url`) WHERE "link"."collection_id" is not null;--> statement-breakpoint
DROP INDEX `link_list_position_idx`;--> statement-breakpoint
CREATE INDEX `link_collection_position_idx` ON `link` (`collection_id`,`position`);--> statement-breakpoint
DROP INDEX `list_member_user_idx`;--> statement-breakpoint
CREATE INDEX `collection_member_user_idx` ON `collection_member` (`user_id`);--> statement-breakpoint
DROP INDEX `list_invitation_pending_user_uidx`;--> statement-breakpoint
CREATE UNIQUE INDEX `collection_invitation_pending_user_uidx` ON `collection_invitation` (`collection_id`,`recipient_user_id`) WHERE "collection_invitation"."status" = 'pending' and "collection_invitation"."recipient_user_id" is not null;--> statement-breakpoint
DROP INDEX `list_invitation_pending_email_uidx`;--> statement-breakpoint
CREATE UNIQUE INDEX `collection_invitation_pending_email_uidx` ON `collection_invitation` (`collection_id`,`recipient_email`) WHERE "collection_invitation"."status" = 'pending' and "collection_invitation"."recipient_email" is not null;--> statement-breakpoint
DROP INDEX `list_invitation_user_idx`;--> statement-breakpoint
CREATE INDEX `collection_invitation_user_idx` ON `collection_invitation` (`recipient_user_id`,`status`);--> statement-breakpoint
DROP INDEX `list_invitation_email_idx`;--> statement-breakpoint
CREATE INDEX `collection_invitation_email_idx` ON `collection_invitation` (`recipient_email`,`status`);--> statement-breakpoint
DROP INDEX `content_report_open_list_uidx`;--> statement-breakpoint
CREATE UNIQUE INDEX `content_report_open_collection_uidx` ON `content_report` (`reporter_user_id`,`target_collection_id`) WHERE "content_report"."status" = 'open' and "content_report"."target_collection_id" is not null;--> statement-breakpoint
DROP INDEX `search_document_list_idx`;--> statement-breakpoint
CREATE INDEX `search_document_collection_idx` ON `search_document` (`collection_id`);--> statement-breakpoint
DROP TRIGGER `list_slug_immutable`;--> statement-breakpoint
CREATE TRIGGER `collection_slug_immutable`
BEFORE UPDATE OF `slug` ON `collection`
WHEN NEW.`slug` <> OLD.`slug`
BEGIN SELECT RAISE(ABORT, 'collection slug is immutable'); END;--> statement-breakpoint
DROP TRIGGER `list_route_username_immutable`;--> statement-breakpoint
CREATE TRIGGER `collection_route_username_immutable`
BEFORE UPDATE OF `route_username` ON `collection`
WHEN NEW.`route_username` <> OLD.`route_username`
BEGIN SELECT RAISE(ABORT, 'collection route is immutable'); END;--> statement-breakpoint
UPDATE `search_document` SET `kind` = 'collection' WHERE `kind` = 'list';--> statement-breakpoint
UPDATE `search_document` SET `kind` = 'collection_link' WHERE `kind` = 'list_link';
