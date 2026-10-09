<script>
	import { onMount } from 'svelte';

	const options = [
		{ value: 'light', label: 'Light' },
		{ value: 'system', label: 'Default' },
		{ value: 'dark', label: 'Dark' }
	];

	let theme = $state('system');
	let index = $derived(options.findIndex((o) => o.value === theme));

	onMount(() => {
		try {
			const saved = localStorage.getItem('theme');
			if (saved === 'light' || saved === 'dark') theme = saved;
		} catch {}
	});

	function select(value) {
		theme = value;
		const root = document.documentElement;
		try {
			if (value === 'system') {
				delete root.dataset.theme;
				localStorage.removeItem('theme');
			} else {
				root.dataset.theme = value;
				localStorage.setItem('theme', value);
			}
		} catch {}
	}
</script>

<div class="switch" role="radiogroup" aria-label="Color theme" style="--i: {index}">
	<span class="thumb" aria-hidden="true"></span>
	{#each options as opt}
		<button
			type="button"
			role="radio"
			aria-checked={theme === opt.value}
			title={opt.label}
			onclick={() => select(opt.value)}
		>
			<span class="sr-only">{opt.label}</span>
			{#if opt.value === 'light'}
				<svg viewBox="0 0 24 24" aria-hidden="true"
					><circle cx="12" cy="12" r="4" /><path
						d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
					/></svg
				>
			{:else if opt.value === 'system'}
				<svg viewBox="0 0 24 24" aria-hidden="true"
					><circle cx="12" cy="12" r="8" /><path d="M12 4a8 8 0 0 1 0 16Z" class="fill" /></svg
				>
			{:else}
				<svg viewBox="0 0 24 24" aria-hidden="true"
					><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" /></svg
				>
			{/if}
		</button>
	{/each}
</div>

<style>
	.switch {
		position: relative;
		display: inline-grid;
		grid-template-columns: repeat(3, 2rem);
		height: 2rem;
		padding: 3px;
		box-sizing: content-box;
		border: 1px solid var(--line);
		border-radius: 999px;
		background: var(--surface);
	}

	.thumb {
		position: absolute;
		top: 3px;
		left: 3px;
		width: 2rem;
		height: 2rem;
		border-radius: 999px;
		background: var(--tape);
		transform: translateX(calc(var(--i) * 100%));
		transition: transform 0.25s cubic-bezier(0.3, 0.7, 0.4, 1);
	}

	button {
		position: relative;
		display: grid;
		place-items: center;
		width: 2rem;
		height: 2rem;
		padding: 0;
		border: 0;
		border-radius: 999px;
		background: none;
		color: var(--muted);
		cursor: pointer;
	}

	button[aria-checked='true'] {
		color: var(--tape-ink);
	}

	svg {
		width: 1rem;
		height: 1rem;
		fill: none;
		stroke: currentColor;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	svg .fill {
		fill: currentColor;
		stroke: none;
	}
</style>
