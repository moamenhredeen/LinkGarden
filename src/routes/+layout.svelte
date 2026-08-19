<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	import type { LayoutServerData } from './$types';
	let { children, data }: { children: import('svelte').Snippet; data: LayoutServerData } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<header class="site-header">
	<a class="brand" href="/">LinkGarden</a>
	<nav aria-label="Primary navigation">
		<a href="/search">Search</a>
		{#if data.user}
			<a href="/app/links">My links</a><a href="/app/lists">My lists</a><a href="/settings/profile">Settings</a>
			<form method="post" action="/logout"><button class="link-button">Sign out</button></form>
		{:else}<a href="/login">Sign in</a><a class="button-link" href="/register">Join</a>{/if}
	</nav>
</header>
<main>{@render children()}</main>
