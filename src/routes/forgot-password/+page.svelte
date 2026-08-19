<script lang="ts">import { enhance } from '$app/forms'; import type { ActionData } from './$types'; let { form }: { form: ActionData } = $props();</script>
<svelte:head><title>Reset password · LinkGarden</title></svelte:head>
<section class="auth-card"><h1>Reset your password</h1><form method="post" use:enhance><label>Email <input required type="email" name="email" /></label><button>Send reset link</button></form>{#if form?.sent}<p class="success">If that account exists, a reset link is on its way.</p>{/if}{#if form?.message}<p class="error">{form.message}</p>{/if}</section>
