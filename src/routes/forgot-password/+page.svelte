<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import * as Field from '$lib/components/ui/field/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	let { form }: { form: ActionData } = $props();
</script>
<svelte:head><title>Reset password · LinkGarden</title></svelte:head>
<section class="max-w-sm">
	<h1 class="text-2xl">Reset your password</h1>
	<form class="mt-6 border-t border-hairline pt-6" method="post" use:enhance>
		<Field.FieldGroup>
			<Field.Field>
				<Field.FieldLabel for="email">Email</Field.FieldLabel>
				<Input id="email" required type="email" name="email" />
			</Field.Field>
			<Button type="submit" class="justify-self-start">Send reset link</Button>
		</Field.FieldGroup>
	</form>
	{#if form?.sent}<p class="mt-4 text-sm text-brand">
			If that account exists, a reset link is on its way.
		</p>{/if}
	{#if form?.message}<p class="mt-4 text-sm text-danger">{form.message}</p>{/if}
</section>
