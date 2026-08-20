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
	let visibility = $state('private');
</script>
<svelte:head><title>My lists · LinkGarden</title><meta name="robots" content="noindex" /></svelte:head>
<section>
	<form class="max-w-prose" method="post" action="?/create" use:enhance>
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
			{#if form?.message}<p class="text-sm text-danger">{form.message}</p>{/if}
			<Button type="submit" class="justify-self-start">Create list</Button>
		</Field.FieldGroup>
	</form>
</section>

<section class="mt-14">
	<h2 class="font-sans text-xs font-medium tracking-[0.1em] text-ink-muted uppercase">
		Your collections
	</h2>
	<ol class="mt-4 divide-y divide-hairline border-t border-hairline">
		{#each data.lists as item}
			<li class="py-4">
				<h3 class="text-lg"><a href={'/app/lists/' + item.id}>{item.title}</a></h3>
				<p class="mt-1 text-ink-muted">{item.description || 'No description yet.'}</p>
				<p class="mt-1 font-sans text-sm text-ink-muted">
					{item.visibility} · {item.isOwner ? 'Owner' : 'Editor'}
				</p>
			</li>
		{:else}<li class="py-4 text-ink-muted">No lists yet.</li>{/each}
	</ol>
</section>
