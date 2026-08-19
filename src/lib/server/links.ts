import { and, eq, sql } from 'drizzle-orm';
import type { getDb } from '$lib/server/db';
import { link } from '$lib/server/db/schema';
import { normalizeUrl } from '$lib/url';

type Db = ReturnType<typeof getDb>;

export async function createPersonalLink(db: Db, userId: string, input: { url: string; title?: string; description?: string; visibility: 'private' | 'public' }) {
	const normalizedUrl = normalizeUrl(input.url);
	const parsed = new URL(normalizedUrl);
	const now = new Date();
	const id = crypto.randomUUID();
	await db.insert(link).values({
		id, ownerUserId: userId, submittedUrl: input.url.trim(), normalizedUrl,
		title: input.title?.trim() || parsed.hostname,
		description: input.description?.trim() || '', visibility: input.visibility,
		titleManuallyEdited: Boolean(input.title?.trim()), descriptionManuallyEdited: Boolean(input.description?.trim()),
		metadataRequestedAt: now, publishedAt: input.visibility === 'public' ? now : null
	});
	return { id, generation: 1, normalizedUrl };
}

export async function retryMetadata(db: Db, userId: string, linkId: string) {
	const rows = await db.update(link).set({
		metadataStatus: 'pending', metadataGeneration: sql`${link.metadataGeneration} + 1`, metadataRequestedAt: new Date(), metadataRetryAt: null
	}).where(and(eq(link.id, linkId), eq(link.ownerUserId, userId))).returning({ generation: link.metadataGeneration });
	return rows[0];
}
