<script lang="ts">
	import { enhance } from '$app/forms'; import type { ActionData, PageServerData } from './$types';
	let { data, form }: { data: PageServerData; form: ActionData } = $props();
</script>
<svelte:head><title>My links · LinkGarden</title><meta name="robots" content="noindex" /></svelte:head>
<section>
	<h1 class="text-2xl">My links</h1>
	<p class="mt-2 text-ink-muted">
		Save a link now; LinkGarden will fill in its page details in the background.
	</p>
	<form class="mt-6 grid max-w-prose gap-4 border-t border-hairline pt-6" method="post" action="?/create" use:enhance>
		<label class="grid gap-1"
			>URL <input required type="url" name="url" placeholder="https://example.com/" /></label
		>
		<label class="grid gap-1">Title (optional) <input maxlength="300" name="title" /></label>
		<label class="grid gap-1"
			>Description (optional) <textarea maxlength="2000" name="description"></textarea></label
		>
		<label class="grid gap-1">Tags, separated by commas <input name="tags" /></label>
		<label class="grid gap-1"
			>Visibility <select name="visibility"
				><option value="private">Private</option><option value="public">Public</option></select
			></label
		>
		<button type="submit" class="justify-self-start">Save link</button>
	</form>
	{#if form?.message}<p class="mt-4 text-sm text-danger" role="alert">{form.message}</p>{/if}
</section>

<section class="mt-14">
	<h2 class="font-sans text-xs font-medium tracking-[0.1em] text-ink-muted uppercase">
		Saved links
	</h2>
	<div class="mt-4 divide-y divide-hairline border-t border-hairline">
		{#each data.links as item}
			<article class="py-6">
				<form class="grid max-w-prose gap-4" method="post" action="?/edit" use:enhance>
					<input type="hidden" name="id" value={item.id} />
					<label class="grid gap-1"
						>Title <input required maxlength="300" name="title" value={item.title} /></label
					>
					<label class="grid gap-1"
						>Description <textarea maxlength="2000" name="description">{item.description}</textarea
						></label
					>
					<label class="grid gap-1">Tags <input name="tags" value={item.tags.join(', ')} /></label>
					<label class="grid gap-1"
						>Visibility <select name="visibility" value={item.visibility ?? 'private'}
							><option value="private">Private</option><option value="public">Public</option
							></select
						></label
					>
					<p class="font-sans text-sm text-ink-muted">
						<a href={item.normalizedUrl} rel="noreferrer">{item.normalizedUrl}</a> · Metadata: {item.metadataStatus}{item.moderationState ===
						'hidden'
							? ' · Hidden by moderation'
							: ''}
					</p>
					<button type="submit" class="justify-self-start">Save changes</button>
				</form>
				<div class="mt-3 flex gap-3">
					{#if item.metadataStatus === 'failed'}<form method="post" action="?/retry" use:enhance
							><input type="hidden" name="id" value={item.id} /><button
								type="submit"
								class="border border-ink-muted bg-transparent text-ink">Retry metadata</button
							></form
						>{/if}
					<form method="post" action="?/delete" use:enhance
						><input type="hidden" name="id" value={item.id} /><button
							type="submit"
							class="bg-danger">Delete</button
						></form
					>
				</div>
			</article>
		{:else}<p class="py-6 text-ink-muted">No links yet.</p>{/each}
	</div>
</section>
