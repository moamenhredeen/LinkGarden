<script lang="ts">import type { PageServerData } from './$types'; let { data }: { data: PageServerData } = $props();</script>
<svelte:head>
	<title>LinkGarden</title>
	<meta
		name="description"
		content="Save, curate, and discover useful websites with others."
	/>
</svelte:head>

<section class="hero"><p class="eyebrow">A human-curated directory of the web</p><h1>Grow the useful web together.</h1><p>Save the sites worth keeping, build thoughtful collections with friends, and discover the independent web beyond algorithmic feeds.</p><form method="get" action="/search"><label class="sr-only" for="home-search">Search public links and lists</label><div class="search-row"><input id="home-search" name="q" placeholder="Search links, lists, tags, and curators" /><button>Search</button></div></form></section>
<section class="stack"><h2>Recently published links</h2><div class="grid">{#each data.recentLinks as item}<article class="card"><h3><a href={item.url} rel="noreferrer">{item.title}</a></h3><p>{item.description}</p><a href={'/@' + item.username}>Curated by @{item.username}</a></article>{:else}<p>Public links will appear here.</p>{/each}</div></section>
<section class="stack"><h2>Recently tended lists</h2><div class="grid">{#each data.recentLists as item}<article class="card"><h3><a href={'/@' + item.username + '/' + item.slug}>{item.title}</a></h3><p>{item.description}</p><span>@{item.username}</span></article>{:else}<p>Public lists will appear here.</p>{/each}</div></section>
