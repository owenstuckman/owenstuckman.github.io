<!--
	Minimal nav plus a floor-tape progress track. The AGV on the tape is an
	indicator: on the factory page it shows where you are along the hall (with
	stops you can jump to); on other pages it shows how far you've scrolled.
-->
<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { navItems } from '$lib/config';
	import { dock } from '$lib/dock.svelte.js';
	import ThemeSwitch from './ThemeSwitch.svelte';

	const AGV_W = 48;

	let width = $state(0);
	let scrolled = $state(0);
	let ready = $state(false);
	let facing = $state(1); // 1 → driving right, -1 → reversing

	const isActive = (route, path) =>
		route === '/' ? path === '/' : path === route || path.startsWith(route + '/');
	let activeIndex = $derived(navItems.findIndex((n) => isActive(n.route, $page.url.pathname)));

	let owned = $derived(!!dock.owner);
	let progress = $derived(owned ? dock.progress : scrolled);
	let x = $derived(progress * Math.max(0, width - AGV_W));
	let readout = $derived(owned ? dock.label : `${Math.round(scrolled * 100)}%`);

	let last = 0;
	$effect(() => {
		const p = progress;
		if (Math.abs(p - last) > 0.001) facing = p >= last ? 1 : -1;
		last = p;
	});

	function onScroll() {
		const max = document.documentElement.scrollHeight - innerHeight;
		scrolled = max > 4 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
	}

	$effect(() => {
		$page.url.pathname;
		requestAnimationFrame(onScroll);
	});

	onMount(() => {
		onScroll();
		requestAnimationFrame(() => (ready = true));
	});
</script>

<svelte:window onscroll={onScroll} onresize={onScroll} />

<nav class="dock" aria-label="Main">
	<div class="row">
		<ul>
			{#each navItems as item, i}
				<li>
					<a href={item.route} aria-current={activeIndex === i ? 'page' : undefined}>
						<span class="code">{item.code}</span>
						{item.title}
					</a>
				</li>
			{/each}
		</ul>
		<ThemeSwitch />
	</div>

	<div class="path" bind:clientWidth={width} class:with-stops={owned && dock.stops.length}>
		{#if owned}
			{#each dock.stops as stop}
				<button
					type="button"
					class="stop"
					class:here={dock.label === stop.label}
					style="left: {stop.at * Math.max(0, width - AGV_W) + AGV_W / 2}px"
					onclick={() => stop.go()}
				>
					<span class="pin" aria-hidden="true"></span>
					{stop.label}
				</button>
			{/each}
		{/if}
		<div class="agv" class:ready class:owned style="transform: translateX({x}px)" aria-hidden="true">
			{#if readout && !(owned && dock.stops.length)}
				<span class="readout">{readout}</span>
			{/if}
			<svg viewBox="0 0 36 18" style="transform: scaleX({facing})">
				<rect x="1" y="3" width="34" height="11" rx="2" class="body" />
				<rect x="4" y="1" width="12" height="3" rx="1" class="lift" />
				<circle cx="29" cy="6.5" r="1.6" class="beacon" />
				<rect x="21" y="9" width="10" height="2" rx="1" class="stripe" />
				<circle cx="8" cy="15" r="2.5" class="wheel" />
				<circle cx="28" cy="15" r="2.5" class="wheel" />
			</svg>
		</div>
	</div>
</nav>

<style>
	.dock {
		position: relative;
		margin-bottom: 3.5rem;
	}

	.row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		flex-wrap: wrap;
	}

	ul {
		display: flex;
		gap: 0.25rem;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	li {
		margin: 0;
	}

	a {
		display: inline-flex;
		align-items: baseline;
		gap: 0.4rem;
		padding: 0.35rem 0.6rem;
		border-radius: var(--radius);
		font-family: var(--font-head);
		font-size: 1.25rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		text-decoration: none;
		color: var(--muted);
	}

	a:hover {
		color: var(--ink);
		background: var(--surface-2);
	}

	a[aria-current='page'] {
		color: var(--ink);
	}

	.code {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		font-weight: 400;
		color: var(--muted);
	}

	a[aria-current='page'] .code {
		color: var(--tape-ink);
		background: var(--tape);
		padding: 0 0.25rem;
		border-radius: 2px;
	}

	.path {
		position: relative;
		height: 32px;
		margin-top: 0.4rem;
	}

	/* dashed floor-tape guide line */
	.path::before {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		height: 4px;
		background: repeating-linear-gradient(90deg, var(--tape) 0 22px, transparent 22px 34px);
		opacity: 0.9;
	}

	.path.with-stops {
		margin-bottom: 1.3rem;
	}

	.agv {
		position: absolute;
		left: 0;
		bottom: 3px;
		width: 48px;
		height: 24px;
		opacity: 0;
	}

	.agv svg {
		display: block;
		width: 100%;
		height: 100%;
		transition: transform 0.25s ease;
	}

	.agv.ready {
		opacity: 1;
		transition:
			transform 0.35s ease-out,
			opacity 0.3s ease;
	}

	/* the factory reports every frame, so follow it closely */
	.agv.ready.owned {
		transition:
			transform 0.12s linear,
			opacity 0.3s ease;
	}

	.readout {
		position: absolute;
		bottom: 100%;
		left: 50%;
		transform: translateX(-50%);
		margin-bottom: 2px;
		font-family: var(--font-mono);
		font-size: 0.62rem;
		color: var(--muted);
		white-space: nowrap;
	}

	.stop {
		position: absolute;
		top: 100%;
		transform: translateX(-50%);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
		margin-top: -4px;
		padding: 0 0.3rem;
		font-family: var(--font-mono);
		font-size: 0.62rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--muted);
		background: none;
		border: 0;
		cursor: pointer;
	}

	.stop:hover,
	.stop.here {
		color: var(--ink);
	}

	.pin {
		width: 10px;
		height: 10px;
		border: 2px solid var(--tape);
		border-radius: 50%;
		background: var(--bg);
	}

	.stop.here .pin {
		background: var(--tape);
	}

	.body {
		fill: var(--ink);
	}
	.lift {
		fill: var(--muted);
	}
	.stripe {
		fill: var(--tape);
	}
	.wheel {
		fill: var(--surface-2);
		stroke: var(--ink);
		stroke-width: 1.2;
	}
	.beacon {
		fill: var(--signal);
		animation: blink 1.6s steps(2, jump-none) infinite;
	}

	@keyframes blink {
		50% {
			opacity: 0.25;
		}
	}

	@media (max-width: 30rem) {
		a {
			font-size: 1.1rem;
			padding: 0.3rem 0.4rem;
		}
		.code {
			display: none;
		}
	}
</style>
