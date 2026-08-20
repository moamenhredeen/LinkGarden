<script lang="ts">
	import type { ActionData } from './$types';
	import RegisterForm from '$lib/components/register-form.svelte';
	let { form }: { form: ActionData } = $props();
</script>

<svelte:head><title>Create account · LinkGarden</title></svelte:head>
<div class="flex min-h-[70vh] flex-col items-center justify-center">
	<div class="w-full max-w-sm">
		<RegisterForm {form} />
	</div>
</div>
