<script lang="ts">import { enhance } from '$app/forms'; import type { ActionData } from './$types'; let { form }: { form: ActionData } = $props();</script>
<svelte:head><title>Reset password · LinkGarden</title></svelte:head>
<section class="max-w-sm">
	<h1 class="text-2xl">Reset your password</h1>
	<form class="mt-6 grid gap-4 border-t border-hairline pt-6" method="post" use:enhance>
		<label class="grid gap-1">Email <input required type="email" name="email" /></label>
		<button type="submit" class="justify-self-start">Send reset link</button>
	</form>
	{#if form?.sent}<p class="mt-4 text-sm text-accent">
			If that account exists, a reset link is on its way.
		</p>{/if}
	{#if form?.message}<p class="mt-4 text-sm text-danger">{form.message}</p>{/if}
</section>
