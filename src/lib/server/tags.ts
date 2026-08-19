import { eq, inArray } from 'drizzle-orm';
import type { getDb } from '$lib/server/db';
import { linkTag, tag } from '$lib/server/db/schema';
import { normalizeTagName, tagNameSchema } from '$lib/domain';

type Db = ReturnType<typeof getDb>;

export function parseTags(value: FormDataEntryValue | null): string[] {
	const names = String(value ?? '').split(',').map((name) => name.trim()).filter(Boolean);
	if (names.length > 12) throw new Error('Use at most 12 tags.');
	const unique = new Map<string, string>();
	for (const name of names) {
		tagNameSchema.parse(name);
		unique.set(normalizeTagName(name), name);
	}
	return [...unique.values()];
}

export async function replaceLinkTags(db: Db, linkId: string, names: string[]): Promise<void> {
	await db.delete(linkTag).where(eq(linkTag.linkId, linkId));
	if (!names.length) return;
	for (const name of names) {
		await db.insert(tag).values({ name, normalizedName: normalizeTagName(name) }).onConflictDoNothing();
	}
	const normalized = names.map(normalizeTagName);
	const tagRows = await db.select({ id: tag.id }).from(tag).where(inArray(tag.normalizedName, normalized));
	if (tagRows.length) await db.insert(linkTag).values(tagRows.map((row) => ({ linkId, tagId: row.id }))).onConflictDoNothing();
}
