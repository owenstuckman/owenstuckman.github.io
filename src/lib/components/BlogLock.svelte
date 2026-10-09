<!--
	Decrypts a build-time encrypted payload. Shows a password prompt until the
	right password is entered (remembered for the browser session).
-->
<script>
	import { onMount } from 'svelte';
	import { blogLockMessage } from '$lib/config';
	import { blogAuth, savedPassword, unlock } from '$lib/blogUnlock.svelte.js';

	let { payload, children } = $props();

	let value = $state(null);
	let input = $state('');
	let status = $state('checking'); // checking | locked | wrong | busy | open

	async function attempt(password) {
		try {
			value = await unlock(payload, password);
			status = 'open';
			return true;
		} catch {
			return false;
		}
	}

	onMount(async () => {
		const known = blogAuth.password || savedPassword();
		if (!(known && (await attempt(known)))) status = 'locked';
	});

	async function submit(e) {
		e.preventDefault();
		if (!input) return;
		status = 'busy';
		if (!(await attempt(input))) status = 'wrong';
	}
</script>

{#if status === 'open'}
	{@render children(value)}
{:else if status !== 'checking'}
	<div class="gate">
		<div class="stripes" aria-hidden="true"></div>
		<div class="inner">
			<p class="label">Restricted area · Authorized personnel only</p>
			<h1>Blog</h1>
			<p>{blogLockMessage}</p>
			<form onsubmit={submit}>
				<label class="sr-only" for="blog-password">Password</label>
				<input
					id="blog-password"
					type="password"
					autocomplete="current-password"
					placeholder="Password"
					bind:value={input}
					aria-invalid={status === 'wrong'}
					aria-describedby="blog-status"
				/>
				<button type="submit" disabled={status === 'busy'}>
					{status === 'busy' ? 'Checking…' : 'Unlock'}
				</button>
			</form>
			<p id="blog-status" class="status" role="status">
				{status === 'wrong' ? 'That password didn’t work.' : ''}
			</p>
		</div>
	</div>
{/if}

<style>
	.gate {
		max-width: 34rem;
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: var(--radius);
		overflow: hidden;
		box-shadow: var(--shadow);
	}

	.stripes {
		height: 12px;
		background: repeating-linear-gradient(-45deg, var(--tape) 0 12px, var(--tape-ink) 12px 24px);
	}

	.inner {
		padding: 1.75rem;
	}

	h1 {
		font-size: 3rem;
	}

	form {
		display: flex;
		gap: 0.5rem;
		margin-top: 1.25rem;
	}

	input {
		flex: 1;
		min-width: 0;
		padding: 0.6rem 0.8rem;
		font: inherit;
		color: var(--ink);
		background: var(--bg);
		border: 1px solid var(--line);
		border-radius: var(--radius);
	}

	input[aria-invalid='true'] {
		border-color: #dc2626;
	}

	button {
		padding: 0.6rem 1.1rem;
		font-family: var(--font-head);
		font-size: 1.1rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--tape-ink);
		background: var(--tape);
		border: 0;
		border-radius: var(--radius);
		cursor: pointer;
	}

	button:disabled {
		opacity: 0.6;
		cursor: progress;
	}

	.status {
		min-height: 1.5rem;
		margin: 0.5rem 0 0;
		font-size: 0.9rem;
		color: #dc2626;
	}
</style>
