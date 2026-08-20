<script lang="ts">
	import type { ActionData } from './$types';
	import LoginForm from '$lib/components/login-form.svelte';
	let { form }: { form: ActionData } = $props();
</script>

<svelte:head><title>Sign in · LinkGarden</title></svelte:head>
<div class="flex min-h-[70vh] flex-col items-center justify-center">
	<div class="w-full max-w-sm">
		<LoginForm {form} />
	</div>
</div>
