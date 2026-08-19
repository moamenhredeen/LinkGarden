import { env } from "$env/dynamic/private";
import { betterAuth } from "better-auth/minimal";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { sveltekitCookies } from "better-auth/svelte-kit";
import { getRequestEvent } from "$app/server";
import { getDb } from "$lib/server/db";
import type { D1Database } from '@cloudflare/workers-types';
import { sendActionEmail } from '$lib/server/email';

const authConfig = (email?: SendEmail, from = 'hello@linkgarden.moamenhredeen.me') => ({
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
	plugins: [
		sveltekitCookies(getRequestEvent) // make sure this is the last plugin in the array
	]
});

export const createAuth = (d1: D1Database, email?: SendEmail, from?: string) => betterAuth({
	...authConfig(email, from),
	database: drizzleAdapter(getDb(d1), { provider: 'sqlite' })
});

/**
* DO NOT USE!
*
* This instance is used by the `auth` CLI for schema generation ONLY.
* To access `auth` at runtime, use `event.locals.auth`.
*/
export const auth = createAuth(null!);
