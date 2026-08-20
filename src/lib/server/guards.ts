import { error, redirect, type RequestEvent } from '@sveltejs/kit';
import { and, eq, or } from 'drizzle-orm';

import { getDb } from '$lib/server/db';
import { collection, collectionMember } from '$lib/server/db/schema';

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

export async function requireCollectionAccess(event: RequestEvent, collectionId: string, ownerOnly = false) {
	const { user } = requireWriter(event);
	const db = getDb(event.platform!.env.DB);
	const result = await db.select({ collection, memberUserId: collectionMember.userId })
		.from(collection)
		.leftJoin(collectionMember, and(eq(collectionMember.collectionId, collection.id), eq(collectionMember.userId, user.id)))
		.where(and(eq(collection.id, collectionId), ownerOnly ? eq(collection.ownerUserId, user.id) : or(eq(collection.ownerUserId, user.id), eq(collectionMember.userId, user.id))))
		.limit(1);
	if (!result[0]) error(404, 'Collection not found');
	return { user, collection: result[0].collection, isOwner: result[0].collection.ownerUserId === user.id };
}
