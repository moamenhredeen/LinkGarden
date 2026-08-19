import { error, redirect, type RequestEvent } from '@sveltejs/kit';
import { and, eq, or } from 'drizzle-orm';

import { getDb } from '$lib/server/db';
import { list, listMember } from '$lib/server/db/schema';

export function requireUser(event: RequestEvent) {
	if (!event.locals.user) redirect(303, '/login');
	return event.locals.user;
}

export function requireWriter(event: RequestEvent) {
	const user = requireUser(event);
	if (!user.emailVerified) redirect(303, '/verify-email');
	if (!event.locals.profile) redirect(303, '/onboarding');
	return { user, profile: event.locals.profile };
}

export function requireAdmin(event: RequestEvent) {
	const writer = requireWriter(event);
	if (!event.locals.isAdmin) error(404, 'Not found');
	return writer;
}

export async function requireListAccess(event: RequestEvent, listId: string, ownerOnly = false) {
	const { user } = requireWriter(event);
	const db = getDb(event.platform!.env.DB);
	const result = await db.select({ collection: list, memberUserId: listMember.userId })
		.from(list)
		.leftJoin(listMember, and(eq(listMember.listId, list.id), eq(listMember.userId, user.id)))
		.where(and(eq(list.id, listId), ownerOnly ? eq(list.ownerUserId, user.id) : or(eq(list.ownerUserId, user.id), eq(listMember.userId, user.id))))
		.limit(1);
	if (!result[0]) error(404, 'List not found');
	return { user, collection: result[0].collection, isOwner: result[0].collection.ownerUserId === user.id };
}
