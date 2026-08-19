import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	if (!locals.user) redirect(303, '/login');
	if (locals.user.emailVerified) redirect(303, locals.profile ? '/app/links' : '/onboarding');
	return { email: locals.user.email };
};

export const actions: Actions = {
	default: async ({ locals, request }) => {
		if (!locals.user) redirect(303, '/login');
		try {
			await locals.auth.api.sendVerificationEmail({ headers: request.headers, body: { email: locals.user.email, callbackURL: '/onboarding' } });
			return { sent: true };
		} catch {
			return fail(500, { message: 'Unable to resend the message right now.' });
		}
	}
};
