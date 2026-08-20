import { and, eq, inArray } from 'drizzle-orm';
import type { getDb } from '$lib/server/db';
import { collection, collectionMember, link, linkTag, profile, searchDocument, tag } from '$lib/server/db/schema';

type Db = ReturnType<typeof getDb>;

async function tagNames(db: Db, linkIds: string[]) {
	if (!linkIds.length) return [];
	return db.select({ linkId: linkTag.linkId, name: tag.name }).from(linkTag).innerJoin(tag, eq(tag.id, linkTag.tagId)).where(inArray(linkTag.linkId, linkIds));
}

export async function syncPersonalSearch(db: Db, linkId: string): Promise<void> {
	await db.delete(searchDocument).where(and(eq(searchDocument.kind, 'personal_link'), eq(searchDocument.entityId, linkId)));
	const rows = await db.select({ item: link, username: profile.username, displayName: profile.displayName }).from(link).innerJoin(profile, eq(profile.userId, link.ownerUserId)).where(and(eq(link.id, linkId), eq(link.visibility, 'public'), eq(link.moderationState, 'active'))).limit(1);
	if (!rows[0]) return;
	const tags = await tagNames(db, [linkId]); const { item } = rows[0];
	await db.insert(searchDocument).values({ kind: 'personal_link', entityId: item.id, title: item.title, description: item.description, url: item.normalizedUrl, tags: tags.map((entry) => entry.name).join(' '), curators: `${rows[0].username} ${rows[0].displayName}` });
}

export async function syncCollectionSearch(db: Db, collectionId: string): Promise<void> {
	await db.delete(searchDocument).where(eq(searchDocument.collectionId, collectionId));
	const rows = await db.select({ collection, username: profile.username, displayName: profile.displayName }).from(collection).innerJoin(profile, eq(profile.userId, collection.ownerUserId)).where(and(eq(collection.id, collectionId), eq(collection.visibility, 'public'), eq(collection.moderationState, 'active'))).limit(1);
	if (!rows[0]) return;
	const links = await db.select().from(link).where(and(eq(link.collectionId, collectionId), eq(link.moderationState, 'active')));
	const tags = await tagNames(db, links.map((item) => item.id));
	const editors = await db.select({ username: profile.username, displayName: profile.displayName }).from(collectionMember).innerJoin(profile, eq(profile.userId, collectionMember.userId)).where(eq(collectionMember.collectionId, collectionId));
	const curators = [rows[0].username, rows[0].displayName, ...editors.flatMap((entry) => [entry.username, entry.displayName])].join(' ');
	await db.insert(searchDocument).values({ kind: 'collection', entityId: collectionId, collectionId, title: rows[0].collection.title, description: `${rows[0].collection.description} ${links.flatMap((item) => [item.title, item.description]).join(' ')}`, tags: tags.map((entry) => entry.name).join(' '), curators });
	if (links.length) await db.insert(searchDocument).values(links.map((item) => ({ kind: 'collection_link' as const, entityId: item.id, collectionId, title: item.title, description: item.description, url: item.normalizedUrl, tags: tags.filter((entry) => entry.linkId === item.id).map((entry) => entry.name).join(' '), curators })));
}

export function toFtsQuery(value: string): string {
	return value.normalize('NFKC').match(/[\p{L}\p{N}_-]+/gu)?.slice(0, 8).map((token) => `"${token.replaceAll('"', '""')}"*`).join(' AND ') ?? '';
}
