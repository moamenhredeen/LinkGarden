<script lang="ts">
	import { enhance } from '$app/forms';
	import { untrack } from 'svelte';
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { ActionData, PageServerData } from './$types';
	import * as Field from '$lib/components/ui/field/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import PlusIcon from 'phosphor-svelte/lib/Plus';
	import PencilSimpleIcon from 'phosphor-svelte/lib/PencilSimple';
	import XIcon from 'phosphor-svelte/lib/X';
	import ArrowUpIcon from 'phosphor-svelte/lib/ArrowUp';
	import ArrowDownIcon from 'phosphor-svelte/lib/ArrowDown';

	let { data, form }: { data: PageServerData; form: ActionData } = $props();

	type LinkItem = PageServerData['links'][number];

	function moved(index: number, delta: number) {
		const ids = data.links.map((item) => item.id);
		const target = index + delta;
		if (target < 0 || target >= ids.length) return ids.join(',');
		[ids[index], ids[target]] = [ids[target], ids[index]];
		return ids.join(',');
	}

	const visibilityLabels: Record<string, string> = { private: 'Private', public: 'Public' };
	let detailsVisibility = $state(untrack(() => data.collection.visibility));
	let personalLinkId = $state(untrack(() => data.personalLinks[0]?.id ?? ''));
	const personalLinkTitle = $derived(
		data.personalLinks.find((item) => item.id === personalLinkId)?.title ?? ''
	);

	let addOpen = $state(false);
	let editingLink = $state<LinkItem | null>(null);
	let deletingLink = $state<LinkItem | null>(null);

	function afterSubmit(onSuccess: () => void): SubmitFunction {
		return () => {
			return async ({ result, update }) => {
				await update();
				if (result.type === 'success') onSuccess();
			};
		};
	}
</script>
<svelte:head><title>{data.collection.title} · LinkGarden</title><meta name="robots" content="noindex" /></svelte:head>
<p class="font-sans text-sm"><a href="/app/collections">← All collections</a></p>
<h1 class="mt-2 text-2xl">{data.collection.title}</h1>
<p class="mt-1 font-sans text-sm text-ink-muted">
	{data.isOwner ? 'You own this collection.' : 'You are an editor.'} · {data.collection.visibility}{data
		.collection.moderationState === 'hidden'
		? ' · Hidden by moderation'
		: ''}
</p>
{#if form?.message}<p class="mt-4 text-sm text-danger" role="alert">{form.message}</p>{/if}

{#if data.isOwner}
	<section class="mt-10 border-t border-hairline pt-6">
		<h2 class="font-sans text-xs font-medium tracking-[0.1em] text-ink-muted uppercase">
			Collection settings
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
				<Button type="submit" class="justify-self-start">Save collection</Button>
			</Field.FieldGroup>
		</form>
	</section>
{/if}

<section class="mt-10 border-t border-hairline pt-6">
	<div class="flex items-center justify-between gap-4">
		<h2 class="font-sans text-xs font-medium tracking-[0.1em] text-ink-muted uppercase">
			Ordered links
		</h2>
		<Button onclick={() => (addOpen = true)}>
			<PlusIcon data-icon="inline-start" />
			New link
		</Button>
	</div>
	<div class="mt-4 divide-y divide-hairline">
		{#each data.links as item, index (item.id)}
			<article class="flex items-start justify-between gap-4 py-4">
				<div class="min-w-0">
					<p class="truncate font-medium">{item.title}</p>
					<p class="mt-1 truncate text-sm text-ink-muted">
						<a href={item.normalizedUrl} rel="noreferrer">{item.normalizedUrl}</a>
					</p>
					{#if item.description}
						<p class="mt-1 line-clamp-2 text-sm text-ink-muted">{item.description}</p>
					{/if}
					<p class="mt-2 text-xs text-ink-muted">
						{item.tags.length ? item.tags.join(', ') + ' · ' : ''}{item.metadataStatus}
					</p>
				</div>
				<div class="flex shrink-0 gap-2">
					{#if index > 0}
						<form method="post" action="?/reorder" use:enhance>
							<input type="hidden" name="orderedIds" value={moved(index, -1)} />
							<Button
								type="submit"
								variant="outline"
								size="icon-sm"
								aria-label={'Move ' + item.title + ' up'}
							>
								<ArrowUpIcon />
							</Button>
						</form>
					{/if}
					{#if index < data.links.length - 1}
						<form method="post" action="?/reorder" use:enhance>
							<input type="hidden" name="orderedIds" value={moved(index, 1)} />
							<Button
								type="submit"
								variant="outline"
								size="icon-sm"
								aria-label={'Move ' + item.title + ' down'}
							>
								<ArrowDownIcon />
							</Button>
						</form>
					{/if}
					<Button
						variant="ghost"
						size="icon-sm"
						onclick={() => (editingLink = item)}
						aria-label="Edit link"
					>
						<PencilSimpleIcon />
					</Button>
					<Button
						variant="ghost"
						size="icon-sm"
						onclick={() => (deletingLink = item)}
						aria-label="Remove link"
					>
						<XIcon />
					</Button>
				</div>
			</article>
		{:else}<p class="py-6 text-ink-muted">No links in this collection.</p>{/each}
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
			><Button type="submit" variant="destructive">Leave collection</Button></form
		>
	{/if}
</section>

{#if data.isOwner}
	<section class="mt-10 border-t border-hairline pt-6">
		<h2 class="font-sans text-xs font-medium tracking-[0.1em] text-danger uppercase">
			Delete collection
		</h2>
		<p class="mt-2 text-ink-muted">
			This permanently deletes this collection and its independent collection links.
		</p>
		<form class="mt-4" method="post" action="?/deleteCollection"
			><Button type="submit" variant="destructive">Delete collection</Button></form
		>
	</section>
{/if}

<Dialog.Root bind:open={addOpen}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>New link</Dialog.Title>
		</Dialog.Header>
		<form method="post" action="?/add" use:enhance={afterSubmit(() => (addOpen = false))}>
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
			</Field.FieldGroup>
			<Dialog.Footer class="mt-6">
				<Button type="submit">Add to collection</Button>
			</Dialog.Footer>
		</form>
		{#if data.personalLinks.length}
			<form
				class="mt-6 border-t border-hairline pt-6"
				method="post"
				action="?/copy"
				use:enhance={afterSubmit(() => (addOpen = false))}
			>
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
				</Field.FieldGroup>
				<Dialog.Footer class="mt-6">
					<Button type="submit" variant="outline">Copy into collection</Button>
				</Dialog.Footer>
			</form>
		{/if}
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root
	open={editingLink !== null}
	onOpenChange={(next) => {
		if (!next) editingLink = null;
	}}
>
	<Dialog.Content class="sm:max-w-md">
		{#if editingLink}
			<Dialog.Header>
				<Dialog.Title>Edit link</Dialog.Title>
				<Dialog.Description>
					<a href={editingLink.normalizedUrl} rel="noreferrer">{editingLink.normalizedUrl}</a>
				</Dialog.Description>
			</Dialog.Header>
			<form
				method="post"
				action="?/editLink"
				use:enhance={afterSubmit(() => (editingLink = null))}
			>
				<input type="hidden" name="linkId" value={editingLink.id} />
				<Field.FieldGroup>
					<Field.Field>
						<Field.FieldLabel for="link-title">Title</Field.FieldLabel>
						<Input id="link-title" required maxlength={300} name="title" value={editingLink.title} />
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel for="link-description">Description</Field.FieldLabel>
						<Textarea
							id="link-description"
							maxlength={2000}
							name="description"
							value={editingLink.description}
						/>
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel for="link-tags">Tags</Field.FieldLabel>
						<Input id="link-tags" name="tags" value={editingLink.tags.join(', ')} />
					</Field.Field>
				</Field.FieldGroup>
				<Dialog.Footer class="mt-6">
					<Button type="submit">Save link</Button>
				</Dialog.Footer>
			</form>
		{/if}
	</Dialog.Content>
</Dialog.Root>

<AlertDialog.Root
	open={deletingLink !== null}
	onOpenChange={(next) => {
		if (!next) deletingLink = null;
	}}
>
	<AlertDialog.Content>
		{#if deletingLink}
			<AlertDialog.Header>
				<AlertDialog.Title>Remove this link?</AlertDialog.Title>
				<AlertDialog.Description>
					"{deletingLink.title}" will be removed from this collection. This action cannot be undone.
				</AlertDialog.Description>
			</AlertDialog.Header>
			<form
				method="post"
				action="?/removeLink"
				use:enhance={afterSubmit(() => (deletingLink = null))}
			>
				<input type="hidden" name="linkId" value={deletingLink.id} />
				<AlertDialog.Footer>
					<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
					<AlertDialog.Action type="submit" variant="destructive">Remove</AlertDialog.Action>
				</AlertDialog.Footer>
			</form>
		{/if}
	</AlertDialog.Content>
</AlertDialog.Root>
