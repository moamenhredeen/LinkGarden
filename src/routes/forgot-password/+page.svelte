<script lang="ts">
	import type { ActionData } from './$types';
	import ForgotPasswordForm from '$lib/components/forgot-password-form.svelte';
	let { form }: { form: ActionData } = $props();
</script>

<svelte:head><title>Reset password · LinkGarden</title></svelte:head>
<div class="flex min-h-[70vh] flex-col items-center justify-center">
	<div class="w-full max-w-sm">
		<ForgotPasswordForm {form} />
	</div>
</div>
