<script lang="ts">
	import { enhance } from '$app/forms';
	import AppIcon from '$lib/components/app-icon.svelte';
	import * as Field from '$lib/components/ui/field/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { cn, type WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		ref = $bindable(null),
		class: className,
		token,
		form,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		token: string;
		form?: { message?: string } | null;
	} = $props();

	const id = $props.id();
</script>

<div class={cn('flex flex-col gap-6', className)} bind:this={ref} {...restProps}>
	<form method="post" use:enhance>
		<input type="hidden" name="token" value={token} />
		<Field.FieldGroup>
			<div class="flex flex-col items-center gap-2 text-center">
				<a href="/" class="flex flex-col items-center gap-2 font-medium">
					<div class="flex size-14 items-center justify-center rounded-md">
						<AppIcon class="size-12" />
					</div>
					<span class="sr-only">LinkGarden</span>
				</a>
				<h1 class="text-xl font-bold">Choose a new password</h1>
			</div>
			<Field.Field>
				<Field.FieldLabel for="password-{id}">New password</Field.FieldLabel>
				<Input
					id="password-{id}"
					required
					minlength={8}
					type="password"
					name="password"
					autocomplete="new-password"
				/>
			</Field.Field>
			{#if form?.message}<p class="text-sm text-danger" role="alert">{form.message}</p>{/if}
			<Field.Field>
				<Button type="submit">Update password</Button>
			</Field.Field>
		</Field.FieldGroup>
	</form>
</div>
