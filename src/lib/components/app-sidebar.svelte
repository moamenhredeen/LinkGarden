<script lang="ts">
	import LinkIcon from 'phosphor-svelte/lib/Link';
	import AppIcon from '$lib/components/app-icon.svelte';
	import MagnifyingGlassIcon from 'phosphor-svelte/lib/MagnifyingGlass';
	import ListBulletsIcon from 'phosphor-svelte/lib/ListBullets';
	import BellIcon from 'phosphor-svelte/lib/Bell';
	import FlagIcon from 'phosphor-svelte/lib/Flag';
	import GearIcon from 'phosphor-svelte/lib/Gear';
	import PlusIcon from 'phosphor-svelte/lib/Plus';
	import { page } from '$app/state';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import NavUser from '$lib/components/nav-user.svelte';
	import type { ComponentProps } from 'svelte';

	let {
		user,
		profile,
		isAdmin,
		collections,
		...restProps
	}: {
		user: { name: string; email: string };
		profile: { displayName: string; avatarUrl: string | null } | undefined | null;
		isAdmin: boolean;
		collections: { id: string; title: string }[];
	} & ComponentProps<typeof Sidebar.Root> = $props();

	const mainNavItems = [
		{ href: '/', label: 'Search', icon: MagnifyingGlassIcon },
		{ href: '/app/links', label: 'My links', icon: LinkIcon },
		{ href: '/app/collections', label: 'My collections', icon: ListBulletsIcon },
		{ href: '/app/notifications', label: 'Notifications', icon: BellIcon }
	];

	const secondaryNavItems = $derived([
		...(isAdmin ? [{ href: '/admin/reports', label: 'Reports', icon: FlagIcon }] : []),
		{ href: '/settings/profile', label: 'Settings', icon: GearIcon }
	]);
</script>

<Sidebar.Root collapsible="offcanvas" {...restProps}>
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton class="data-[slot=sidebar-menu-button]:!p-1.5">
					{#snippet child({ props })}
						<a href="/" {...props}>
							<AppIcon class="!size-5" />
							<span class="text-base font-semibold">LinkGarden</span>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>

	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each mainNavItems as item (item.href)}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton
								isActive={page.url.pathname === item.href}
								tooltipContent={item.label}
							>
								{#snippet child({ props })}
									<a href={item.href} {...props}>
										<item.icon />
										<span>{item.label}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>

		{#if user}
			<Sidebar.Group class="group-data-[collapsible=icon]:hidden">
				<Sidebar.GroupLabel>Your collections</Sidebar.GroupLabel>
				<Sidebar.GroupAction title="New collection">
					{#snippet child({ props })}
						<a href="/app/collections" {...props}>
							<PlusIcon />
							<span class="sr-only">New collection</span>
						</a>
					{/snippet}
				</Sidebar.GroupAction>
				<Sidebar.GroupContent>
					<Sidebar.Menu>
						{#each collections as item (item.id)}
							<Sidebar.MenuItem>
								<Sidebar.MenuButton isActive={page.url.pathname === '/app/collections/' + item.id}>
									{#snippet child({ props })}
										<a href={'/app/collections/' + item.id} {...props}>
											<span>{item.title}</span>
										</a>
									{/snippet}
								</Sidebar.MenuButton>
							</Sidebar.MenuItem>
						{:else}
							<span class="px-2 py-1.5 text-xs text-sidebar-foreground/70">No collections yet.</span>
						{/each}
					</Sidebar.Menu>
				</Sidebar.GroupContent>
			</Sidebar.Group>
		{/if}

		<Sidebar.Group class="mt-auto">
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each secondaryNavItems as item (item.href)}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton
								isActive={page.url.pathname === item.href}
								tooltipContent={item.label}
							>
								{#snippet child({ props })}
									<a href={item.href} {...props}>
										<item.icon />
										<span>{item.label}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>
	</Sidebar.Content>

	{#if user}
		<Sidebar.Footer>
			<NavUser
				name={profile?.displayName ?? user.name}
				email={user.email}
				avatarUrl={profile?.avatarUrl}
			/>
		</Sidebar.Footer>
	{/if}
</Sidebar.Root>
