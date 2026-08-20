import { and, desc, eq, isNotNull } from 'drizzle-orm';
import { getDb } from '$lib/server/db';
import { collection, link, profile } from '$lib/server/db/schema';
import { toFtsQuery } from '$lib/server/search';
import type { PageServerLoad } from './$types';

type SearchRow = { kind: 'personal_link' | 'collection' | 'collection_link'; entity_id: string; collection_id: string | null; title: string; description: string; url: string; curators: string; rank: number; route_username: string | null; slug: string | null };

export const load: PageServerLoad = async (event) => {
	const q = event.url.searchParams.get('q')?.trim().slice(0, 200) ?? '';
	if (q) {
		const query = toFtsQuery(q);
		if (!query) return { q, results: [] as SearchRow[], recentLinks: [], recentCollections: [] };
		const result = await event.platform!.env.DB.prepare(`SELECT d.kind, d.entity_id, d.collection_id, d.title, d.description, d.url, d.curators, bm25(search_document_fts) AS rank, c.route_username, c.slug FROM search_document_fts JOIN search_document d ON d.id = search_document_fts.rowid LEFT JOIN collection c ON c.id = d.collection_id WHERE search_document_fts MATCH ? ORDER BY rank, d.updated_at DESC, d.id DESC LIMIT 50`).bind(query).all<SearchRow>();
		return { q, results: result.results, recentLinks: [], recentCollections: [] };
	}

	const db = getDb(event.platform!.env.DB);
	const recentLinks = await db.select({ id: link.id, title: link.title, description: link.description, url: link.normalizedUrl, username: profile.username, publishedAt: link.publishedAt }).from(link).innerJoin(profile, eq(profile.userId, link.ownerUserId)).where(and(eq(link.visibility, 'public'), eq(link.moderationState, 'active'), isNotNull(link.ownerUserId))).orderBy(desc(link.publishedAt)).limit(12);
	const recentCollections = await db.select({ id: collection.id, title: collection.title, description: collection.description, slug: collection.slug, username: collection.routeUsername, updatedAt: collection.updatedAt }).from(collection).where(and(eq(collection.visibility, 'public'), eq(collection.moderationState, 'active'))).orderBy(desc(collection.updatedAt)).limit(8);
	return { q, results: [] as SearchRow[], recentLinks, recentCollections };
};
