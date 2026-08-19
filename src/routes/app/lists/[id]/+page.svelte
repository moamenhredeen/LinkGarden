<script lang="ts">
	import { enhance } from '$app/forms'; import type { ActionData, PageServerData } from './$types';
	let { data, form }: { data: PageServerData; form: ActionData } = $props();
	function moved(index: number, delta: number) { const ids = data.links.map((item) => item.id); const target = index + delta; if (target < 0 || target >= ids.length) return ids.join(','); [ids[index], ids[target]] = [ids[target], ids[index]]; return ids.join(','); }
</script>
<svelte:head><title>{data.collection.title} · LinkGarden</title><meta name="robots" content="noindex" /></svelte:head>
<p class="font-sans text-sm"><a href="/app/lists">← All lists</a></p>
<h1 class="mt-2 text-2xl">{data.collection.title}</h1>
<p class="mt-1 font-sans text-sm text-ink-muted">
	{data.isOwner ? 'You own this list.' : 'You are an editor.'} · {data.collection.visibility}{data
		.collection.moderationState === 'hidden'
		? ' · Hidden by moderation'
		: ''}
</p>
{#if form?.message}<p class="mt-4 text-sm text-danger" role="alert">{form.message}</p>{/if}

{#if data.isOwner}
	<section class="mt-10 border-t border-hairline pt-6">
		<h2 class="font-sans text-xs font-medium tracking-[0.1em] text-ink-muted uppercase">
			List settings
		</h2>
		<form class="mt-4 grid max-w-prose gap-4" method="post" action="?/details" use:enhance>
			<label class="grid gap-1"
				>Title <input required maxlength="120" name="title" value={data.collection.title} /></label
			>
			<label class="grid gap-1"
				>Description <textarea maxlength="2000" name="description"
					>{data.collection.description}</textarea
				></label
			>
			<label class="grid gap-1"
				>Visibility <select name="visibility" value={data.collection.visibility}
					><option value="private">Private</option><option value="public">Public</option
					></select
				></label
			>
			<p class="font-sans text-sm text-ink-muted">Permanent slug: {data.collection.slug}</p>
			<button type="submit" class="justify-self-start">Save list</button>
		</form>
	</section>
{/if}

<section class="mt-10 border-t border-hairline pt-6">
	<h2 class="font-sans text-xs font-medium tracking-[0.1em] text-ink-muted uppercase">
		Add a URL
	</h2>
	<form class="mt-4 grid max-w-prose gap-4" method="post" action="?/add" use:enhance>
		<label class="grid gap-1">URL <input required type="url" name="url" /></label>
		<label class="grid gap-1">Title (optional) <input maxlength="300" name="title" /></label>
		<label class="grid gap-1">Description <textarea maxlength="2000" name="description"></textarea></label>
		<label class="grid gap-1">Tags <input name="tags" /></label>
		<button type="submit" class="justify-self-start">Add to list</button>
	</form>
	{#if data.personalLinks.length}
		<form class="mt-4 grid max-w-prose gap-4" method="post" action="?/copy" use:enhance>
			<label class="grid gap-1"
				>Or copy one of your personal links
				<select name="personalLinkId"
					>{#each data.personalLinks as item}<option value={item.id}>{item.title}</option
						>{/each}</select
				></label
			>
			<button type="submit" class="justify-self-start border border-ink-muted bg-transparent text-ink"
				>Copy into list</button
			>
		</form>
	{/if}
</section>

<section class="mt-10 border-t border-hairline pt-6">
	<h2 class="font-sans text-xs font-medium tracking-[0.1em] text-ink-muted uppercase">
		Ordered links
	</h2>
	<div class="mt-4 divide-y divide-hairline">
		{#each data.links as item, index}
			<article class="py-6">
				<form class="grid max-w-prose gap-4" method="post" action="?/editLink" use:enhance>
					<input type="hidden" name="linkId" value={item.id} />
					<label class="grid gap-1"
						>Title <input required maxlength="300" name="title" value={item.title} /></label
					>
					<label class="grid gap-1"
						>Description <textarea maxlength="2000" name="description">{item.description}</textarea
						></label
					>
					<label class="grid gap-1">Tags <input name="tags" value={item.tags.join(', ')} /></label>
					<p class="font-sans text-sm text-ink-muted">
						<a href={item.normalizedUrl} rel="noreferrer">{item.normalizedUrl}</a> · {item.metadataStatus}
					</p>
					<button type="submit" class="justify-self-start">Save link</button>
				</form>
				<div class="mt-3 flex gap-3">
					{#if index > 0}<form method="post" action="?/reorder" use:enhance
							><input type="hidden" name="orderedIds" value={moved(index, -1)} /><button
								type="submit"
								class="border border-ink-muted bg-transparent text-ink"
								aria-label={'Move ' + item.title + ' up'}>↑</button
							></form
						>{/if}
					{#if index < data.links.length - 1}<form method="post" action="?/reorder" use:enhance
							><input type="hidden" name="orderedIds" value={moved(index, 1)} /><button
								type="submit"
								class="border border-ink-muted bg-transparent text-ink"
								aria-label={'Move ' + item.title + ' down'}>↓</button
							></form
						>{/if}
					<form method="post" action="?/removeLink" use:enhance
						><input type="hidden" name="linkId" value={item.id} /><button
							type="submit"
							class="bg-danger">Remove</button
						></form
					>
				</div>
			</article>
		{:else}<p class="py-6 text-ink-muted">No links in this list.</p>{/each}
	</div>
</section>

<section class="mt-10 border-t border-hairline pt-6">
	<h2 class="font-sans text-xs font-medium tracking-[0.1em] text-ink-muted uppercase">Editors</h2>
	<ul class="mt-4 divide-y divide-hairline">
		{#each data.members as member}
			<li class="flex items-center justify-between gap-3 py-3">
				<span>{member.displayName} (@{member.username})</span>
				{#if data.isOwner}
					<span class="flex gap-3">
						<form method="post" action="?/removeEditor" use:enhance
							><input type="hidden" name="userId" value={member.userId} /><button
								type="submit"
								class="border border-ink-muted bg-transparent text-ink">Remove</button
							></form
						>
						<form method="post" action="?/transfer" use:enhance
							><input type="hidden" name="userId" value={member.userId} /><button type="submit"
								>Transfer ownership</button
							></form
						>
					</span>
				{/if}
			</li>
		{:else}<li class="py-3 text-ink-muted">No editors.</li>{/each}
	</ul>
	{#if data.isOwner}
		<form class="mt-4 flex flex-wrap items-end gap-3" method="post" action="?/invite" use:enhance>
			<label class="grid gap-1">Invite by username or email <input required name="recipient" /></label>
			<button type="submit">Invite editor</button>
		</form>
		{#each data.invitations as invitation}
			<div class="mt-2 flex items-center gap-3 font-sans text-sm text-ink-muted">
				<span>Pending: {invitation.recipientEmail ?? invitation.recipientUserId}</span>
				<form method="post" action="?/revoke" use:enhance
					><input type="hidden" name="invitationId" value={invitation.id} /><button
						type="submit"
						class="border border-ink-muted bg-transparent text-ink">Revoke</button
					></form
				>
			</div>
		{/each}
	{:else}
		<form class="mt-4" method="post" action="?/leave"
			><button type="submit" class="bg-danger">Leave list</button></form
		>
	{/if}
</section>

{#if data.isOwner}
	<section class="mt-10 border-t border-hairline pt-6">
		<h2 class="font-sans text-xs font-medium tracking-[0.1em] text-danger uppercase">
			Delete list
		</h2>
		<p class="mt-2 text-ink-muted">
			This permanently deletes this list and its independent list links.
		</p>
		<form class="mt-4" method="post" action="?/deleteList"
			><button type="submit" class="bg-danger">Delete list</button></form
		>
	</section>
{/if}
