import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ locals, request, url }) => {
		const data = await request.formData();
		try {
			await locals.auth.api.requestPasswordReset({ body: { email: String(data.get('email') ?? ''), redirectTo: `${url.origin}/reset-password` } });
			return { sent: true };
		} catch { return fail(500, { message: 'Unable to send a reset message right now.' }); }
	}
};
