import { and, desc, eq, inArray } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { visibilitySchema } from '$lib/domain';
import { getDb } from '$lib/server/db';
import { createPersonalLink, retryMetadata } from '$lib/server/links';
import { link, linkTag, tag } from '$lib/server/db/schema';
import { requireWriter } from '$lib/server/guards';
import { parseTags, replaceLinkTags } from '$lib/server/tags';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const { user } = requireWriter(event); const db = getDb(event.platform!.env.DB);
	const links = await db.select().from(link).where(eq(link.ownerUserId, user.id)).orderBy(desc(link.createdAt));
	const tagRows = links.length ? await db.select({ linkId: linkTag.linkId, name: tag.name }).from(linkTag).innerJoin(tag, eq(tag.id, linkTag.tagId)).where(inArray(linkTag.linkId, links.map((item) => item.id))) : [];
	return { links: links.map((item) => ({ ...item, tags: tagRows.filter((row) => row.linkId === item.id).map((row) => row.name) })) };
};

export const actions: Actions = {
	create: async (event) => {
		const { user } = requireWriter(event); const data = await event.request.formData();
		const visibility = visibilitySchema.safeParse(data.get('visibility'));
		if (!visibility.success) return fail(400, { message: 'Choose private or public visibility.' });
		let tags: string[]; try { tags = parseTags(data.get('tags')); } catch (cause) { return fail(400, { message: cause instanceof Error ? cause.message : 'Invalid tags.' }); }
		const db = getDb(event.platform!.env.DB);
		try {
			const created = await createPersonalLink(db, user.id, { url: String(data.get('url') ?? ''), title: String(data.get('title') ?? ''), description: String(data.get('description') ?? ''), visibility: visibility.data });
			await replaceLinkTags(db, created.id, tags);
			try { await event.platform!.env.METADATA_QUEUE.send({ version: 1, linkId: created.id, generation: created.generation }, { contentType: 'json' }); }
			catch { return { message: 'Link saved. Metadata is waiting for a manual retry.' }; }
			return { created: true };
		} catch (cause) {
			const message = cause instanceof Error ? cause.message : '';
			return fail(message.includes('UNIQUE') ? 409 : 400, { message: message.includes('UNIQUE') ? 'link already exists' : message || 'Unable to save this link.' });
		}
	},
	edit: async (event) => {
		const { user } = requireWriter(event); const data = await event.request.formData(); const id = String(data.get('id') ?? '');
		const title = String(data.get('title') ?? '').trim(); const description = String(data.get('description') ?? '').trim();
		const visibility = visibilitySchema.safeParse(data.get('visibility'));
		if (!title || title.length > 300 || description.length > 2_000 || !visibility.success) return fail(400, { message: 'Check the title, description, and visibility.' });
		let tags: string[]; try { tags = parseTags(data.get('tags')); } catch (cause) { return fail(400, { message: cause instanceof Error ? cause.message : 'Invalid tags.' }); }
		const db = getDb(event.platform!.env.DB); const existing = await db.select().from(link).where(and(eq(link.id, id), eq(link.ownerUserId, user.id))).limit(1);
		if (!existing[0]) return fail(404, { message: 'Link not found.' });
		await db.update(link).set({ title, description, visibility: visibility.data, titleManuallyEdited: true, descriptionManuallyEdited: true, publishedAt: visibility.data === 'public' ? (existing[0].publishedAt ?? new Date()) : existing[0].publishedAt }).where(eq(link.id, id));
		await replaceLinkTags(db, id, tags); return { saved: true };
	},
	delete: async (event) => {
		const { user } = requireWriter(event); const data = await event.request.formData();
		await getDb(event.platform!.env.DB).delete(link).where(and(eq(link.id, String(data.get('id') ?? '')), eq(link.ownerUserId, user.id)));
		return { deleted: true };
	},
	retry: async (event) => {
		const { user } = requireWriter(event); const data = await event.request.formData(); const db = getDb(event.platform!.env.DB);
		const id = String(data.get('id') ?? ''); const retried = await retryMetadata(db, user.id, id);
		if (!retried) return fail(404, { message: 'Link not found.' });
		await event.platform!.env.METADATA_QUEUE.send({ version: 1, linkId: id, generation: retried.generation }, { contentType: 'json' });
		return { retried: true };
	}
};
