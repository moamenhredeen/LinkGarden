import { desc, eq, or } from 'drizzle-orm';
import { getDb } from '$lib/server/db';
import { list, listMember } from '$lib/server/db/schema';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, platform }) => {
	if (!locals.user) return { user: locals.user, profile: locals.profile, isAdmin: locals.isAdmin, collections: [] };
	const db = getDb(platform!.env.DB);
	const rows = await db
		.select({ id: list.id, title: list.title, ownerUserId: list.ownerUserId })
		.from(list)
		.leftJoin(listMember, eq(listMember.listId, list.id))
		.where(or(eq(list.ownerUserId, locals.user.id), eq(listMember.userId, locals.user.id)))
		.orderBy(desc(list.updatedAt));
	const collections = [...new Map(rows.map((row) => [row.id, row])).values()].slice(0, 12);
	return { user: locals.user, profile: locals.profile, isAdmin: locals.isAdmin, collections };
};
