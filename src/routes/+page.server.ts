import { and, desc, eq, isNotNull } from 'drizzle-orm';
import { getDb } from '$lib/server/db';
import { link, list, profile } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const db = getDb(event.platform!.env.DB);
	const recentLinks = await db.select({ id: link.id, title: link.title, description: link.description, url: link.normalizedUrl, username: profile.username, publishedAt: link.publishedAt }).from(link).innerJoin(profile, eq(profile.userId, link.ownerUserId)).where(and(eq(link.visibility, 'public'), eq(link.moderationState, 'active'), isNotNull(link.ownerUserId))).orderBy(desc(link.publishedAt)).limit(12);
	const recentLists = await db.select({ id: list.id, title: list.title, description: list.description, slug: list.slug, username: list.routeUsername, updatedAt: list.updatedAt }).from(list).where(and(eq(list.visibility, 'public'), eq(list.moderationState, 'active'))).orderBy(desc(list.updatedAt)).limit(8);
	return { recentLinks, recentLists };
};
