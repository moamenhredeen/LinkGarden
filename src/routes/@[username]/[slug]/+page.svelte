<script lang="ts">
	import ReportForm from '$lib/components/ReportForm.svelte';
	import MinimalHeader from '$lib/components/minimal-header.svelte';
	import type { PageServerData } from './$types';
	let { data }: { data: PageServerData } = $props();
	const path = $derived('/@' + data.routeProfile.username + '/' + data.collection.slug);
</script>
<svelte:head><title>{data.collection.title} · LinkGarden</title><meta name="description" content={data.collection.description} /><link rel="canonical" href={path} /></svelte:head>
<MinimalHeader />
<article>
	<p class="font-sans text-xs font-medium tracking-[0.1em] text-ink-muted uppercase">
		Curated list
	</p>
	<h1 class="mt-2 text-3xl">{data.collection.title}</h1>
	{#if data.collection.description}<p class="mt-3 max-w-prose text-ink-muted">
			{data.collection.description}
		</p>{/if}
	<p class="mt-3 font-sans text-sm text-ink-muted">
		Owned by <a href={'/@' + data.owner.username}
			>{data.owner.displayName} (@{data.owner.username})</a
		>{#if data.editors.length} with {data.editors.map((item) => '@' + item.username).join(', ')}{/if}
	</p>
	<div class="mt-2"><ReportForm type="list" targetId={data.collection.id} returnTo={path} /></div>
</article>

<ol class="mt-10 divide-y divide-hairline border-t border-hairline">
	{#each data.links as item}
		<li class="py-4">
			<h2 class="text-lg"><a href={item.normalizedUrl} rel="noreferrer">{item.title}</a></h2>
			{#if item.description}<p class="mt-1 text-ink-muted">{item.description}</p>{/if}
			{#if item.tags.length}
				<ul
					class="mt-2 flex flex-wrap gap-x-2 font-sans text-xs text-ink-muted"
					aria-label="Tags"
				>
					{#each item.tags as name, i}<li>{name}{#if i < item.tags.length - 1}<span
									class="ml-2 text-hairline">·</span
								>{/if}</li>{/each}
				</ul>
			{/if}
			<div class="mt-2"><ReportForm type="link" targetId={item.id} returnTo={path} /></div>
		</li>
	{:else}
		<li class="py-4 text-ink-muted">This list has no public links yet.</li>
	{/each}
</ol>
