<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	import type { LayoutServerData } from './$types';
	let { children, data }: { children: import('svelte').Snippet; data: LayoutServerData } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<header
	class="flex flex-col gap-2 border-b border-hairline px-4 py-4 font-sans sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6"
>
	<a class="text-base font-semibold tracking-tight text-ink no-underline" href="/">LinkGarden</a>
	<nav aria-label="Primary navigation" class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
		<a href="/search">Search</a>
		{#if data.user}
			<a href="/app/links">My links</a><a href="/app/lists">My lists</a><a href="/app/invitations"
				>Invitations</a
			>{#if data.isAdmin}<a href="/admin/reports">Reports</a>{/if}<a href="/settings/profile"
				>Settings</a
			>
			<form method="post" action="/logout" class="m-0 inline">
				<button
					type="submit"
					class="rounded-none border-0 bg-transparent p-0 font-sans text-sm font-normal text-accent underline decoration-hairline underline-offset-[3px] hover:decoration-accent"
					>Sign out</button
				>
			</form>
		{:else}<a href="/login">Sign in</a><a href="/register">Join</a>{/if}
	</nav>
</header>
<main class="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">{@render children()}</main>
