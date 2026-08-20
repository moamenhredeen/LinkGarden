<script lang="ts">
	import { enhance } from '$app/forms';
	import LinkIcon from 'phosphor-svelte/lib/Link';
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
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & { form?: { message?: string } | null } =
		$props();

	const id = $props.id();
</script>

<div class={cn('flex flex-col gap-6', className)} bind:this={ref} {...restProps}>
	<form method="post" use:enhance>
		<Field.FieldGroup>
			<div class="flex flex-col items-center gap-2 text-center">
				<a href="/" class="flex flex-col items-center gap-2 font-medium">
					<div class="flex size-8 items-center justify-center rounded-md">
						<LinkIcon class="size-6" />
					</div>
					<span class="sr-only">LinkGarden</span>
				</a>
				<h1 class="text-xl font-bold">Create your LinkGarden account</h1>
				<Field.FieldDescription>
					Already registered? <a href="/login">Sign in</a>
				</Field.FieldDescription>
			</div>
			<Field.Field>
				<Field.FieldLabel for="name-{id}">Name</Field.FieldLabel>
				<Input id="name-{id}" required name="name" autocomplete="name" />
			</Field.Field>
			<Field.Field>
				<Field.FieldLabel for="email-{id}">Email</Field.FieldLabel>
				<Input id="email-{id}" required type="email" name="email" autocomplete="email" />
			</Field.Field>
			<Field.Field>
				<Field.FieldLabel for="password-{id}">Password</Field.FieldLabel>
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
				<Button type="submit">Create account</Button>
			</Field.Field>
		</Field.FieldGroup>
	</form>
</div>
