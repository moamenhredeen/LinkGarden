import { env } from "$env/dynamic/private";
import { betterAuth } from "better-auth/minimal";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { sveltekitCookies } from "better-auth/svelte-kit";
import { getRequestEvent } from "$app/server";
import { getDb } from "$lib/server/db";
import type { D1Database } from '@cloudflare/workers-types';
import { sendActionEmail } from '$lib/server/email';
import { APIError } from 'better-auth/api';

const authConfig = (d1: D1Database, email?: SendEmail, from = 'hello@linkgarden.moamenhredeen.me') => ({
	baseURL: env.ORIGIN,
	secret: env.BETTER_AUTH_SECRET,
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
		revokeSessionsOnPasswordReset: true,
		sendResetPassword: async ({ user, url }: { user: { email: string }; url: string }) => {
			await sendActionEmail(email, from, {
				to: user.email,
				subject: 'Reset your LinkGarden password',
				heading: 'Reset your password',
				text: 'Use this secure link to choose a new password.',
				action: 'Reset password',
				url
			});
		}
	},
	emailVerification: {
		sendOnSignUp: true,
		autoSignInAfterVerification: true,
		sendVerificationEmail: async ({ user, url }: { user: { email: string }; url: string }) => {
			await sendActionEmail(email, from, {
				to: user.email,
				subject: 'Verify your LinkGarden email',
				heading: 'Verify your email',
				text: 'Verify your email address before saving, publishing, or collaborating.',
				action: 'Verify email',
				url
			});
		}
	},
	user: {
		deleteUser: {
			enabled: true,
			beforeDelete: async (user: { id: string; email: string }) => {
				const blocker = await d1.prepare(`SELECT l.id FROM list l WHERE l.owner_user_id = ? AND (l.visibility = 'public' OR EXISTS (SELECT 1 FROM list_member m WHERE m.list_id = l.id)) LIMIT 1`).bind(user.id).first();
				if (blocker) throw new APIError('BAD_REQUEST', { message: 'Transfer or delete every public or shared list before deleting your account.' });
				await d1.prepare('DELETE FROM list_invitation WHERE recipient_email IS NOT NULL AND lower(recipient_email) = lower(?)').bind(user.email).run();
			}
		}
	},
	plugins: [
		sveltekitCookies(getRequestEvent) // make sure this is the last plugin in the array
	]
});

export const createAuth = (d1: D1Database, email?: SendEmail, from?: string) => betterAuth({
	...authConfig(d1, email, from),
	database: drizzleAdapter(getDb(d1), { provider: 'sqlite' })
});

/**
* DO NOT USE!
*
* This instance is used by the `auth` CLI for schema generation ONLY.
* To access `auth` at runtime, use `event.locals.auth`.
*/
export const auth = createAuth(null!);
