<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageServerData } from './$types';
	import * as Field from '$lib/components/ui/field/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	let { data, form }: { data: PageServerData; form: ActionData } = $props();
</script>
<svelte:head><title>Profile settings · LinkGarden</title><meta name="robots" content="noindex" /></svelte:head>
<p class="font-sans text-sm"><a href="/settings/account">Account settings</a></p>
<section class="mt-2">
	<h1 class="text-2xl">Profile settings</h1>
	<p class="mt-2 text-ink-muted">
		Your permanent profile: <a href={'/@' + data.profile.username}>/@{data.profile.username}</a>
	</p>
	<form class="mt-6 max-w-prose border-t border-hairline pt-6" method="post" use:enhance>
		<Field.FieldGroup>
			<Field.Field>
				<Field.FieldLabel for="displayName">Display name</Field.FieldLabel>
				<Input id="displayName" required maxlength={80} name="displayName" value={data.profile.displayName} />
			</Field.Field>
			<Field.Field>
				<Field.FieldLabel for="bio">Bio</Field.FieldLabel>
				<Textarea id="bio" maxlength={500} name="bio" value={data.profile.bio ?? ''} />
			</Field.Field>
			<Field.Field>
				<Field.FieldLabel for="avatarUrl">Avatar URL</Field.FieldLabel>
				<Input id="avatarUrl" type="url" name="avatarUrl" value={data.profile.avatarUrl ?? ''} />
			</Field.Field>
			{#if form?.saved}<p class="text-sm text-brand">Profile saved.</p>{/if}
			{#if form?.message}<p class="text-sm text-danger">{form.message}</p>{/if}
			<Button type="submit" class="justify-self-start">Save profile</Button>
		</Field.FieldGroup>
	</form>
</section>
