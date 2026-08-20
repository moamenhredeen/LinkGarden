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
		form,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		form?: { sent?: boolean; message?: string } | null;
	} = $props();

	const id = $props.id();
</script>

<div class={cn('flex flex-col gap-6', className)} bind:this={ref} {...restProps}>
	<form method="post" use:enhance>
		<Field.FieldGroup>
			<div class="flex flex-col items-center gap-2 text-center">
				<a href="/" class="flex flex-col items-center gap-2 font-medium">
					<div class="flex size-14 items-center justify-center rounded-md">
						<AppIcon class="size-12" />
					</div>
					<span class="sr-only">LinkGarden</span>
				</a>
				<h1 class="text-xl font-bold">Reset your password</h1>
				<Field.FieldDescription>
					Remembered it? <a href="/login">Sign in</a>
				</Field.FieldDescription>
			</div>
			<Field.Field>
				<Field.FieldLabel for="email-{id}">Email</Field.FieldLabel>
				<Input id="email-{id}" required type="email" name="email" autocomplete="email" />
			</Field.Field>
			{#if form?.sent}
				<p class="text-sm text-brand" role="status">
					If that account exists, a reset link is on its way.
				</p>
			{/if}
			{#if form?.message}<p class="text-sm text-danger" role="alert">{form.message}</p>{/if}
			<Field.Field>
				<Button type="submit">Send reset link</Button>
			</Field.Field>
		</Field.FieldGroup>
	</form>
</div>
