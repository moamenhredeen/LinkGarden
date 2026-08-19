<script lang="ts">import { enhance } from '$app/forms'; import type { ActionData, PageServerData } from './$types'; let { data, form }: { data: PageServerData; form: ActionData } = $props();</script><svelte:head><title>Reports · LinkGarden admin</title><meta name="robots" content="noindex" /></svelte:head><h1 class="text-2xl">Content reports</h1>
{#if form?.message}<p class="mt-4 text-sm text-danger">{form.message}</p>{/if}
<div class="mt-6 divide-y divide-hairline border-t border-hairline">
	{#each data.reports as row}
		<article class="py-6">
			<p class="font-sans text-xs font-medium tracking-[0.1em] text-ink-muted uppercase">
				{row.report.status}
			</p>
			<h2 class="mt-1 text-lg">{row.linkTitle ?? row.listTitle ?? 'Deleted content'}</h2>
			<p class="mt-1 text-ink-muted">
				Reason: {row.report.reason}{row.report.explanation ? ` — ${row.report.explanation}` : ''}
			</p>
			<p class="mt-1 font-sans text-sm text-ink-muted">
				Reported by {row.reporterUsername ? '@' + row.reporterUsername : 'deleted user'} on {row.report.createdAt.toLocaleString()}.
			</p>
			{#if row.report.status === 'open'}
				<div class="mt-3 flex gap-3">
					<form method="post" action="?/dismiss" use:enhance
						><input type="hidden" name="id" value={row.report.id} /><button
							type="submit"
							class="border border-ink-muted bg-transparent text-ink">Dismiss</button
						></form
					>
					<form method="post" action="?/hide" use:enhance
						><input type="hidden" name="id" value={row.report.id} /><button
							type="submit"
							class="bg-danger">Hide content</button
						></form
					>
				</div>
			{:else if (row.report.targetLinkId && row.linkState === 'hidden') || (row.report.targetListId && row.listState === 'hidden')}
				<form class="mt-3" method="post" action="?/restore" use:enhance
					><input
						type="hidden"
						name="type"
						value={row.report.targetLinkId ? 'link' : 'list'}
					/><input
						type="hidden"
						name="targetId"
						value={row.report.targetLinkId ?? row.report.targetListId ?? ''}
					/><button type="submit">Restore content</button></form
				>
			{/if}
		</article>
	{:else}<p class="py-6 text-ink-muted">No reports.</p>{/each}
</div>
