<script lang="ts">
	import { enhance } from '$app/forms'; import type { ActionData, PageServerData } from './$types';
	let { data, form }: { data: PageServerData; form: ActionData } = $props();
</script>
<svelte:head><title>My links · LinkGarden</title><meta name="robots" content="noindex" /></svelte:head>
<section><h1>My links</h1><p>Save a link now; LinkGarden will fill in its page details in the background.</p>
	<form class="card" method="post" action="?/create" use:enhance>
		<label>URL <input required type="url" name="url" placeholder="https://example.com/" /></label>
		<label>Title (optional) <input maxlength="300" name="title" /></label>
		<label>Description (optional) <textarea maxlength="2000" name="description"></textarea></label>
		<label>Tags, separated by commas <input name="tags" /></label>
		<label>Visibility <select name="visibility"><option value="private">Private</option><option value="public">Public</option></select></label>
		<button>Save link</button>
	</form>
	{#if form?.message}<p class="error" role="alert">{form.message}</p>{/if}
</section>
<section class="stack"><h2>Saved links</h2>
	{#each data.links as item}
		<article class="card">
			<form method="post" action="?/edit" use:enhance><input type="hidden" name="id" value={item.id} />
				<label>Title <input required maxlength="300" name="title" value={item.title} /></label>
				<label>Description <textarea maxlength="2000" name="description">{item.description}</textarea></label>
				<label>Tags <input name="tags" value={item.tags.join(', ')} /></label>
				<label>Visibility <select name="visibility" value={item.visibility ?? 'private'}><option value="private">Private</option><option value="public">Public</option></select></label>
				<p><a href={item.normalizedUrl} rel="noreferrer">{item.normalizedUrl}</a> · Metadata: {item.metadataStatus}{item.moderationState === 'hidden' ? ' · Hidden by moderation' : ''}</p><button>Save changes</button>
			</form>
			<div class="actions">{#if item.metadataStatus === 'failed'}<form method="post" action="?/retry" use:enhance><input type="hidden" name="id" value={item.id} /><button class="secondary">Retry metadata</button></form>{/if}<form method="post" action="?/delete" use:enhance><input type="hidden" name="id" value={item.id} /><button class="danger">Delete</button></form></div>
		</article>
	{:else}<p>No links yet.</p>{/each}
</section>
