<script lang="ts">import { enhance } from '$app/forms'; import type { ActionData, PageServerData } from './$types'; let { data, form }: { data: PageServerData; form: ActionData } = $props();</script>
<svelte:head><title>Profile settings · LinkGarden</title><meta name="robots" content="noindex" /></svelte:head>
<p class="font-sans text-sm"><a href="/settings/account">Account settings</a></p>
<section class="mt-2">
	<h1 class="text-2xl">Profile settings</h1>
	<p class="mt-2 text-ink-muted">
		Your permanent profile: <a href={'/@' + data.profile.username}>/@{data.profile.username}</a>
	</p>
	<form class="mt-6 grid max-w-prose gap-4 border-t border-hairline pt-6" method="post" use:enhance>
		<label class="grid gap-1"
			>Display name <input
				required
				maxlength="80"
				name="displayName"
				value={data.profile.displayName}
			/></label
		>
		<label class="grid gap-1">Bio <textarea maxlength="500" name="bio">{data.profile.bio ?? ''}</textarea></label>
		<label class="grid gap-1"
			>Avatar URL <input type="url" name="avatarUrl" value={data.profile.avatarUrl ?? ''} /></label
		>
		{#if form?.saved}<p class="text-sm text-accent">Profile saved.</p>{/if}
		{#if form?.message}<p class="text-sm text-danger">{form.message}</p>{/if}
		<button type="submit" class="justify-self-start">Save profile</button>
	</form>
</section>
