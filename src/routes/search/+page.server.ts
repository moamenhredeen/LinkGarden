import { getDb } from '$lib/server/db'; import { toFtsQuery } from '$lib/server/search'; import type { PageServerLoad } from './$types';
type SearchRow = { kind: 'personal_link' | 'list' | 'list_link'; entity_id: string; list_id: string | null; title: string; description: string; url: string; curators: string; rank: number; route_username: string | null; slug: string | null };
export const load: PageServerLoad = async (event) => {
	const q = event.url.searchParams.get('q')?.trim().slice(0, 200) ?? ''; const query = toFtsQuery(q); if (!query) return { q, results: [] as SearchRow[] };
	const result = await event.platform!.env.DB.prepare(`SELECT d.kind, d.entity_id, d.list_id, d.title, d.description, d.url, d.curators, bm25(search_document_fts) AS rank, p.username AS route_username, l.slug FROM search_document_fts JOIN search_document d ON d.id = search_document_fts.rowid LEFT JOIN list l ON l.id = d.list_id LEFT JOIN profile p ON p.user_id = l.route_profile_id WHERE search_document_fts MATCH ? ORDER BY rank, d.updated_at DESC, d.id DESC LIMIT 50`).bind(query).all<SearchRow>();
	return { q, results: result.results };
};
