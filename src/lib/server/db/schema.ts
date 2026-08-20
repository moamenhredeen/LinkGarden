import { relations, sql } from 'drizzle-orm';
import {
	check,
	index,
	integer,
	primaryKey,
	sqliteTable,
	text,
	uniqueIndex
} from 'drizzle-orm/sqlite-core';

import { user } from './auth.schema';

const id = (name = 'id') => text(name).primaryKey().$defaultFn(() => crypto.randomUUID());
const createdAt = () => integer('created_at', { mode: 'timestamp_ms' }).notNull().default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`);
const updatedAt = () => integer('updated_at', { mode: 'timestamp_ms' }).notNull().default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`).$onUpdate(() => new Date());

export const profile = sqliteTable('profile', {
	userId: text('user_id').primaryKey().references(() => user.id, { onDelete: 'cascade' }),
	username: text('username').notNull(),
	displayName: text('display_name').notNull(),
	bio: text('bio'),
	avatarUrl: text('avatar_url'),
	joinedAt: createdAt(),
	updatedAt: updatedAt()
}, (table) => [uniqueIndex('profile_username_uidx').on(sql`lower(${table.username})`)]);

export const collection = sqliteTable('collection', {
	id: id(),
	ownerUserId: text('owner_user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
	routeProfileId: text('route_profile_id').references(() => profile.userId, { onDelete: 'set null' }),
	routeUsername: text('route_username').notNull(),
	title: text('title').notNull(),
	description: text('description').notNull().default(''),
	slug: text('slug').notNull(),
	visibility: text('visibility', { enum: ['private', 'public'] }).notNull().default('private'),
	moderationState: text('moderation_state', { enum: ['active', 'hidden'] }).notNull().default('active'),
	publishedAt: integer('published_at', { mode: 'timestamp_ms' }),
	createdAt: createdAt(),
	updatedAt: updatedAt()
}, (table) => [
	uniqueIndex('collection_route_slug_uidx').on(table.routeUsername, table.slug),
	index('collection_owner_idx').on(table.ownerUserId),
	index('collection_public_feed_idx').on(table.visibility, table.moderationState, table.updatedAt)
]);

export const link = sqliteTable('link', {
	id: id(),
	ownerUserId: text('owner_user_id').references(() => user.id, { onDelete: 'cascade' }),
	collectionId: text('collection_id').references(() => collection.id, { onDelete: 'cascade' }),
	addedByUserId: text('added_by_user_id').references(() => user.id, { onDelete: 'set null' }),
	submittedUrl: text('submitted_url').notNull(),
	normalizedUrl: text('normalized_url').notNull(),
	title: text('title').notNull(),
	description: text('description').notNull().default(''),
	visibility: text('visibility', { enum: ['private', 'public'] }),
	position: integer('position'),
	moderationState: text('moderation_state', { enum: ['active', 'hidden'] }).notNull().default('active'),
	metadataStatus: text('metadata_status', { enum: ['pending', 'ready', 'failed'] }).notNull().default('pending'),
	metadataGeneration: integer('metadata_generation').notNull().default(1),
	metadataRequestedAt: integer('metadata_requested_at', { mode: 'timestamp_ms' }),
	metadataAttemptedAt: integer('metadata_attempted_at', { mode: 'timestamp_ms' }),
	metadataRetryAt: integer('metadata_retry_at', { mode: 'timestamp_ms' }),
	titleManuallyEdited: integer('title_manually_edited', { mode: 'boolean' }).notNull().default(false),
	descriptionManuallyEdited: integer('description_manually_edited', { mode: 'boolean' }).notNull().default(false),
	publishedAt: integer('published_at', { mode: 'timestamp_ms' }),
	createdAt: createdAt(),
	updatedAt: updatedAt()
}, (table) => [
	check('link_context_check', sql`((${table.ownerUserId} is not null) and (${table.collectionId} is null)) or ((${table.ownerUserId} is null) and (${table.collectionId} is not null))`),
	check('link_context_fields_check', sql`((${table.ownerUserId} is not null) and (${table.visibility} is not null) and (${table.position} is null)) or ((${table.collectionId} is not null) and (${table.visibility} is null) and (${table.position} is not null))`),
	uniqueIndex('link_personal_url_uidx').on(table.ownerUserId, table.normalizedUrl).where(sql`${table.ownerUserId} is not null`),
	uniqueIndex('link_collection_url_uidx').on(table.collectionId, table.normalizedUrl).where(sql`${table.collectionId} is not null`),
	index('link_personal_feed_idx').on(table.ownerUserId, table.visibility, table.moderationState, table.publishedAt),
	index('link_collection_position_idx').on(table.collectionId, table.position)
]);

export const tag = sqliteTable('tag', {
	id: id(),
	name: text('name').notNull(),
	normalizedName: text('normalized_name').notNull(),
	createdAt: createdAt()
}, (table) => [uniqueIndex('tag_normalized_name_uidx').on(table.normalizedName)]);

export const linkTag = sqliteTable('link_tag', {
	linkId: text('link_id').notNull().references(() => link.id, { onDelete: 'cascade' }),
	tagId: text('tag_id').notNull().references(() => tag.id, { onDelete: 'cascade' })
}, (table) => [primaryKey({ columns: [table.linkId, table.tagId] }), index('link_tag_tag_idx').on(table.tagId)]);

export const collectionMember = sqliteTable('collection_member', {
	collectionId: text('collection_id').notNull().references(() => collection.id, { onDelete: 'cascade' }),
	userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
	joinedAt: createdAt()
}, (table) => [primaryKey({ columns: [table.collectionId, table.userId] }), index('collection_member_user_idx').on(table.userId)]);

export const collectionInvitation = sqliteTable('collection_invitation', {
	id: id(),
	collectionId: text('collection_id').notNull().references(() => collection.id, { onDelete: 'cascade' }),
	invitedByUserId: text('invited_by_user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
	recipientUserId: text('recipient_user_id').references(() => user.id, { onDelete: 'cascade' }),
	recipientEmail: text('recipient_email'),
	tokenHash: text('token_hash').notNull().unique(),
	status: text('status', { enum: ['pending', 'accepted', 'expired', 'revoked'] }).notNull().default('pending'),
	expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
	acceptedAt: integer('accepted_at', { mode: 'timestamp_ms' }),
	createdAt: createdAt(),
	updatedAt: updatedAt()
}, (table) => [
	check('collection_invitation_recipient_check', sql`((${table.recipientUserId} is not null) and (${table.recipientEmail} is null)) or ((${table.recipientUserId} is null) and (${table.recipientEmail} is not null))`),
	uniqueIndex('collection_invitation_pending_user_uidx').on(table.collectionId, table.recipientUserId).where(sql`${table.status} = 'pending' and ${table.recipientUserId} is not null`),
	uniqueIndex('collection_invitation_pending_email_uidx').on(table.collectionId, table.recipientEmail).where(sql`${table.status} = 'pending' and ${table.recipientEmail} is not null`),
	index('collection_invitation_user_idx').on(table.recipientUserId, table.status),
	index('collection_invitation_email_idx').on(table.recipientEmail, table.status)
]);

export const platformAdmin = sqliteTable('platform_admin', {
	userId: text('user_id').primaryKey().references(() => user.id, { onDelete: 'cascade' }),
	createdAt: createdAt()
});

export const contentReport = sqliteTable('content_report', {
	id: id(),
	reporterUserId: text('reporter_user_id').references(() => user.id, { onDelete: 'set null' }),
	targetLinkId: text('target_link_id').references(() => link.id, { onDelete: 'cascade' }),
	targetCollectionId: text('target_collection_id').references(() => collection.id, { onDelete: 'cascade' }),
	reason: text('reason', { enum: ['spam', 'malware', 'harassment', 'illegal', 'misleading', 'other'] }).notNull(),
	explanation: text('explanation'),
	status: text('status', { enum: ['open', 'dismissed', 'actioned'] }).notNull().default('open'),
	reviewerUserId: text('reviewer_user_id').references(() => user.id, { onDelete: 'set null' }),
	reviewedAt: integer('reviewed_at', { mode: 'timestamp_ms' }),
	createdAt: createdAt(),
	updatedAt: updatedAt()
}, (table) => [
	check('content_report_target_check', sql`((${table.targetLinkId} is not null) and (${table.targetCollectionId} is null)) or ((${table.targetLinkId} is null) and (${table.targetCollectionId} is not null))`),
	uniqueIndex('content_report_open_link_uidx').on(table.reporterUserId, table.targetLinkId).where(sql`${table.status} = 'open' and ${table.targetLinkId} is not null`),
	uniqueIndex('content_report_open_collection_uidx').on(table.reporterUserId, table.targetCollectionId).where(sql`${table.status} = 'open' and ${table.targetCollectionId} is not null`),
	index('content_report_status_idx').on(table.status, table.createdAt)
]);

export const searchDocument = sqliteTable('search_document', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	kind: text('kind', { enum: ['personal_link', 'collection', 'collection_link'] }).notNull(),
	entityId: text('entity_id').notNull(),
	collectionId: text('collection_id').references(() => collection.id, { onDelete: 'cascade' }),
	title: text('title').notNull(),
	description: text('description').notNull().default(''),
	url: text('url').notNull().default(''),
	tags: text('tags').notNull().default(''),
	curators: text('curators').notNull().default(''),
	updatedAt: updatedAt()
}, (table) => [
	uniqueIndex('search_document_kind_entity_uidx').on(table.kind, table.entityId),
	index('search_document_collection_idx').on(table.collectionId)
]);

export const profileRelations = relations(profile, ({ one, many }) => ({
	user: one(user, { fields: [profile.userId], references: [user.id] }),
	ownedCollections: many(collection)
}));
export const collectionRelations = relations(collection, ({ one, many }) => ({
	owner: one(user, { fields: [collection.ownerUserId], references: [user.id] }),
	routeProfile: one(profile, { fields: [collection.routeProfileId], references: [profile.userId] }),
	links: many(link),
	members: many(collectionMember),
	invitations: many(collectionInvitation)
}));
export const linkRelations = relations(link, ({ one, many }) => ({
	owner: one(user, { fields: [link.ownerUserId], references: [user.id] }),
	collection: one(collection, { fields: [link.collectionId], references: [collection.id] }),
	addedBy: one(user, { fields: [link.addedByUserId], references: [user.id] }),
	tags: many(linkTag)
}));
export const tagRelations = relations(tag, ({ many }) => ({ links: many(linkTag) }));
export const linkTagRelations = relations(linkTag, ({ one }) => ({
	link: one(link, { fields: [linkTag.linkId], references: [link.id] }),
	tag: one(tag, { fields: [linkTag.tagId], references: [tag.id] })
}));

export * from './auth.schema';
