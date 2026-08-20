import { APIError } from 'better-auth/api';
import { fail, redirect, type RequestEvent } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	if (locals.user) redirect(303, locals.profile ? '/' : '/onboarding');
	return {};
};

const signInSocial = (provider: 'github' | 'google') => async ({ locals }: RequestEvent) => {
	const result = await locals.auth.api.signInSocial({ body: { provider, callbackURL: '/onboarding' } });
	redirect(303, result.url ?? '/register');
};

export const actions: Actions = {
	credentials: async ({ locals, request }) => {
		const data = await request.formData();
		const name = String(data.get('name') ?? '').trim();
		const email = String(data.get('email') ?? '').trim();
		const password = String(data.get('password') ?? '');
		if (!name || password.length < 8) return fail(400, { message: 'Enter a name and a password of at least 8 characters.' });
		try {
			await locals.auth.api.signUpEmail({ body: { name, email, password, callbackURL: '/onboarding' } });
		} catch (cause) {
			if (cause instanceof APIError) return fail(400, { message: cause.message });
			return fail(500, { message: 'Unable to create your account right now.' });
		}
		redirect(303, '/verify-email');
	},
	github: signInSocial('github'),
	google: signInSocial('google')
};
