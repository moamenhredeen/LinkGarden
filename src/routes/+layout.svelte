<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	import type { LayoutServerData } from './$types';
	let { children, data }: { children: import('svelte').Snippet; data: LayoutServerData } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="md:flex md:min-h-screen">
	<header
		class="border-b border-hairline px-4 py-4 font-sans sm:px-6 md:w-56 md:shrink-0 md:border-r md:border-b-0 md:px-5 md:py-8 lg:w-64"
	>
		<div class="flex items-center justify-between md:block">
			<a class="text-base font-semibold tracking-tight text-ink no-underline" href="/">LinkGarden</a>
		</div>

		<nav
			aria-label="Primary navigation"
			class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm md:mt-8 md:flex-col md:items-start md:gap-y-2"
		>
			<a href="/search">Search</a>
			{#if data.user}
				<a href="/app/links">My links</a>
				<a href="/app/lists">My lists</a>
				<a href="/app/invitations">Invitations</a>
				{#if data.isAdmin}<a href="/admin/reports">Reports</a>{/if}
				<a href="/settings/profile">Settings</a>
			{:else}
				<a href="/login">Sign in</a>
				<a href="/register">Join</a>
			{/if}
		</nav>

		{#if data.user}
			<div class="mt-8 hidden md:block">
				<div class="flex items-baseline justify-between gap-2">
					<h2 class="font-sans text-xs font-medium tracking-[0.1em] text-ink-muted uppercase">
						Your collections
					</h2>
					<a class="font-sans text-xs" href="/app/lists">New</a>
				</div>
				<ul class="mt-3 grid gap-2 text-sm">
					{#each data.collections as item}
						<li class="truncate"><a href={'/app/lists/' + item.id}>{item.title}</a></li>
					{:else}
						<li class="text-ink-muted">No collections yet.</li>
					{/each}
				</ul>
			</div>

			<form method="post" action="/logout" class="mt-8 hidden md:block">
				<button
					type="submit"
					class="rounded-none border-0 bg-transparent p-0 font-sans text-sm font-normal text-accent underline decoration-hairline underline-offset-[3px] hover:decoration-accent"
					>Sign out</button
				>
			</form>
		{/if}
	</header>

	<main class="w-full min-w-0 px-4 py-10 sm:px-6 sm:py-14 md:px-10 md:py-14">
		<div class="mx-auto w-full max-w-3xl">{@render children()}</div>
	</main>
</div>

{#if data.user}
	<form method="post" action="/logout" class="border-t border-hairline px-4 py-4 font-sans md:hidden">
		<button
			type="submit"
			class="rounded-none border-0 bg-transparent p-0 font-sans text-sm font-normal text-accent underline decoration-hairline underline-offset-[3px] hover:decoration-accent"
			>Sign out</button
		>
	</form>
{/if}
