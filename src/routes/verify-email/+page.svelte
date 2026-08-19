<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageServerData } from './$types';
	let { data, form }: { data: PageServerData; form: ActionData } = $props();
</script>
<svelte:head><title>Verify email · LinkGarden</title></svelte:head>
<section class="auth-card"><h1>Check your inbox</h1><p>We sent a verification link to {data.email}.</p>
	<form method="post" use:enhance><button class="secondary">Resend verification email</button></form>
	{#if form?.sent}<p class="success">A new message is on its way.</p>{/if}
	{#if form?.message}<p class="error" role="alert">{form.message}</p>{/if}
</section>
