<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageServerData } from './$types';
	import { Button } from '$lib/components/ui/button/index.js';
	let { data, form }: { data: PageServerData; form: ActionData } = $props();
</script>
<svelte:head><title>Verify email · LinkGarden</title></svelte:head>
<section class="max-w-sm">
	<h1 class="text-2xl">Check your inbox</h1>
	<p class="mt-2 text-ink-muted">We sent a verification link to {data.email}.</p>
	<form class="mt-6 border-t border-hairline pt-6" method="post" use:enhance>
		<Button type="submit" variant="outline">Resend verification email</Button>
	</form>
	{#if form?.sent}<p class="mt-4 text-sm text-brand">A new message is on its way.</p>{/if}
	{#if form?.message}<p class="mt-4 text-sm text-danger" role="alert">{form.message}</p>{/if}
</section>
