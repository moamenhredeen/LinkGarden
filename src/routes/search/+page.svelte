<script lang="ts">import type { PageServerData } from './$types'; let { data }: { data: PageServerData } = $props();</script>
<svelte:head><title>{data.q ? `Search: ${data.q}` : 'Search'} · LinkGarden</title></svelte:head><h1 class="text-2xl">Search the useful web</h1>
<form method="get" class="mt-6 flex max-w-prose gap-2">
	<label class="sr-only" for="q">Search</label>
	<input id="q" name="q" value={data.q} placeholder="Try “independent publishing”" />
	<button type="submit">Search</button>
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
{/if}
