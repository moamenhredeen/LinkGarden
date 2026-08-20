<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageServerData } from './$types';
	import * as Field from '$lib/components/ui/field/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	let { data, form }: { data: PageServerData; form: ActionData } = $props();
</script>
<svelte:head><title>Choose your profile · LinkGarden</title><meta name="robots" content="noindex" /></svelte:head>
<section class="max-w-sm">
	<h1 class="text-2xl">Choose your public identity</h1>
	<p class="mt-2 text-ink-muted">Your username becomes your permanent profile address.</p>
	<form class="mt-6 border-t border-hairline pt-6" method="post" use:enhance>
		<Field.FieldGroup>
			<Field.Field>
				<Field.FieldLabel for="username">Username</Field.FieldLabel>
				<Input id="username" required minlength={3} maxlength={30} name="username" autocomplete="username" />
			</Field.Field>
			<Field.Field>
				<Field.FieldLabel for="displayName">Display name</Field.FieldLabel>
				<Input id="displayName" required maxlength={80} name="displayName" value={data.displayName} />
			</Field.Field>
			{#if form?.message}<p class="text-sm text-danger">{form.message}</p>{/if}
			<Button type="submit" class="justify-self-start">Create profile</Button>
		</Field.FieldGroup>
	</form>
</section>
