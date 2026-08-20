<script lang="ts">
	import * as Field from '$lib/components/ui/field/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Button } from '$lib/components/ui/button/index.js';

	let { type, targetId, returnTo }: { type: 'link' | 'list'; targetId: string; returnTo: string } = $props();
	let open = $state(false);

	const reasonLabels: Record<string, string> = {
		spam: 'Spam',
		malware: 'Malware or unsafe',
		harassment: 'Harassment',
		illegal: 'Illegal content',
		misleading: 'Misleading',
		other: 'Other'
	};
	let reason = $state('spam');
</script>
<Button
	type="button"
	variant="link"
	class="h-auto p-0 text-xs text-ink-muted no-underline hover:text-brand"
	onclick={() => (open = !open)}>Report</Button
>
{#if open}
	<form class="mt-3 max-w-sm border-t border-hairline pt-3" method="post" action="/report">
		<input type="hidden" name="type" value={type} /><input
			type="hidden"
			name="targetId"
			value={targetId}
		/><input type="hidden" name="returnTo" value={returnTo} />
		<Field.FieldGroup>
			<Field.Field>
				<Field.FieldLabel for="reason">Reason</Field.FieldLabel>
				<Select.Root type="single" name="reason" bind:value={reason}>
					<Select.Trigger id="reason" class="w-full">
						{reasonLabels[reason]}
					</Select.Trigger>
					<Select.Content>
						{#each Object.entries(reasonLabels) as [value, label] (value)}
							<Select.Item {value} {label} />
						{/each}
					</Select.Content>
				</Select.Root>
			</Field.Field>
			<Field.Field>
				<Field.FieldLabel for="explanation">Details (optional)</Field.FieldLabel>
				<Textarea id="explanation" maxlength={1000} name="explanation"></Textarea>
			</Field.Field>
			<Button type="submit" class="justify-self-start">Submit report</Button>
		</Field.FieldGroup>
	</form>
{/if}
