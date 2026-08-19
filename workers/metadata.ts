/// <reference types="@cloudflare/workers-types" />

import { and, eq, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';

import type { MetadataJob } from '../src/lib/domain';
import { link } from '../src/lib/server/db/schema';
import { assertSafeMetadataUrl } from '../src/lib/url';

const MAX_HTML_BYTES = 1_000_000;

class TerminalMetadataError extends Error {}

async function readLimitedText(response: Response): Promise<string> {
	if (!response.body) return '';
	const reader = response.body.getReader();
	const decoder = new TextDecoder();
	let size = 0;
	let result = '';
	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			size += value.byteLength;
			if (size > MAX_HTML_BYTES) throw new TerminalMetadataError('Page metadata response is too large');
			result += decoder.decode(value, { stream: true });
		}
		return result + decoder.decode();
	} finally {
		await reader.cancel().catch(() => undefined);
	}
}

function clean(value: string | undefined): string | undefined {
	return value?.replace(/\s+/g, ' ').trim().slice(0, 2_000) || undefined;
}

function extractMetadata(html: string): { title?: string; description?: string } {
	const title = clean(html.match(/<title(?:\s[^>]*)?>([\s\S]*?)<\/title>/i)?.[1]);
	const description = clean(
		html.match(/<meta\s+(?:[^>]*?name=["']description["'][^>]*?content=["']([^"']*)["']|[^>]*?content=["']([^"']*)["'][^>]*?name=["']description["'])[^>]*>/i)?.slice(1).find(Boolean)
	);
	return { title, description };
}

async function fetchPage(urlValue: string): Promise<{ title?: string; description?: string }> {
	let url = assertSafeMetadataUrl(urlValue);
	for (let redirects = 0; redirects <= 3; redirects += 1) {
		const response = await fetch(url, {
			redirect: 'manual',
			headers: { 'user-agent': 'LinkGarden metadata bot/1.0', accept: 'text/html,application/xhtml+xml' },
			signal: AbortSignal.timeout(10_000)
		});
		if (response.status >= 300 && response.status < 400) {
			const location = response.headers.get('location');
			if (!location || redirects === 3) throw new TerminalMetadataError('Too many or invalid redirects');
			url = assertSafeMetadataUrl(new URL(location, url).toString());
			continue;
		}
		if (!response.ok) {
			if (response.status === 408 || response.status === 429 || response.status >= 500) throw new Error(`Transient upstream status ${response.status}`);
			throw new TerminalMetadataError(`Upstream status ${response.status}`);
		}
		const contentType = response.headers.get('content-type')?.toLocaleLowerCase('en-US') ?? '';
		if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) throw new TerminalMetadataError('The URL did not return HTML');
		return extractMetadata(await readLimitedText(response));
	}
	throw new TerminalMetadataError('Metadata redirect limit reached');
}

async function markFailed(db: ReturnType<typeof drizzle>, job: MetadataJob): Promise<void> {
	await db.update(link).set({ metadataStatus: 'failed', metadataAttemptedAt: new Date(), metadataRetryAt: null })
		.where(and(eq(link.id, job.linkId), eq(link.metadataGeneration, job.generation)));
}

export default {
	async queue(batch: MessageBatch<MetadataJob>, env: { DB: D1Database }): Promise<void> {
		const db = drizzle(env.DB);
		for (const message of batch.messages) {
			const job = message.body;
			try {
				if (job.version !== 1) throw new TerminalMetadataError('Unknown metadata job version');
				const current = await db.select().from(link).where(and(eq(link.id, job.linkId), eq(link.metadataGeneration, job.generation))).limit(1);
				if (!current[0] || current[0].metadataStatus !== 'pending') { message.ack(); continue; }
				const metadata = await fetchPage(current[0].normalizedUrl);
				await db.update(link).set({
					title: sql`case when ${link.titleManuallyEdited} = 0 then coalesce(${metadata.title ?? null}, ${link.title}) else ${link.title} end`,
					description: sql`case when ${link.descriptionManuallyEdited} = 0 then coalesce(${metadata.description ?? null}, ${link.description}) else ${link.description} end`,
					metadataStatus: 'ready', metadataAttemptedAt: new Date(), metadataRetryAt: null
				}).where(and(eq(link.id, job.linkId), eq(link.metadataGeneration, job.generation)));
				message.ack();
			} catch (cause) {
				const terminal = cause instanceof TerminalMetadataError || message.attempts >= 3;
				console.error(JSON.stringify({ event: 'metadata_failed', linkId: job.linkId, generation: job.generation, terminal, message: cause instanceof Error ? cause.message : String(cause) }));
				if (terminal) { await markFailed(db, job); message.ack(); }
				else {
					await db.update(link).set({ metadataAttemptedAt: new Date(), metadataRetryAt: new Date(Date.now() + 60_000) })
						.where(and(eq(link.id, job.linkId), eq(link.metadataGeneration, job.generation)));
					message.retry({ delaySeconds: 60 });
				}
			}
		}
	}
} satisfies ExportedHandler<{ DB: D1Database }, MetadataJob>;
