<script lang="ts">
	import { enhance } from '$app/forms';
	import AppIcon from '$lib/components/app-icon.svelte';
	import * as Field from '$lib/components/ui/field/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { cn, type WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';
	import GithubLogo from 'phosphor-svelte/lib/GithubLogo';
	import GoogleLogo from 'phosphor-svelte/lib/GoogleLogo';

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
	<form method="post" action="?/credentials" use:enhance>
		<Field.FieldGroup>
			<div class="flex flex-col items-center gap-2 text-center">
				<a href="/" class="flex flex-col items-center gap-2 font-medium">
					<div class="flex size-14 items-center justify-center rounded-md">
						<AppIcon class="size-12" />
					</div>
					<span class="sr-only">LinkGarden</span>
				</a>
				<h1 class="text-xl font-bold">Welcome back to LinkGarden</h1>
				<Field.FieldDescription>
					Don't have an account? <a href="/register">Sign up</a>
				</Field.FieldDescription>
			</div>
			<Field.Field>
				<Field.FieldLabel for="email-{id}">Email</Field.FieldLabel>
				<Input id="email-{id}" required type="email" name="email" autocomplete="email" />
			</Field.Field>
			<Field.Field>
				<div class="flex items-center">
					<Field.FieldLabel for="password-{id}">Password</Field.FieldLabel>
					<a href="/forgot-password" class="ml-auto font-sans text-xs">Forgot password?</a>
				</div>
				<Input
					id="password-{id}"
					required
					type="password"
					name="password"
					autocomplete="current-password"
				/>
			</Field.Field>
			{#if form?.message}<p class="text-sm text-danger" role="alert">{form.message}</p>{/if}
			<Field.Field>
				<Button type="submit">Sign in</Button>
			</Field.Field>
		</Field.FieldGroup>
	</form>
	<Field.FieldSeparator>Or continue with</Field.FieldSeparator>
	<div class="grid grid-cols-2 gap-3">
		<form method="post" action="?/github" use:enhance>
			<Button type="submit" variant="outline" class="w-full">
				<GithubLogo class="size-4" />
				GitHub
			</Button>
		</form>
		<form method="post" action="?/google" use:enhance>
			<Button type="submit" variant="outline" class="w-full">
				<GoogleLogo class="size-4" />
				Google
			</Button>
		</form>
	</div>
</div>
