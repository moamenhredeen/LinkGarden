import { desc, eq, or } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
import { slugSchema, visibilitySchema } from '$lib/domain';
import { getDb } from '$lib/server/db';
import { collection, collectionMember } from '$lib/server/db/schema';
import { requireWriter } from '$lib/server/guards';
import { syncCollectionSearch } from '$lib/server/search';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const { user } = requireWriter(event); const db = getDb(event.platform!.env.DB);
	const rows = await db.select({ collection, memberUserId: collectionMember.userId }).from(collection)
		.leftJoin(collectionMember, eq(collectionMember.collectionId, collection.id))
		.where(or(eq(collection.ownerUserId, user.id), eq(collectionMember.userId, user.id))).orderBy(desc(collection.updatedAt));
	const unique = [...new Map(rows.map((row) => [row.collection.id, { ...row.collection, isOwner: row.collection.ownerUserId === user.id }])).values()];
	return { collections: unique };
};

export const actions: Actions = {
	create: async (event) => {
		const { user } = requireWriter(event); const data = await event.request.formData();
		const title = String(data.get('title') ?? '').trim(); const slug = slugSchema.safeParse(String(data.get('slug') ?? '').trim()); const visibility = visibilitySchema.safeParse(data.get('visibility'));
		if (!title || title.length > 120 || !slug.success || !visibility.success) return fail(400, { message: 'Check the title, slug, and visibility.' });
		const id = crypto.randomUUID(); const now = new Date();
		try { const db = getDb(event.platform!.env.DB); await db.insert(collection).values({ id, ownerUserId: user.id, routeProfileId: user.id, routeUsername: event.locals.profile!.username, title, slug: slug.data, description: String(data.get('description') ?? '').trim().slice(0, 2_000), visibility: visibility.data, publishedAt: visibility.data === 'public' ? now : null }); await syncCollectionSearch(db, id); }
		catch { return fail(409, { message: 'That collection slug is already in use on your profile.' }); }
		redirect(303, `/app/collections/${id}`);
	}
};
