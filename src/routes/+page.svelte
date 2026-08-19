<script lang="ts">import type { PageServerData } from './$types'; let { data }: { data: PageServerData } = $props();</script>
<svelte:head>
	<title>LinkGarden</title>
	<meta
		name="description"
		content="Save, curate, and discover useful websites with others."
	/>
</svelte:head>

<section>
	<p class="font-sans text-xs font-medium tracking-[0.1em] text-ink-muted uppercase">
		A human-curated directory of the web
	</p>
	<h1 class="mt-2 text-4xl leading-[1.1] sm:text-5xl">Grow the useful web together.</h1>
	<p class="mt-4 max-w-prose text-lg text-ink-muted">
		Save the sites worth keeping, build thoughtful collections with friends, and discover the
		independent web beyond algorithmic feeds.
	</p>
	<form method="get" action="/search" class="mt-6 flex max-w-prose gap-2">
		<label class="sr-only" for="home-search">Search public links and lists</label>
		<input id="home-search" name="q" placeholder="Search links, lists, tags, and curators" />
		<button type="submit">Search</button>
	</form>
</section>

<section class="mt-14">
	<h2 class="font-sans text-xs font-medium tracking-[0.1em] text-ink-muted uppercase">
		Recently published links
	</h2>
	<ol class="mt-4 divide-y divide-hairline border-t border-hairline">
		{#each data.recentLinks as item}
			<li class="py-4">
				<h3 class="text-lg"><a href={item.url} rel="noreferrer">{item.title}</a></h3>
				{#if item.description}<p class="mt-1 text-ink-muted">{item.description}</p>{/if}
				<a class="mt-1 inline-block font-sans text-sm" href={'/@' + item.username}
					>Curated by @{item.username}</a
				>
			</li>
		{:else}
			<li class="py-4 text-ink-muted">Public links will appear here.</li>
		{/each}
	</ol>
</section>

<section class="mt-14">
	<h2 class="font-sans text-xs font-medium tracking-[0.1em] text-ink-muted uppercase">
		Recently tended lists
	</h2>
	<ol class="mt-4 divide-y divide-hairline border-t border-hairline">
		{#each data.recentLists as item}
			<li class="py-4">
				<h3 class="text-lg"><a href={'/@' + item.username + '/' + item.slug}>{item.title}</a></h3>
				{#if item.description}<p class="mt-1 text-ink-muted">{item.description}</p>{/if}
				<span class="mt-1 inline-block font-sans text-sm text-ink-muted">@{item.username}</span>
			</li>
		{:else}
			<li class="py-4 text-ink-muted">Public lists will appear here.</li>
		{/each}
	</ol>
</section>
