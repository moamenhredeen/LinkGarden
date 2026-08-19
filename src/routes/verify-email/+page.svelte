<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageServerData } from './$types';
	let { data, form }: { data: PageServerData; form: ActionData } = $props();
</script>
<svelte:head><title>Verify email · LinkGarden</title></svelte:head>
<section class="max-w-sm">
	<h1 class="text-2xl">Check your inbox</h1>
	<p class="mt-2 text-ink-muted">We sent a verification link to {data.email}.</p>
	<form class="mt-6 border-t border-hairline pt-6" method="post" use:enhance>
		<button type="submit" class="bg-transparent text-ink underline decoration-hairline underline-offset-[3px] hover:decoration-accent"
			>Resend verification email</button
		>
	</form>
	{#if form?.sent}<p class="mt-4 text-sm text-accent">A new message is on its way.</p>{/if}
	{#if form?.message}<p class="mt-4 text-sm text-danger" role="alert">{form.message}</p>{/if}
</section>
