<script lang="ts">let { type, targetId, returnTo }: { type: 'link' | 'list'; targetId: string; returnTo: string } = $props(); let open = $state(false);</script>
<button
	type="button"
	class="rounded-none border-0 bg-transparent p-0 font-sans text-xs text-ink-muted underline decoration-hairline underline-offset-[3px] hover:text-accent hover:decoration-accent"
	onclick={() => (open = !open)}>Report</button
>
{#if open}
	<form class="mt-3 grid max-w-sm gap-3 border-t border-hairline pt-3" method="post" action="/report">
		<input type="hidden" name="type" value={type} /><input
			type="hidden"
			name="targetId"
			value={targetId}
		/><input type="hidden" name="returnTo" value={returnTo} />
		<label class="grid gap-1"
			>Reason
			<select name="reason"
				><option value="spam">Spam</option><option value="malware">Malware or unsafe</option
				><option value="harassment">Harassment</option><option value="illegal"
					>Illegal content</option
				><option value="misleading">Misleading</option><option value="other">Other</option
				></select
			></label
		>
		<label class="grid gap-1">Details (optional) <textarea maxlength="1000" name="explanation"
			></textarea></label
		>
		<button type="submit" class="justify-self-start">Submit report</button>
	</form>
{/if}
