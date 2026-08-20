import { desc, eq, or } from 'drizzle-orm';
import { getDb } from '$lib/server/db';
import { collection, collectionMember } from '$lib/server/db/schema';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, platform }) => {
	if (!locals.user) return { user: locals.user, profile: locals.profile, isAdmin: locals.isAdmin, collections: [] };
	const db = getDb(platform!.env.DB);
	const rows = await db
		.select({ id: collection.id, title: collection.title, ownerUserId: collection.ownerUserId })
		.from(collection)
		.leftJoin(collectionMember, eq(collectionMember.collectionId, collection.id))
		.where(or(eq(collection.ownerUserId, locals.user.id), eq(collectionMember.userId, locals.user.id)))
		.orderBy(desc(collection.updatedAt));
	const collections = [...new Map(rows.map((row) => [row.id, row])).values()].slice(0, 12);
	return { user: locals.user, profile: locals.profile, isAdmin: locals.isAdmin, collections };
};
