<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	let { form }: { form: ActionData } = $props();
</script>

<svelte:head><title>Sign in · LinkGarden</title></svelte:head>
<section class="auth-card">
	<h1>Welcome back</h1>
	<form method="post" use:enhance>
		<label>Email <input required type="email" name="email" autocomplete="email" /></label>
		<label>Password <input required type="password" name="password" autocomplete="current-password" /></label>
		{#if form?.message}<p class="error" role="alert">{form.message}</p>{/if}
		<button>Sign in</button>
	</form>
	<p><a href="/forgot-password">Forgot password?</a> · <a href="/register">Create account</a></p>
</section>
