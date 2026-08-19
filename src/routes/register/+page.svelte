<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	let { form }: { form: ActionData } = $props();
</script>
<svelte:head><title>Create account · LinkGarden</title></svelte:head>
<section class="auth-card">
	<h1>Create your account</h1>
	<form method="post" use:enhance>
		<label>Name <input required name="name" autocomplete="name" /></label>
		<label>Email <input required type="email" name="email" autocomplete="email" /></label>
		<label>Password <input required minlength="8" type="password" name="password" autocomplete="new-password" /></label>
		{#if form?.message}<p class="error" role="alert">{form.message}</p>{/if}
		<button>Create account</button>
	</form>
	<p>Already registered? <a href="/login">Sign in</a></p>
</section>
