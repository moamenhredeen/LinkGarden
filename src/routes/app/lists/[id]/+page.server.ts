import { and, asc, eq, inArray, max, or, sql } from 'drizzle-orm';
import { error, fail, redirect } from '@sveltejs/kit';

import { visibilitySchema } from '$lib/domain';
import { sendActionEmail } from '$lib/server/email';
import { getDb } from '$lib/server/db';
import { link, linkTag, list, listInvitation, listMember, profile, tag, user } from '$lib/server/db/schema';
import { requireListAccess } from '$lib/server/guards';
import { createPersonalLink } from '$lib/server/links';
import { parseTags, replaceLinkTags } from '$lib/server/tags';
import { normalizeUrl } from '$lib/url';
import type { Actions, PageServerLoad } from './$types';

function randomToken(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(32));
	return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}
async function tokenHash(token: string): Promise<string> {
	return [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token)))].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}
async function enqueue(event: Parameters<Actions[string]>[0], id: string, generation = 1) {
	await event.platform!.env.METADATA_QUEUE.send({ version: 1, linkId: id, generation }, { contentType: 'json' });
}

export const load: PageServerLoad = async (event) => {
	const access = await requireListAccess(event, event.params.id); const db = getDb(event.platform!.env.DB);
	const links = await db.select().from(link).where(eq(link.listId, access.collection.id)).orderBy(asc(link.position));
	const tagRows = links.length ? await db.select({ linkId: linkTag.linkId, name: tag.name }).from(linkTag).innerJoin(tag, eq(tag.id, linkTag.tagId)).where(inArray(linkTag.linkId, links.map((item) => item.id))) : [];
	const members = await db.select({ userId: listMember.userId, username: profile.username, displayName: profile.displayName }).from(listMember).innerJoin(profile, eq(profile.userId, listMember.userId)).where(eq(listMember.listId, access.collection.id));
	const invitations = access.isOwner ? await db.select().from(listInvitation).where(and(eq(listInvitation.listId, access.collection.id), eq(listInvitation.status, 'pending'))) : [];
	const personalLinks = await db.select({ id: link.id, title: link.title, normalizedUrl: link.normalizedUrl }).from(link).where(eq(link.ownerUserId, access.user.id)).orderBy(asc(link.title));
	return { collection: access.collection, isOwner: access.isOwner, links: links.map((item) => ({ ...item, tags: tagRows.filter((row) => row.linkId === item.id).map((row) => row.name) })), members, invitations, personalLinks };
};

export const actions: Actions = {
	details: async (event) => {
		const { collection } = await requireListAccess(event, event.params.id, true); const data = await event.request.formData(); const visibility = visibilitySchema.safeParse(data.get('visibility'));
		const title = String(data.get('title') ?? '').trim(); const description = String(data.get('description') ?? '').trim();
		if (!title || title.length > 120 || description.length > 2_000 || !visibility.success) return fail(400, { message: 'Check the list details.' });
		await getDb(event.platform!.env.DB).update(list).set({ title, description, visibility: visibility.data, publishedAt: visibility.data === 'public' ? (collection.publishedAt ?? new Date()) : collection.publishedAt }).where(eq(list.id, collection.id));
		return { saved: true };
	},
	add: async (event) => {
		const access = await requireListAccess(event, event.params.id); const data = await event.request.formData(); const db = getDb(event.platform!.env.DB);
		let normalizedUrl: string; let tags: string[]; try { normalizedUrl = normalizeUrl(String(data.get('url') ?? '')); tags = parseTags(data.get('tags')); } catch (cause) { return fail(400, { message: cause instanceof Error ? cause.message : 'Invalid link.' }); }
		const current = await db.select({ value: max(link.position) }).from(link).where(eq(link.listId, access.collection.id)); const id = crypto.randomUUID();
		try { await db.insert(link).values({ id, listId: access.collection.id, addedByUserId: access.user.id, submittedUrl: String(data.get('url')), normalizedUrl, title: String(data.get('title') ?? '').trim() || new URL(normalizedUrl).hostname, description: String(data.get('description') ?? '').trim().slice(0, 2_000), position: (current[0]?.value ?? -1) + 1, titleManuallyEdited: Boolean(String(data.get('title') ?? '').trim()), descriptionManuallyEdited: Boolean(String(data.get('description') ?? '').trim()), metadataRequestedAt: new Date() }); await replaceLinkTags(db, id, tags); await enqueue(event, id); }
		catch (cause) { const message = cause instanceof Error ? cause.message : ''; return fail(message.includes('UNIQUE') ? 409 : 400, { message: message.includes('UNIQUE') ? 'link already exists' : 'Unable to add link.' }); }
		return { added: true };
	},
	copy: async (event) => {
		const access = await requireListAccess(event, event.params.id); const data = await event.request.formData(); const db = getDb(event.platform!.env.DB);
		const source = await db.select().from(link).where(and(eq(link.id, String(data.get('personalLinkId') ?? '')), eq(link.ownerUserId, access.user.id))).limit(1);
		if (!source[0]) return fail(404, { message: 'Personal link not found.' });
		const current = await db.select({ value: max(link.position) }).from(link).where(eq(link.listId, access.collection.id)); const id = crypto.randomUUID();
		try { await db.insert(link).values({ id, listId: access.collection.id, addedByUserId: access.user.id, submittedUrl: source[0].submittedUrl, normalizedUrl: source[0].normalizedUrl, title: source[0].title, description: source[0].description, position: (current[0]?.value ?? -1) + 1, metadataStatus: source[0].metadataStatus, titleManuallyEdited: true, descriptionManuallyEdited: true }); const sourceTags = await db.select({ name: tag.name }).from(linkTag).innerJoin(tag, eq(tag.id, linkTag.tagId)).where(eq(linkTag.linkId, source[0].id)); await replaceLinkTags(db, id, sourceTags.map((item) => item.name)); }
		catch (cause) { return fail(409, { message: cause instanceof Error && cause.message.includes('UNIQUE') ? 'link already exists' : 'Unable to copy link.' }); }
		return { copied: true };
	},
	editLink: async (event) => {
		const access = await requireListAccess(event, event.params.id); const data = await event.request.formData(); const id = String(data.get('linkId') ?? ''); const title = String(data.get('title') ?? '').trim(); const description = String(data.get('description') ?? '').trim();
		if (!title || title.length > 300 || description.length > 2_000) return fail(400, { message: 'Check the link details.' });
		let tags: string[]; try { tags = parseTags(data.get('tags')); } catch (cause) { return fail(400, { message: cause instanceof Error ? cause.message : 'Invalid tags.' }); }
		const db = getDb(event.platform!.env.DB); const changed = await db.update(link).set({ title, description, titleManuallyEdited: true, descriptionManuallyEdited: true }).where(and(eq(link.id, id), eq(link.listId, access.collection.id))).returning({ id: link.id });
		if (!changed[0]) return fail(404, { message: 'Link not found.' }); await replaceLinkTags(db, id, tags); return { saved: true };
	},
	removeLink: async (event) => {
		const access = await requireListAccess(event, event.params.id); const data = await event.request.formData(); await getDb(event.platform!.env.DB).delete(link).where(and(eq(link.id, String(data.get('linkId') ?? '')), eq(link.listId, access.collection.id))); return { removed: true };
	},
	reorder: async (event) => {
		const access = await requireListAccess(event, event.params.id); const data = await event.request.formData(); const ids = String(data.get('orderedIds') ?? '').split(',').filter(Boolean);
		if (new Set(ids).size !== ids.length) return fail(400, { message: 'Invalid link order.' }); const db = getDb(event.platform!.env.DB); const rows = await db.select({ id: link.id }).from(link).where(eq(link.listId, access.collection.id));
		if (rows.length !== ids.length || rows.some((row) => !ids.includes(row.id))) return fail(409, { message: 'The list changed; refresh before reordering.' });
		await event.platform!.env.DB.batch(ids.map((id, position) => event.platform!.env.DB.prepare('UPDATE link SET position = ?, updated_at = ? WHERE id = ? AND list_id = ?').bind(position, Date.now(), id, access.collection.id))); return { reordered: true };
	},
	invite: async (event) => {
		const access = await requireListAccess(event, event.params.id, true); const data = await event.request.formData(); const recipient = String(data.get('recipient') ?? '').trim().toLocaleLowerCase('en-US'); if (!recipient) return fail(400, { message: 'Enter a username or email.' }); const db = getDb(event.platform!.env.DB);
		const matches = recipient.includes('@') ? await db.select({ id: user.id, email: user.email }).from(user).where(sql`lower(${user.email}) = ${recipient}`).limit(1) : await db.select({ id: user.id, email: user.email }).from(profile).innerJoin(user, eq(user.id, profile.userId)).where(sql`lower(${profile.username}) = ${recipient}`).limit(1);
		const recipientUser = matches[0]; if (recipientUser?.id === access.user.id) return fail(400, { message: 'The owner is already part of the list.' });
		if (recipientUser) { const membership = await db.select().from(listMember).where(and(eq(listMember.listId, access.collection.id), eq(listMember.userId, recipientUser.id))).limit(1); if (membership[0]) return fail(409, { message: 'That user is already an editor.' }); }
		if (!recipientUser && !recipient.includes('@')) return fail(404, { message: 'No user has that username.' });
		const token = randomToken(); const id = crypto.randomUUID(); const email = recipientUser?.email ?? recipient;
		try { await db.insert(listInvitation).values({ id, listId: access.collection.id, invitedByUserId: access.user.id, recipientUserId: recipientUser?.id ?? null, recipientEmail: recipientUser ? null : email, tokenHash: await tokenHash(token), expiresAt: new Date(Date.now() + 7 * 86_400_000) }); }
		catch { return fail(409, { message: 'An active invitation already exists for that recipient.' }); }
		try { await sendActionEmail(event.platform!.env.EMAIL, event.platform!.env.EMAIL_FROM, { to: email, subject: `Join “${access.collection.title}” on LinkGarden`, heading: 'You have been invited to curate a list', text: `Accept the invitation to help maintain “${access.collection.title}”. It expires in seven days.`, action: 'View invitation', url: `${event.url.origin}/app/invitations?token=${encodeURIComponent(token)}` }); }
		catch { return { message: 'Invitation created, but email delivery failed. You can revoke and send it again.' }; }
		return { invited: true };
	},
	revoke: async (event) => { const access = await requireListAccess(event, event.params.id, true); const data = await event.request.formData(); await getDb(event.platform!.env.DB).update(listInvitation).set({ status: 'revoked' }).where(and(eq(listInvitation.id, String(data.get('invitationId') ?? '')), eq(listInvitation.listId, access.collection.id), eq(listInvitation.status, 'pending'))); return { revoked: true }; },
	removeEditor: async (event) => { const access = await requireListAccess(event, event.params.id, true); const data = await event.request.formData(); await getDb(event.platform!.env.DB).delete(listMember).where(and(eq(listMember.listId, access.collection.id), eq(listMember.userId, String(data.get('userId') ?? '')))); return { removed: true }; },
	leave: async (event) => { const access = await requireListAccess(event, event.params.id); if (access.isOwner) return fail(400, { message: 'Transfer or delete the list before leaving.' }); await getDb(event.platform!.env.DB).delete(listMember).where(and(eq(listMember.listId, access.collection.id), eq(listMember.userId, access.user.id))); redirect(303, '/app/lists'); },
	transfer: async (event) => {
		const access = await requireListAccess(event, event.params.id, true); const data = await event.request.formData(); const newOwnerId = String(data.get('userId') ?? ''); const db = getDb(event.platform!.env.DB); const member = await db.select().from(listMember).where(and(eq(listMember.listId, access.collection.id), eq(listMember.userId, newOwnerId))).limit(1); if (!member[0]) return fail(400, { message: 'Ownership can only be transferred to an accepted editor.' });
		await event.platform!.env.DB.batch([event.platform!.env.DB.prepare('INSERT OR IGNORE INTO list_member (list_id, user_id, created_at) VALUES (?, ?, ?)').bind(access.collection.id, access.user.id, Date.now()), event.platform!.env.DB.prepare('DELETE FROM list_member WHERE list_id = ? AND user_id = ?').bind(access.collection.id, newOwnerId), event.platform!.env.DB.prepare('UPDATE list SET owner_user_id = ?, updated_at = ? WHERE id = ? AND owner_user_id = ?').bind(newOwnerId, Date.now(), access.collection.id, access.user.id)]); return { transferred: true };
	},
	deleteList: async (event) => { const access = await requireListAccess(event, event.params.id, true); await getDb(event.platform!.env.DB).delete(list).where(eq(list.id, access.collection.id)); redirect(303, '/app/lists'); }
};
