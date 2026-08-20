<script lang="ts">
	import type { ActionData, PageServerData } from './$types';
	import ResetPasswordForm from '$lib/components/reset-password-form.svelte';
	let { data, form }: { data: PageServerData; form: ActionData } = $props();
</script>

<svelte:head><title>Choose password · LinkGarden</title></svelte:head>
<div class="flex min-h-[70vh] flex-col items-center justify-center">
	<div class="w-full max-w-sm">
		<ResetPasswordForm token={data.token} {form} />
	</div>
</div>
