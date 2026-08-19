import { APIError } from 'better-auth/api';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	if (locals.user) redirect(303, locals.profile ? '/app/links' : '/onboarding');
	return {};
};

export const actions: Actions = {
	default: async ({ locals, request }) => {
		const data = await request.formData();
		try {
			await locals.auth.api.signInEmail({ body: {
				email: String(data.get('email') ?? '').trim(),
				password: String(data.get('password') ?? '')
			} });
		} catch (cause) {
			if (cause instanceof APIError) return fail(cause.statusCode === 403 ? 403 : 400, { message: cause.message });
			return fail(500, { message: 'Unable to sign in right now.' });
		}
		redirect(303, '/app/links');
	}
};
