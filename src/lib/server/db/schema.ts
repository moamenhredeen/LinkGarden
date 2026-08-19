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

export const list = sqliteTable('list', {
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
	uniqueIndex('list_route_slug_uidx').on(table.routeUsername, table.slug),
	index('list_owner_idx').on(table.ownerUserId),
	index('list_public_feed_idx').on(table.visibility, table.moderationState, table.updatedAt)
]);

export const link = sqliteTable('link', {
	id: id(),
	ownerUserId: text('owner_user_id').references(() => user.id, { onDelete: 'cascade' }),
	listId: text('list_id').references(() => list.id, { onDelete: 'cascade' }),
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
	check('link_context_check', sql`((${table.ownerUserId} is not null) and (${table.listId} is null)) or ((${table.ownerUserId} is null) and (${table.listId} is not null))`),
	check('link_context_fields_check', sql`((${table.ownerUserId} is not null) and (${table.visibility} is not null) and (${table.position} is null)) or ((${table.listId} is not null) and (${table.visibility} is null) and (${table.position} is not null))`),
	uniqueIndex('link_personal_url_uidx').on(table.ownerUserId, table.normalizedUrl).where(sql`${table.ownerUserId} is not null`),
	uniqueIndex('link_list_url_uidx').on(table.listId, table.normalizedUrl).where(sql`${table.listId} is not null`),
	index('link_personal_feed_idx').on(table.ownerUserId, table.visibility, table.moderationState, table.publishedAt),
	index('link_list_position_idx').on(table.listId, table.position)
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

export const listMember = sqliteTable('list_member', {
	listId: text('list_id').notNull().references(() => list.id, { onDelete: 'cascade' }),
	userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
	joinedAt: createdAt()
}, (table) => [primaryKey({ columns: [table.listId, table.userId] }), index('list_member_user_idx').on(table.userId)]);

export const listInvitation = sqliteTable('list_invitation', {
	id: id(),
	listId: text('list_id').notNull().references(() => list.id, { onDelete: 'cascade' }),
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
	check('list_invitation_recipient_check', sql`((${table.recipientUserId} is not null) and (${table.recipientEmail} is null)) or ((${table.recipientUserId} is null) and (${table.recipientEmail} is not null))`),
	uniqueIndex('list_invitation_pending_user_uidx').on(table.listId, table.recipientUserId).where(sql`${table.status} = 'pending' and ${table.recipientUserId} is not null`),
	uniqueIndex('list_invitation_pending_email_uidx').on(table.listId, table.recipientEmail).where(sql`${table.status} = 'pending' and ${table.recipientEmail} is not null`),
	index('list_invitation_user_idx').on(table.recipientUserId, table.status),
	index('list_invitation_email_idx').on(table.recipientEmail, table.status)
]);

export const platformAdmin = sqliteTable('platform_admin', {
	userId: text('user_id').primaryKey().references(() => user.id, { onDelete: 'cascade' }),
	createdAt: createdAt()
});

export const contentReport = sqliteTable('content_report', {
	id: id(),
	reporterUserId: text('reporter_user_id').references(() => user.id, { onDelete: 'set null' }),
	targetLinkId: text('target_link_id').references(() => link.id, { onDelete: 'cascade' }),
	targetListId: text('target_list_id').references(() => list.id, { onDelete: 'cascade' }),
	reason: text('reason', { enum: ['spam', 'malware', 'harassment', 'illegal', 'misleading', 'other'] }).notNull(),
	explanation: text('explanation'),
	status: text('status', { enum: ['open', 'dismissed', 'actioned'] }).notNull().default('open'),
	reviewerUserId: text('reviewer_user_id').references(() => user.id, { onDelete: 'set null' }),
	reviewedAt: integer('reviewed_at', { mode: 'timestamp_ms' }),
	createdAt: createdAt(),
	updatedAt: updatedAt()
}, (table) => [
	check('content_report_target_check', sql`((${table.targetLinkId} is not null) and (${table.targetListId} is null)) or ((${table.targetLinkId} is null) and (${table.targetListId} is not null))`),
	uniqueIndex('content_report_open_link_uidx').on(table.reporterUserId, table.targetLinkId).where(sql`${table.status} = 'open' and ${table.targetLinkId} is not null`),
	uniqueIndex('content_report_open_list_uidx').on(table.reporterUserId, table.targetListId).where(sql`${table.status} = 'open' and ${table.targetListId} is not null`),
	index('content_report_status_idx').on(table.status, table.createdAt)
]);

export const searchDocument = sqliteTable('search_document', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	kind: text('kind', { enum: ['personal_link', 'list', 'list_link'] }).notNull(),
	entityId: text('entity_id').notNull(),
	listId: text('list_id').references(() => list.id, { onDelete: 'cascade' }),
	title: text('title').notNull(),
	description: text('description').notNull().default(''),
	url: text('url').notNull().default(''),
	tags: text('tags').notNull().default(''),
	curators: text('curators').notNull().default(''),
	updatedAt: updatedAt()
}, (table) => [
	uniqueIndex('search_document_kind_entity_uidx').on(table.kind, table.entityId),
	index('search_document_list_idx').on(table.listId)
]);

export const profileRelations = relations(profile, ({ one, many }) => ({
	user: one(user, { fields: [profile.userId], references: [user.id] }),
	ownedLists: many(list)
}));
export const listRelations = relations(list, ({ one, many }) => ({
	owner: one(user, { fields: [list.ownerUserId], references: [user.id] }),
	routeProfile: one(profile, { fields: [list.routeProfileId], references: [profile.userId] }),
	links: many(link),
	members: many(listMember),
	invitations: many(listInvitation)
}));
export const linkRelations = relations(link, ({ one, many }) => ({
	owner: one(user, { fields: [link.ownerUserId], references: [user.id] }),
	list: one(list, { fields: [link.listId], references: [list.id] }),
	addedBy: one(user, { fields: [link.addedByUserId], references: [user.id] }),
	tags: many(linkTag)
}));
export const tagRelations = relations(tag, ({ many }) => ({ links: many(linkTag) }));
export const linkTagRelations = relations(linkTag, ({ one }) => ({
	link: one(link, { fields: [linkTag.linkId], references: [link.id] }),
	tag: one(tag, { fields: [linkTag.tagId], references: [tag.id] })
}));

export * from './auth.schema';
