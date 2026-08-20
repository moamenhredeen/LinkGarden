<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/state';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import AppSidebar from '$lib/components/app-sidebar.svelte';
	import SiteHeader from '$lib/components/site-header.svelte';

	import type { LayoutServerData } from './$types';
	let { children, data }: { children: import('svelte').Snippet; data: LayoutServerData } = $props();

	const pageTitles: Record<string, string> = {
		'/search': 'Search',
		'/app/links': 'My links',
		'/app/lists': 'My lists',
		'/app/invitations': 'Invitations',
		'/admin/reports': 'Reports',
		'/settings/profile': 'Settings',
		'/settings/account': 'Account',
		'/login': 'Sign in',
		'/register': 'Join'
	};
	const title = $derived(pageTitles[page.url.pathname] ?? 'LinkGarden');
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<Sidebar.Provider style="--sidebar-width: calc(var(--spacing) * 72); --header-height: calc(var(--spacing) * 12);">
	<AppSidebar
		variant="inset"
		user={data.user}
		profile={data.profile}
		isAdmin={data.isAdmin}
		collections={data.collections}
	/>
	<Sidebar.Inset>
		<SiteHeader {title} />

		<div class="w-full min-w-0 px-4 py-10 sm:px-6 sm:py-14 md:px-10 md:py-14">
			<div class="mx-auto w-full max-w-3xl">{@render children()}</div>
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>
