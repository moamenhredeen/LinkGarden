import { and, eq, or, sql } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { list, listInvitation, profile } from '$lib/server/db/schema';
import { requireWriter } from '$lib/server/guards';
import { syncListSearch } from '$lib/server/search';
import type { Actions, PageServerLoad } from './$types';

async function tokenHash(token: string): Promise<string> { return [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token)))].map((byte) => byte.toString(16).padStart(2, '0')).join(''); }

export const load: PageServerLoad = async (event) => {
	const { user } = requireWriter(event); const db = getDb(event.platform!.env.DB); const now = new Date();
	await db.update(listInvitation).set({ status: 'expired' }).where(and(eq(listInvitation.status, 'pending'), sql`${listInvitation.expiresAt} <= ${now}`));
	const rows = await db.select({ invitation: listInvitation, listTitle: list.title, ownerUsername: profile.username }).from(listInvitation).innerJoin(list, eq(list.id, listInvitation.listId)).innerJoin(profile, eq(profile.userId, list.ownerUserId)).where(and(eq(listInvitation.status, 'pending'), or(eq(listInvitation.recipientUserId, user.id), sql`lower(${listInvitation.recipientEmail}) = ${user.email.toLocaleLowerCase('en-US')}`)));
	return { invitations: rows, token: event.url.searchParams.get('token') ?? '' };
};

export const actions: Actions = {
	accept: async (event) => {
		const { user } = requireWriter(event); const data = await event.request.formData(); const id = String(data.get('id') ?? ''); const token = String(data.get('token') ?? ''); const db = getDb(event.platform!.env.DB);
		const rows = token ? await db.select().from(listInvitation).where(and(eq(listInvitation.tokenHash, await tokenHash(token)), eq(listInvitation.status, 'pending'))).limit(1) : await db.select().from(listInvitation).where(and(eq(listInvitation.id, id), eq(listInvitation.status, 'pending'))).limit(1);
		const invitation = rows[0]; if (!invitation || invitation.expiresAt <= new Date()) return fail(400, { message: 'This invitation is invalid or expired.' });
		const intended = invitation.recipientUserId === user.id || invitation.recipientEmail?.toLocaleLowerCase('en-US') === user.email.toLocaleLowerCase('en-US'); if (!intended) return fail(403, { message: 'This invitation belongs to another recipient.' });
		await event.platform!.env.DB.batch([event.platform!.env.DB.prepare('INSERT OR IGNORE INTO list_member (list_id, user_id, created_at) VALUES (?, ?, ?)').bind(invitation.listId, user.id, Date.now()), event.platform!.env.DB.prepare("UPDATE list_invitation SET status = 'accepted', accepted_at = ?, updated_at = ? WHERE id = ? AND status = 'pending'").bind(Date.now(), Date.now(), invitation.id)]); await syncListSearch(db, invitation.listId); return { accepted: true };
	},
	revoke: async (event) => { const { user } = requireWriter(event); const data = await event.request.formData(); await getDb(event.platform!.env.DB).update(listInvitation).set({ status: 'revoked' }).where(and(eq(listInvitation.id, String(data.get('id') ?? '')), eq(listInvitation.recipientUserId, user.id), eq(listInvitation.status, 'pending'))); return { revoked: true }; }
};
