<script lang="ts">import type { PageServerData } from './$types'; import ReportForm from '$lib/components/ReportForm.svelte'; import MinimalHeader from '$lib/components/minimal-header.svelte'; let { data }: { data: PageServerData } = $props();</script><svelte:head><title>{data.profile.displayName} (@{data.profile.username}) · LinkGarden</title><meta name="description" content={data.profile.bio ?? `Public links and collections curated by ${data.profile.displayName}.`} /></svelte:head><MinimalHeader /><header class="flex items-center gap-4">
	{#if data.profile.avatarUrl}<img
			class="h-16 w-16 rounded-full object-cover"
			src={data.profile.avatarUrl}
			alt=""
		/>{/if}
	<div>
		<h1 class="text-2xl">{data.profile.displayName}</h1>
		<p class="font-sans text-sm text-ink-muted">@{data.profile.username}</p>
		{#if data.profile.bio}<p class="mt-1 text-ink-muted">{data.profile.bio}</p>{/if}
	</div>
</header>

<section class="mt-12">
	<h2 class="font-sans text-xs font-medium tracking-[0.1em] text-ink-muted uppercase">
		Public collections
	</h2>
	<ol class="mt-4 divide-y divide-hairline border-t border-hairline">
		{#each data.collections as row}
			<li class="py-4">
				<h3 class="text-lg">
					<a href={'/@' + row.routeUsername + '/' + row.item.slug}>{row.item.title}</a>
				</h3>
				{#if row.item.description}<p class="mt-1 text-ink-muted">{row.item.description}</p>{/if}
				<div class="mt-2">
					<ReportForm type="collection" targetId={row.item.id} returnTo={'/@' + data.profile.username} />
				</div>
			</li>
		{:else}
			<li class="py-4 text-ink-muted">No public collections yet.</li>
		{/each}
	</ol>
</section>

<section class="mt-14">
	<h2 class="font-sans text-xs font-medium tracking-[0.1em] text-ink-muted uppercase">
		Published links
	</h2>
	<ol class="mt-4 divide-y divide-hairline border-t border-hairline">
		{#each data.links as item}
			<li class="py-4">
				<h3 class="text-lg"><a href={item.normalizedUrl} rel="noreferrer">{item.title}</a></h3>
				{#if item.description}<p class="mt-1 text-ink-muted">{item.description}</p>{/if}
				<div class="mt-2">
					<ReportForm type="link" targetId={item.id} returnTo={'/@' + data.profile.username} />
				</div>
			</li>
		{:else}
			<li class="py-4 text-ink-muted">No published links yet.</li>
		{/each}
	</ol>
</section>
