import { fail, redirect } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { profile } from '$lib/server/db/schema';
import { usernameSchema } from '$lib/domain';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	if (!locals.user) redirect(303, '/login');
	if (!locals.user.emailVerified) redirect(303, '/verify-email');
	if (locals.profile) redirect(303, '/app/links');
	return { displayName: locals.user.name };
};

export const actions: Actions = {
	default: async (event) => {
		if (!event.locals.user) redirect(303, '/login');
		if (!event.locals.user.emailVerified) redirect(303, '/verify-email');
		const data = await event.request.formData();
		const parsed = usernameSchema.safeParse(String(data.get('username') ?? ''));
		const displayName = String(data.get('displayName') ?? '').trim();
		if (!parsed.success || !displayName || displayName.length > 80) return fail(400, { message: parsed.error?.issues[0]?.message ?? 'Enter a display name.' });
		try {
			await getDb(event.platform!.env.DB).insert(profile).values({
				userId: event.locals.user.id,
				username: parsed.data.toLocaleLowerCase('en-US'),
				displayName
			});
		} catch { return fail(409, { message: 'That username is already taken.' }); }
		redirect(303, '/app/links');
	}
};
