<script lang="ts">
	import type { PageServerData } from './$types';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { page } from '$app/state';
	let { data }: { data: PageServerData } = $props();
</script>
<svelte:head>
	<title>{data.q ? `Search: ${data.q}` : 'LinkGarden'}</title>
	<meta
		name="description"
		content="Save, curate, and discover useful websites with others."
	/>
</svelte:head>

{#if !page.data.user}
	<section class="mb-10">
		<p class="font-sans text-xs font-medium tracking-[0.1em] text-ink-muted uppercase">
			A human-curated directory of the web
		</p>
		<h1 class="mt-2 text-4xl leading-[1.1] sm:text-5xl">Grow the useful web together.</h1>
		<p class="mt-4 max-w-prose text-lg text-ink-muted">
			Save the sites worth keeping, build thoughtful collections with friends, and discover the
			independent web beyond algorithmic feeds.
		</p>
		<div class="mt-6 flex items-center gap-4">
			<Button href="/register">Join LinkGarden</Button>
			<a class="font-sans text-sm" href="/login">Already have an account? Sign in</a>
		</div>
	</section>
{/if}

<form method="get" class="flex max-w-prose gap-2">
	<Label class="sr-only" for="q">Search links, lists, tags, and curators</Label>
	<Input id="q" name="q" value={data.q} placeholder="Search links, lists, tags, and curators" />
	<Button type="submit">Search</Button>
</form>

{#if data.q}
	<section class="mt-10">
		<h2 class="font-sans text-xs font-medium tracking-[0.1em] text-ink-muted uppercase">
			Results for “{data.q}”
		</h2>
		<ol class="mt-4 divide-y divide-hairline border-t border-hairline">
			{#each data.results as item}
				<li class="py-4">
					<p class="font-sans text-xs font-medium tracking-[0.1em] text-ink-muted uppercase">
						{item.kind === 'list'
							? 'List'
							: item.kind === 'list_link'
								? 'Link in a list'
								: 'Personal link'}
					</p>
					<h3 class="mt-1 text-lg">
						{#if item.kind === 'list'}<a href={'/@' + item.route_username + '/' + item.slug}
								>{item.title}</a
							>{:else}<a href={item.url} rel="noreferrer">{item.title}</a>{/if}
					</h3>
					{#if item.description}<p class="mt-1 text-ink-muted">{item.description}</p>{/if}
					<p class="mt-1 font-sans text-sm text-ink-muted">{item.curators}</p>
					{#if item.kind === 'list_link'}<a
							class="mt-1 inline-block font-sans text-sm"
							href={'/@' + item.route_username + '/' + item.slug}>See it in context →</a
						>{/if}
				</li>
			{:else}
				<li class="py-4 text-ink-muted">No public links or lists matched.</li>
			{/each}
		</ol>
	</section>
{:else}
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
{/if}
