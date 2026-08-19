<script lang="ts">import { enhance } from '$app/forms'; import type { ActionData, PageServerData } from './$types'; let { data, form }: { data: PageServerData; form: ActionData } = $props();</script>
<svelte:head><title>My lists · LinkGarden</title><meta name="robots" content="noindex" /></svelte:head>
<section>
	<h1 class="text-2xl">My lists</h1>
	<form class="mt-6 grid max-w-prose gap-4 border-t border-hairline pt-6" method="post" action="?/create" use:enhance>
		<label class="grid gap-1">Title <input required maxlength="120" name="title" /></label>
		<label class="grid gap-1"
			>Permanent slug <input
				required
				maxlength="80"
				pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
				name="slug"
				placeholder="independent-web"
			/></label
		>
		<label class="grid gap-1">Description <textarea maxlength="2000" name="description"></textarea></label>
		<label class="grid gap-1"
			>Visibility <select name="visibility"
				><option value="private">Private</option><option value="public">Public</option></select
			></label
		>
		{#if form?.message}<p class="text-sm text-danger">{form.message}</p>{/if}
		<button type="submit" class="justify-self-start">Create list</button>
	</form>
</section>

<section class="mt-14">
	<h2 class="font-sans text-xs font-medium tracking-[0.1em] text-ink-muted uppercase">
		Your collections
	</h2>
	<ol class="mt-4 divide-y divide-hairline border-t border-hairline">
		{#each data.lists as item}
			<li class="py-4">
				<h3 class="text-lg"><a href={'/app/lists/' + item.id}>{item.title}</a></h3>
				<p class="mt-1 text-ink-muted">{item.description || 'No description yet.'}</p>
				<p class="mt-1 font-sans text-sm text-ink-muted">
					{item.visibility} · {item.isOwner ? 'Owner' : 'Editor'}
				</p>
			</li>
		{:else}<li class="py-4 text-ink-muted">No lists yet.</li>{/each}
	</ol>
</section>
