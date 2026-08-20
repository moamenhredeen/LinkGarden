<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageServerData } from './$types';
	import * as Field from '$lib/components/ui/field/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Button } from '$lib/components/ui/button/index.js';

	let { data, form }: { data: PageServerData; form: ActionData } = $props();

	const visibilityLabels: Record<string, string> = { private: 'Private', public: 'Public' };
	let createVisibility = $state('private');
</script>
<svelte:head><title>My links · LinkGarden</title><meta name="robots" content="noindex" /></svelte:head>
<section>
	<p class="text-ink-muted">
		Save a link now; LinkGarden will fill in its page details in the background.
	</p>
	<form class="mt-6 max-w-prose border-t border-hairline pt-6" method="post" action="?/create" use:enhance>
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
			<Button type="submit" class="justify-self-start">Save link</Button>
		</Field.FieldGroup>
	</form>
	{#if form?.message}<p class="mt-4 text-sm text-danger" role="alert">{form.message}</p>{/if}
</section>

<section class="mt-14">
	<h2 class="font-sans text-xs font-medium tracking-[0.1em] text-ink-muted uppercase">
		Saved links
	</h2>
	<div class="mt-4 divide-y divide-hairline border-t border-hairline">
		{#each data.links as item}
			{@const itemVisibility = item.visibility ?? 'private'}
			<article class="py-6">
				<form class="max-w-prose" method="post" action="?/edit" use:enhance>
					<input type="hidden" name="id" value={item.id} />
					<Field.FieldGroup>
						<Field.Field>
							<Field.FieldLabel for={'title-' + item.id}>Title</Field.FieldLabel>
							<Input id={'title-' + item.id} required maxlength={300} name="title" value={item.title} />
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel for={'description-' + item.id}>Description</Field.FieldLabel>
							<Textarea id={'description-' + item.id} maxlength={2000} name="description" value={item.description} />
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel for={'tags-' + item.id}>Tags</Field.FieldLabel>
							<Input id={'tags-' + item.id} name="tags" value={item.tags.join(', ')} />
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel for={'visibility-' + item.id}>Visibility</Field.FieldLabel>
							<Select.Root type="single" name="visibility" value={itemVisibility}>
								<Select.Trigger id={'visibility-' + item.id} class="w-full">
									{visibilityLabels[itemVisibility]}
								</Select.Trigger>
								<Select.Content>
									<Select.Item value="private" label="Private" />
									<Select.Item value="public" label="Public" />
								</Select.Content>
							</Select.Root>
						</Field.Field>
						<p class="font-sans text-sm text-ink-muted">
							<a href={item.normalizedUrl} rel="noreferrer">{item.normalizedUrl}</a> · Metadata: {item.metadataStatus}{item.moderationState ===
							'hidden'
								? ' · Hidden by moderation'
								: ''}
						</p>
						<Button type="submit" class="justify-self-start">Save changes</Button>
					</Field.FieldGroup>
				</form>
				<div class="mt-3 flex gap-3">
					{#if item.metadataStatus === 'failed'}<form method="post" action="?/retry" use:enhance
							><input type="hidden" name="id" value={item.id} /><Button type="submit" variant="outline"
								>Retry metadata</Button
							></form
						>{/if}
					<form method="post" action="?/delete" use:enhance
						><input type="hidden" name="id" value={item.id} /><Button type="submit" variant="destructive"
							>Delete</Button
						></form
					>
				</div>
			</article>
		{:else}<p class="py-6 text-ink-muted">No links yet.</p>{/each}
	</div>
</section>
