<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import * as Field from '$lib/components/ui/field/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	let { form }: { form: ActionData } = $props();
</script>
<svelte:head><title>Create account · LinkGarden</title></svelte:head>
<section class="max-w-sm">
	<h1 class="text-2xl">Create your account</h1>
	<form class="mt-6 border-t border-hairline pt-6" method="post" use:enhance>
		<Field.FieldGroup>
			<Field.Field>
				<Field.FieldLabel for="name">Name</Field.FieldLabel>
				<Input id="name" required name="name" autocomplete="name" />
			</Field.Field>
			<Field.Field>
				<Field.FieldLabel for="email">Email</Field.FieldLabel>
				<Input id="email" required type="email" name="email" autocomplete="email" />
			</Field.Field>
			<Field.Field>
				<Field.FieldLabel for="password">Password</Field.FieldLabel>
				<Input
					id="password"
					required
					minlength={8}
					type="password"
					name="password"
					autocomplete="new-password"
				/>
			</Field.Field>
			{#if form?.message}<p class="text-sm text-danger" role="alert">{form.message}</p>{/if}
			<Button type="submit" class="justify-self-start">Create account</Button>
		</Field.FieldGroup>
	</form>
	<p class="mt-4 font-sans text-sm text-ink-muted">
		Already registered? <a href="/login">Sign in</a>
	</p>
</section>
