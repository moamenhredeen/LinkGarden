<script lang="ts">import { enhance } from '$app/forms'; import type { ActionData, PageServerData } from './$types'; let { data, form }: { data: PageServerData; form: ActionData } = $props();</script>
<svelte:head><title>Invitations · LinkGarden</title><meta name="robots" content="noindex" /></svelte:head><h1 class="text-2xl">List invitations</h1>
{#if form?.message}<p class="mt-4 text-sm text-danger">{form.message}</p>{/if}
{#if data.token}
	<section class="mt-6 border-t border-hairline pt-6">
		<h2 class="font-sans text-xs font-medium tracking-[0.1em] text-ink-muted uppercase">
			Email invitation
		</h2>
		<form class="mt-4" method="post" action="?/accept" use:enhance
			><input type="hidden" name="token" value={data.token} /><button type="submit"
				>Accept invitation</button
			></form
		>
	</section>
{/if}
<div class="mt-6 divide-y divide-hairline border-t border-hairline">
	{#each data.invitations as row}
		<article class="py-6">
			<h2 class="text-lg">{row.listTitle}</h2>
			<p class="mt-1 font-sans text-sm text-ink-muted">
				Invited by @{row.ownerUsername}; expires {row.invitation.expiresAt.toLocaleDateString()}.
			</p>
			<div class="mt-3 flex gap-3">
				<form method="post" action="?/accept" use:enhance
					><input type="hidden" name="id" value={row.invitation.id} /><button type="submit"
						>Accept</button
					></form
				>
				<form method="post" action="?/revoke" use:enhance
					><input type="hidden" name="id" value={row.invitation.id} /><button
						type="submit"
						class="border border-ink-muted bg-transparent text-ink">Decline</button
					></form
				>
			</div>
		</article>
	{:else}{#if !data.token}<p class="py-6 text-ink-muted">You have no pending invitations.</p>{/if}{/each}
</div>
