<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageServerData } from './$types';
	import * as Field from '$lib/components/ui/field/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	let { data, form }: { data: PageServerData; form: ActionData } = $props();
</script>
<svelte:head><title>Choose password · LinkGarden</title></svelte:head>
<section class="max-w-sm">
	<h1 class="text-2xl">Choose a new password</h1>
	<form class="mt-6 border-t border-hairline pt-6" method="post" use:enhance>
		<input type="hidden" name="token" value={data.token} />
		<Field.FieldGroup>
			<Field.Field>
				<Field.FieldLabel for="password">New password</Field.FieldLabel>
				<Input
					id="password"
					required
					minlength={8}
					type="password"
					name="password"
					autocomplete="new-password"
				/>
			</Field.Field>
			<Button type="submit" class="justify-self-start">Update password</Button>
		</Field.FieldGroup>
	</form>
	{#if form?.message}<p class="mt-4 text-sm text-danger">{form.message}</p>{/if}
</section>
