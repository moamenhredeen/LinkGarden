<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	let { form }: { form: ActionData } = $props();
</script>

<svelte:head><title>Sign in · LinkGarden</title></svelte:head>
<section class="max-w-sm">
	<h1 class="text-2xl">Welcome back</h1>
	<form class="mt-6 grid gap-4 border-t border-hairline pt-6" method="post" use:enhance>
		<label class="grid gap-1"
			>Email <input required type="email" name="email" autocomplete="email" /></label
		>
		<label class="grid gap-1"
			>Password <input
				required
				type="password"
				name="password"
				autocomplete="current-password"
			/></label
		>
		{#if form?.message}<p class="text-sm text-danger" role="alert">{form.message}</p>{/if}
		<button type="submit" class="justify-self-start">Sign in</button>
	</form>
	<p class="mt-4 font-sans text-sm text-ink-muted">
		<a href="/forgot-password">Forgot password?</a> · <a href="/register">Create account</a>
	</p>
</section>
