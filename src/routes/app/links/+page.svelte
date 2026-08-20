<script lang="ts">
	import { enhance } from '$app/forms';
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

	let { data, form }: { data: PageServerData; form: ActionData } = $props();

	type LinkItem = PageServerData['links'][number];

	const visibilityLabels: Record<string, string> = { private: 'Private', public: 'Public' };

	let createOpen = $state(false);
	let createVisibility = $state('private');

	let editingLink = $state<LinkItem | null>(null);
	let editVisibility = $state('private');

	let deletingLink = $state<LinkItem | null>(null);

	function openEdit(item: LinkItem) {
		editingLink = item;
		editVisibility = item.visibility ?? 'private';
	}

	function afterSubmit(onSuccess: () => void): SubmitFunction {
		return () => {
			return async ({ result, update }) => {
				await update();
				if (result.type === 'success') onSuccess();
			};
		};
	}
</script>

<svelte:head><title>My links · LinkGarden</title><meta name="robots" content="noindex" /></svelte:head>

<section class="flex items-center justify-between gap-4">
	<div>
		<h1 class="font-sans text-xs font-medium tracking-[0.1em] text-ink-muted uppercase">
			Saved links
		</h1>
		<p class="mt-1 text-ink-muted">
			Save a link now; LinkGarden will fill in its page details in the background.
		</p>
	</div>
	<Button onclick={() => (createOpen = true)}>
		<PlusIcon data-icon="inline-start" />
		New link
	</Button>
</section>

<section class="mt-6 divide-y divide-hairline border-t border-hairline">
	{#each data.links as item (item.id)}
		{@const itemVisibility = item.visibility ?? 'private'}
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
					{visibilityLabels[itemVisibility]}{item.tags.length
						? ' · ' + item.tags.join(', ')
						: ''} · Metadata: {item.metadataStatus}{item.moderationState === 'hidden'
						? ' · Hidden by moderation'
						: ''}
				</p>
				{#if item.metadataStatus === 'failed'}
					<form class="mt-2" method="post" action="?/retry" use:enhance>
						<input type="hidden" name="id" value={item.id} />
						<Button type="submit" variant="outline" size="sm">Retry metadata</Button>
					</form>
				{/if}
			</div>
			<div class="flex shrink-0 gap-2">
				<Button
					variant="ghost"
					size="icon-sm"
					onclick={() => openEdit(item)}
					aria-label="Edit link"
				>
					<PencilSimpleIcon />
				</Button>
				<Button
					variant="ghost"
					size="icon-sm"
					onclick={() => (deletingLink = item)}
					aria-label="Delete link"
				>
					<XIcon />
				</Button>
			</div>
		</article>
	{:else}
		<p class="py-6 text-ink-muted">No links yet.</p>
	{/each}
</section>

<Dialog.Root bind:open={createOpen}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>New link</Dialog.Title>
			<Dialog.Description>
				Save a link now; LinkGarden will fill in its page details in the background.
			</Dialog.Description>
		</Dialog.Header>
		<form
			method="post"
			action="?/create"
			use:enhance={afterSubmit(() => (createOpen = false))}
		>
			<Field.FieldGroup>
				<Field.Field>
					<Field.FieldLabel for="url">URL</Field.FieldLabel>
					<Input id="url" required type="url" name="url" placeholder="https://example.com/" />
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel for="title">Title (optional)</Field.FieldLabel>
					<Input id="title" maxlength={300} name="title" />
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel for="description">Description (optional)</Field.FieldLabel>
					<Textarea id="description" maxlength={2000} name="description"></Textarea>
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel for="tags">Tags, separated by commas</Field.FieldLabel>
					<Input id="tags" name="tags" />
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel for="visibility">Visibility</Field.FieldLabel>
					<Select.Root type="single" name="visibility" bind:value={createVisibility}>
						<Select.Trigger id="visibility" class="w-full">
							{visibilityLabels[createVisibility]}
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="private" label="Private" />
							<Select.Item value="public" label="Public" />
						</Select.Content>
					</Select.Root>
				</Field.Field>
			</Field.FieldGroup>
			{#if form?.message}<p class="mt-4 text-sm text-danger" role="alert">{form.message}</p>{/if}
			<Dialog.Footer class="mt-6">
				<Button type="submit">Save link</Button>
			</Dialog.Footer>
		</form>
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
				action="?/edit"
				use:enhance={afterSubmit(() => (editingLink = null))}
			>
				<input type="hidden" name="id" value={editingLink.id} />
				<Field.FieldGroup>
					<Field.Field>
						<Field.FieldLabel for="edit-title">Title</Field.FieldLabel>
						<Input id="edit-title" required maxlength={300} name="title" value={editingLink.title} />
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel for="edit-description">Description</Field.FieldLabel>
						<Textarea
							id="edit-description"
							maxlength={2000}
							name="description"
							value={editingLink.description}
						/>
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel for="edit-tags">Tags</Field.FieldLabel>
						<Input id="edit-tags" name="tags" value={editingLink.tags.join(', ')} />
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel for="edit-visibility">Visibility</Field.FieldLabel>
						<Select.Root type="single" name="visibility" bind:value={editVisibility}>
							<Select.Trigger id="edit-visibility" class="w-full">
								{visibilityLabels[editVisibility]}
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="private" label="Private" />
								<Select.Item value="public" label="Public" />
							</Select.Content>
						</Select.Root>
					</Field.Field>
				</Field.FieldGroup>
				{#if form?.message}<p class="mt-4 text-sm text-danger" role="alert">{form.message}</p>{/if}
				<Dialog.Footer class="mt-6">
					<Button type="submit">Save changes</Button>
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
				<AlertDialog.Title>Delete this link?</AlertDialog.Title>
				<AlertDialog.Description>
					"{deletingLink.title}" will be permanently deleted. This action cannot be undone.
				</AlertDialog.Description>
			</AlertDialog.Header>
			<form
				method="post"
				action="?/delete"
				use:enhance={afterSubmit(() => (deletingLink = null))}
			>
				<input type="hidden" name="id" value={deletingLink.id} />
				<AlertDialog.Footer>
					<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
					<AlertDialog.Action type="submit" variant="destructive">Delete</AlertDialog.Action>
				</AlertDialog.Footer>
			</form>
		{/if}
	</AlertDialog.Content>
</AlertDialog.Root>
