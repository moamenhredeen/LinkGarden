<script lang="ts">import { enhance } from '$app/forms'; import type { ActionData, PageServerData } from './$types'; let { data, form }: { data: PageServerData; form: ActionData } = $props();</script>
<svelte:head><title>Choose your profile · LinkGarden</title><meta name="robots" content="noindex" /></svelte:head>
<section class="max-w-sm">
	<h1 class="text-2xl">Choose your public identity</h1>
	<p class="mt-2 text-ink-muted">Your username becomes your permanent profile address.</p>
	<form class="mt-6 grid gap-4 border-t border-hairline pt-6" method="post" use:enhance>
		<label class="grid gap-1"
			>Username <input
				required
				minlength="3"
				maxlength="30"
				name="username"
				autocomplete="username"
			/></label
		>
		<label class="grid gap-1"
			>Display name <input required maxlength="80" name="displayName" value={data.displayName} /></label
		>
		{#if form?.message}<p class="text-sm text-danger">{form.message}</p>{/if}
		<button type="submit" class="justify-self-start">Create profile</button>
	</form>
</section>
