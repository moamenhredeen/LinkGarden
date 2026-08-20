<script lang="ts">
	import AppIcon from '$lib/components/app-icon.svelte';
	import { page } from '$app/state';
</script>

{#if !page.data.user}
	<header class="mb-10 flex items-center justify-between border-b border-hairline pb-4">
		<a href="/" class="flex items-center gap-2 font-sans text-base font-semibold">
			<AppIcon class="size-5" />
			LinkGarden
		</a>
		<nav class="flex gap-4 font-sans text-sm">
			{#if page.url.pathname !== '/login'}<a href="/login">Sign in</a>{/if}
			{#if page.url.pathname !== '/register'}<a href="/register">Join</a>{/if}
		</nav>
	</header>
{/if}
