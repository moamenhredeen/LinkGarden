<script lang="ts">import { enhance } from '$app/forms'; import type { ActionData, PageServerData } from './$types'; let { data, form }: { data: PageServerData; form: ActionData } = $props();</script>
<svelte:head><title>Choose password · LinkGarden</title></svelte:head>
<section class="max-w-sm">
	<h1 class="text-2xl">Choose a new password</h1>
	<form class="mt-6 grid gap-4 border-t border-hairline pt-6" method="post" use:enhance>
		<input type="hidden" name="token" value={data.token} />
		<label class="grid gap-1"
			>New password <input
				required
				minlength="8"
				type="password"
				name="password"
				autocomplete="new-password"
			/></label
		>
		<button type="submit" class="justify-self-start">Update password</button>
	</form>
	{#if form?.message}<p class="mt-4 text-sm text-danger">{form.message}</p>{/if}
</section>
