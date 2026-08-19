<script lang="ts">import { enhance } from '$app/forms'; import type { ActionData, PageServerData } from './$types'; let { data, form }: { data: PageServerData; form: ActionData } = $props();</script><svelte:head><title>Account settings · LinkGarden</title><meta name="robots" content="noindex" /></svelte:head><p class="font-sans text-sm"><a href="/settings/profile">← Profile settings</a></p>
<h1 class="mt-2 text-2xl">Account settings</h1>
<section class="mt-10 border-t border-hairline pt-6">
	<h2 class="font-sans text-xs font-medium tracking-[0.1em] text-danger uppercase">
		Delete account
	</h2>
	{#if data.blockers.length}
		<p class="mt-2 text-ink-muted">
			Deletion is blocked until you transfer or delete these public or shared lists:
		</p>
		<ul class="mt-2 list-disc pl-5 text-ink-muted">
			{#each data.blockers as item}
				<li><a href={'/app/lists/' + item.id}>{item.title}</a> ({item.visibility})</li>
			{/each}
		</ul>
	{:else}
		<p class="mt-2 text-ink-muted">
			Your private unshared lists and personal links will be deleted. Links you added to other
			people’s lists remain without your attribution.
		</p>
		<form class="mt-4 grid max-w-sm gap-4" method="post" action="?/deleteAccount" use:enhance>
			<label class="grid gap-1"
				>Confirm your password <input
					required
					type="password"
					name="password"
					autocomplete="current-password"
				/></label
			>
			{#if form?.message}<p class="text-sm text-danger">{form.message}</p>{/if}
			<button type="submit" class="justify-self-start bg-danger">Permanently delete account</button>
		</form>
	{/if}
</section>
