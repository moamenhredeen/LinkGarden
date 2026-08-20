<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageServerData } from './$types';
	import * as Field from '$lib/components/ui/field/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	let { data, form }: { data: PageServerData; form: ActionData } = $props();
</script><svelte:head><title>Account settings · LinkGarden</title><meta name="robots" content="noindex" /></svelte:head><p class="font-sans text-sm"><a href="/settings/profile">← Profile settings</a></p>
<section class="mt-6 border-t border-hairline pt-6">
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
		<form class="mt-4 max-w-sm" method="post" action="?/deleteAccount" use:enhance>
			<Field.FieldGroup>
				<Field.Field>
					<Field.FieldLabel for="password">Confirm your password</Field.FieldLabel>
					<Input id="password" required type="password" name="password" autocomplete="current-password" />
				</Field.Field>
				{#if form?.message}<p class="text-sm text-danger">{form.message}</p>{/if}
				<Button type="submit" variant="destructive" class="justify-self-start"
					>Permanently delete account</Button
				>
			</Field.FieldGroup>
		</form>
	{/if}
</section>
