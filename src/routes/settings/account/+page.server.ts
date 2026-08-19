import { and, eq, exists, or } from 'drizzle-orm';
import { APIError } from 'better-auth/api';
import { fail, redirect } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { list, listMember } from '$lib/server/db/schema';
import { requireWriter } from '$lib/server/guards';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const { user } = requireWriter(event); const db = getDb(event.platform!.env.DB);
	const blockers = await db.select({ id: list.id, title: list.title, visibility: list.visibility }).from(list).where(and(eq(list.ownerUserId, user.id), or(eq(list.visibility, 'public'), exists(db.select().from(listMember).where(eq(listMember.listId, list.id))))));
	return { blockers };
};
export const actions: Actions = {
	deleteAccount: async (event) => {
		requireWriter(event); const data = await event.request.formData();
		try { await event.locals.auth.api.deleteUser({ headers: event.request.headers, body: { password: String(data.get('password') ?? '') } }); }
		catch (cause) { if (cause instanceof APIError) return fail(400, { message: cause.message }); return fail(500, { message: 'Unable to delete your account.' }); }
		redirect(303, '/');
	}
};
