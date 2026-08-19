import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
export const load: PageServerLoad = ({ url }) => ({ token: url.searchParams.get('token') ?? '' });
export const actions: Actions = { default: async ({ locals, request }) => {
	const data = await request.formData(); const token = String(data.get('token') ?? ''); const newPassword = String(data.get('password') ?? '');
	if (!token || newPassword.length < 8) return fail(400, { message: 'The link is invalid or the password is too short.' });
	try { await locals.auth.api.resetPassword({ body: { token, newPassword } }); } catch { return fail(400, { message: 'This reset link is invalid or expired.' }); }
	redirect(303, '/login');
} };
