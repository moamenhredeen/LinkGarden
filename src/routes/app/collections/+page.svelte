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
	import PlusIcon from 'phosphor-svelte/lib/Plus';

	let { data, form }: { data: PageServerData; form: ActionData } = $props();

	const visibilityLabels: Record<string, string> = { private: 'Private', public: 'Public' };
	let visibility = $state('private');
	let createOpen = $state(false);

	function afterSubmit(onSuccess: () => void): SubmitFunction {
		return () => {
			return async ({ result, update }) => {
				await update();
				if (result.type === 'success') onSuccess();
			};
		};
	}
</script>

<svelte:head><title>My collections · LinkGarden</title><meta name="robots" content="noindex" /></svelte:head>

<section class="flex items-center justify-between gap-4">
	<h1 class="font-sans text-xs font-medium tracking-[0.1em] text-ink-muted uppercase">
		Your collections
	</h1>
	<Button onclick={() => (createOpen = true)}>
		<PlusIcon data-icon="inline-start" />
		New collection
	</Button>
</section>

<section class="mt-6">
	<ol class="divide-y divide-hairline border-t border-hairline">
		{#each data.collections as item}
			<li class="py-4">
				<h3 class="text-lg"><a href={'/app/collections/' + item.id}>{item.title}</a></h3>
				<p class="mt-1 text-ink-muted">{item.description || 'No description yet.'}</p>
				<p class="mt-1 font-sans text-sm text-ink-muted">
					{item.visibility} · {item.isOwner ? 'Owner' : 'Editor'}
				</p>
			</li>
		{:else}<li class="py-4 text-ink-muted">No collections yet.</li>{/each}
	</ol>
</section>

<Dialog.Root bind:open={createOpen}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>New collection</Dialog.Title>
		</Dialog.Header>
		<form method="post" action="?/create" use:enhance={afterSubmit(() => (createOpen = false))}>
			<Field.FieldGroup>
				<Field.Field>
					<Field.FieldLabel for="title">Title</Field.FieldLabel>
					<Input id="title" required maxlength={120} name="title" />
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel for="slug">Permanent slug</Field.FieldLabel>
					<Input
						id="slug"
						required
						maxlength={80}
						pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
						name="slug"
						placeholder="independent-web"
					/>
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel for="description">Description</Field.FieldLabel>
					<Textarea id="description" maxlength={2000} name="description"></Textarea>
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel for="visibility">Visibility</Field.FieldLabel>
					<Select.Root type="single" name="visibility" bind:value={visibility}>
						<Select.Trigger id="visibility" class="w-full">
							{visibilityLabels[visibility]}
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
				<Button type="submit">Create collection</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
