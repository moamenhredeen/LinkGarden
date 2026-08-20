<script lang="ts">
	import { enhance } from '$app/forms';
	import { untrack } from 'svelte';
	import type { ActionData, PageServerData } from './$types';
	import * as Field from '$lib/components/ui/field/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Button } from '$lib/components/ui/button/index.js';

	let { data, form }: { data: PageServerData; form: ActionData } = $props();
	function moved(index: number, delta: number) { const ids = data.links.map((item) => item.id); const target = index + delta; if (target < 0 || target >= ids.length) return ids.join(','); [ids[index], ids[target]] = [ids[target], ids[index]]; return ids.join(','); }

	const visibilityLabels: Record<string, string> = { private: 'Private', public: 'Public' };
	let detailsVisibility = $state(untrack(() => data.collection.visibility));
	let personalLinkId = $state(untrack(() => data.personalLinks[0]?.id ?? ''));
	const personalLinkTitle = $derived(
		data.personalLinks.find((item) => item.id === personalLinkId)?.title ?? ''
	);
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
		<form class="mt-4 max-w-prose" method="post" action="?/details" use:enhance>
			<Field.FieldGroup>
				<Field.Field>
					<Field.FieldLabel for="title">Title</Field.FieldLabel>
					<Input id="title" required maxlength={120} name="title" value={data.collection.title} />
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel for="description">Description</Field.FieldLabel>
					<Textarea id="description" maxlength={2000} name="description" value={data.collection.description} />
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel for="visibility">Visibility</Field.FieldLabel>
					<Select.Root type="single" name="visibility" bind:value={detailsVisibility}>
						<Select.Trigger id="visibility" class="w-full">
							{visibilityLabels[detailsVisibility]}
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="private" label="Private" />
							<Select.Item value="public" label="Public" />
						</Select.Content>
					</Select.Root>
				</Field.Field>
				<p class="font-sans text-sm text-ink-muted">Permanent slug: {data.collection.slug}</p>
				<Button type="submit" class="justify-self-start">Save list</Button>
			</Field.FieldGroup>
		</form>
	</section>
{/if}

<section class="mt-10 border-t border-hairline pt-6">
	<h2 class="font-sans text-xs font-medium tracking-[0.1em] text-ink-muted uppercase">
		Add a URL
	</h2>
	<form class="mt-4 max-w-prose" method="post" action="?/add" use:enhance>
		<Field.FieldGroup>
			<Field.Field>
				<Field.FieldLabel for="add-url">URL</Field.FieldLabel>
				<Input id="add-url" required type="url" name="url" />
			</Field.Field>
			<Field.Field>
				<Field.FieldLabel for="add-title">Title (optional)</Field.FieldLabel>
				<Input id="add-title" maxlength={300} name="title" />
			</Field.Field>
			<Field.Field>
				<Field.FieldLabel for="add-description">Description</Field.FieldLabel>
				<Textarea id="add-description" maxlength={2000} name="description"></Textarea>
			</Field.Field>
			<Field.Field>
				<Field.FieldLabel for="add-tags">Tags</Field.FieldLabel>
				<Input id="add-tags" name="tags" />
			</Field.Field>
			<Button type="submit" class="justify-self-start">Add to list</Button>
		</Field.FieldGroup>
	</form>
	{#if data.personalLinks.length}
		<form class="mt-4 max-w-prose" method="post" action="?/copy" use:enhance>
			<Field.FieldGroup>
				<Field.Field>
					<Field.FieldLabel for="personalLinkId">Or copy one of your personal links</Field.FieldLabel>
					<Select.Root type="single" name="personalLinkId" bind:value={personalLinkId}>
						<Select.Trigger id="personalLinkId" class="w-full">
							{personalLinkTitle}
						</Select.Trigger>
						<Select.Content>
							{#each data.personalLinks as item (item.id)}
								<Select.Item value={item.id} label={item.title} />
							{/each}
						</Select.Content>
					</Select.Root>
				</Field.Field>
				<Button type="submit" variant="outline" class="justify-self-start">Copy into list</Button>
			</Field.FieldGroup>
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
				<form class="max-w-prose" method="post" action="?/editLink" use:enhance>
					<input type="hidden" name="linkId" value={item.id} />
					<Field.FieldGroup>
						<Field.Field>
							<Field.FieldLabel for={'link-title-' + item.id}>Title</Field.FieldLabel>
							<Input id={'link-title-' + item.id} required maxlength={300} name="title" value={item.title} />
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel for={'link-description-' + item.id}>Description</Field.FieldLabel>
							<Textarea id={'link-description-' + item.id} maxlength={2000} name="description" value={item.description} />
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel for={'link-tags-' + item.id}>Tags</Field.FieldLabel>
							<Input id={'link-tags-' + item.id} name="tags" value={item.tags.join(', ')} />
						</Field.Field>
						<p class="font-sans text-sm text-ink-muted">
							<a href={item.normalizedUrl} rel="noreferrer">{item.normalizedUrl}</a> · {item.metadataStatus}
						</p>
						<Button type="submit" class="justify-self-start">Save link</Button>
					</Field.FieldGroup>
				</form>
				<div class="mt-3 flex gap-3">
					{#if index > 0}<form method="post" action="?/reorder" use:enhance
							><input type="hidden" name="orderedIds" value={moved(index, -1)} /><Button
								type="submit"
								variant="outline"
								size="icon-sm"
								aria-label={'Move ' + item.title + ' up'}>↑</Button
							></form
						>{/if}
					{#if index < data.links.length - 1}<form method="post" action="?/reorder" use:enhance
							><input type="hidden" name="orderedIds" value={moved(index, 1)} /><Button
								type="submit"
								variant="outline"
								size="icon-sm"
								aria-label={'Move ' + item.title + ' down'}>↓</Button
							></form
						>{/if}
					<form method="post" action="?/removeLink" use:enhance
						><input type="hidden" name="linkId" value={item.id} /><Button
							type="submit"
							variant="destructive">Remove</Button
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
							><input type="hidden" name="userId" value={member.userId} /><Button
								type="submit"
								variant="outline">Remove</Button
							></form
						>
						<form method="post" action="?/transfer" use:enhance
							><input type="hidden" name="userId" value={member.userId} /><Button type="submit"
								>Transfer ownership</Button
							></form
						>
					</span>
				{/if}
			</li>
		{:else}<li class="py-3 text-ink-muted">No editors.</li>{/each}
	</ul>
	{#if data.isOwner}
		<form class="mt-4 flex flex-wrap items-end gap-3" method="post" action="?/invite" use:enhance>
			<Field.Field>
				<Field.FieldLabel for="recipient">Invite by username or email</Field.FieldLabel>
				<Input id="recipient" required name="recipient" />
			</Field.Field>
			<Button type="submit">Invite editor</Button>
		</form>
		{#each data.invitations as invitation}
			<div class="mt-2 flex items-center gap-3 font-sans text-sm text-ink-muted">
				<span>Pending: {invitation.recipientEmail ?? invitation.recipientUserId}</span>
				<form method="post" action="?/revoke" use:enhance
					><input type="hidden" name="invitationId" value={invitation.id} /><Button
						type="submit"
						variant="outline">Revoke</Button
					></form
				>
			</div>
		{/each}
	{:else}
		<form class="mt-4" method="post" action="?/leave"
			><Button type="submit" variant="destructive">Leave list</Button></form
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
			><Button type="submit" variant="destructive">Delete list</Button></form
		>
	</section>
{/if}
