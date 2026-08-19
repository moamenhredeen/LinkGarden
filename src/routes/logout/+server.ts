import { redirect, type RequestHandler } from '@sveltejs/kit';
export const POST: RequestHandler = async ({ locals, request }) => { await locals.auth.api.signOut({ headers: request.headers }); redirect(303, '/'); };
