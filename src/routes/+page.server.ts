import { and, desc, eq, isNotNull } from 'drizzle-orm';
import { getDb } from '$lib/server/db';
import { link, list, profile } from '$lib/server/db/schema';
import { toFtsQuery } from '$lib/server/search';
import type { PageServerLoad } from './$types';

type SearchRow = { kind: 'personal_link' | 'list' | 'list_link'; entity_id: string; list_id: string | null; title: string; description: string; url: string; curators: string; rank: number; route_username: string | null; slug: string | null };

export const load: PageServerLoad = async (event) => {
	const q = event.url.searchParams.get('q')?.trim().slice(0, 200) ?? '';
	if (q) {
		const query = toFtsQuery(q);
		if (!query) return { q, results: [] as SearchRow[], recentLinks: [], recentLists: [] };
		const result = await event.platform!.env.DB.prepare(`SELECT d.kind, d.entity_id, d.list_id, d.title, d.description, d.url, d.curators, bm25(search_document_fts) AS rank, l.route_username, l.slug FROM search_document_fts JOIN search_document d ON d.id = search_document_fts.rowid LEFT JOIN list l ON l.id = d.list_id WHERE search_document_fts MATCH ? ORDER BY rank, d.updated_at DESC, d.id DESC LIMIT 50`).bind(query).all<SearchRow>();
		return { q, results: result.results, recentLinks: [], recentLists: [] };
	}

	const db = getDb(event.platform!.env.DB);
	const recentLinks = await db.select({ id: link.id, title: link.title, description: link.description, url: link.normalizedUrl, username: profile.username, publishedAt: link.publishedAt }).from(link).innerJoin(profile, eq(profile.userId, link.ownerUserId)).where(and(eq(link.visibility, 'public'), eq(link.moderationState, 'active'), isNotNull(link.ownerUserId))).orderBy(desc(link.publishedAt)).limit(12);
	const recentLists = await db.select({ id: list.id, title: list.title, description: list.description, slug: list.slug, username: list.routeUsername, updatedAt: list.updatedAt }).from(list).where(and(eq(list.visibility, 'public'), eq(list.moderationState, 'active'))).orderBy(desc(list.updatedAt)).limit(8);
	return { q, results: [] as SearchRow[], recentLinks, recentLists };
};
