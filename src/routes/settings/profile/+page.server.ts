import { eq, or } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { collection, collectionMember, link, profile } from '$lib/server/db/schema';
import { requireWriter } from '$lib/server/guards';
import { syncCollectionSearch, syncPersonalSearch } from '$lib/server/search';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = (event) => {
	const { profile } = requireWriter(event);
	return { profile };
};
export const actions: Actions = {
	default: async (event) => {
		const { user } = requireWriter(event); const data = await event.request.formData();
		const displayName = String(data.get('displayName') ?? '').trim();
		const bio = String(data.get('bio') ?? '').trim(); const avatarUrl = String(data.get('avatarUrl') ?? '').trim();
		if (!displayName || displayName.length > 80 || bio.length > 500) return fail(400, { message: 'Check the profile fields and try again.' });
		if (avatarUrl) { try { const parsed = new URL(avatarUrl); if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error(); } catch { return fail(400, { message: 'Avatar must be an HTTP or HTTPS URL.' }); } }
		const db = getDb(event.platform!.env.DB); await db.update(profile).set({ displayName, bio: bio || null, avatarUrl: avatarUrl || null }).where(eq(profile.userId, user.id));
		const personalLinks = await db.select({ id: link.id }).from(link).where(eq(link.ownerUserId, user.id)); for (const item of personalLinks) await syncPersonalSearch(db, item.id);
		const collections = await db.select({ id: collection.id }).from(collection).leftJoin(collectionMember, eq(collectionMember.collectionId, collection.id)).where(or(eq(collection.ownerUserId, user.id), eq(collectionMember.userId, user.id))); for (const item of new Map(collections.map((row) => [row.id, row])).values()) await syncCollectionSearch(db, item.id);
		return { saved: true };
	}
};
