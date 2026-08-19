import type { Handle } from '@sveltejs/kit';
import { building } from '$app/environment';
import { createAuth } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { eq } from 'drizzle-orm';
import { getDb } from '$lib/server/db';
import { platformAdmin, profile } from '$lib/server/db/schema';

const handleBetterAuth: Handle = async ({ event, resolve }) => {
	if (!event.platform?.env?.DB) throw new Error('D1 binding "DB" not found - are you running with wrangler?');

	event.locals.auth = createAuth(event.platform.env.DB, event.platform.env.EMAIL, event.platform.env.EMAIL_FROM);
	event.locals.isAdmin = false;

	const { auth } = event.locals;
	const session = await auth.api.getSession({ headers: event.request.headers });

	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;
		const db = getDb(event.platform.env.DB);
		const [currentProfile, admin] = await Promise.all([
			db.query.profile.findFirst({ where: eq(profile.userId, session.user.id) }),
			db.query.platformAdmin.findFirst({ where: eq(platformAdmin.userId, session.user.id) })
		]);
		event.locals.profile = currentProfile;
		event.locals.isAdmin = Boolean(admin);
	}

	return svelteKitHandler({ event, resolve, auth, building });
};

export const handle: Handle = handleBetterAuth;
