<!--
	Minimal nav: three stations along a floor-tape guide path. A little AGV
	drives along the path and parks under whichever station is active.
-->
<script>
	import { onMount, tick } from 'svelte';
	import { page } from '$app/stores';
	import { navItems } from '$lib/config';
	import ThemeSwitch from './ThemeSwitch.svelte';

	let links = $state([]);
	let x = $state(-48);
	let ready = $state(false);

	const isActive = (route, path) =>
		route === '/' ? path === '/' : path === route || path.startsWith(route + '/');

	let activeIndex = $derived(navItems.findIndex((n) => isActive(n.route, $page.url.pathname)));

	function park() {
		const el = links[activeIndex];
		x = el ? el.offsetLeft + el.offsetWidth / 2 - 24 : -48;
	}

	$effect(() => {
		activeIndex;
		if (ready) park();
	});

	onMount(async () => {
		await tick();
		// one frame at the dock entrance, then drive in
		requestAnimationFrame(() => {
			ready = true;
			park();
		});
		const onResize = () => park();
		window.addEventListener('resize', onResize);
		return () => window.removeEventListener('resize', onResize);
	});
</script>

<nav class="dock" aria-label="Main">
	<div class="row">
		<ul>
			{#each navItems as item, i}
				<li>
					<a
						href={item.route}
						bind:this={links[i]}
						aria-current={activeIndex === i ? 'page' : undefined}
					>
						<span class="code">{item.code}</span>
						{item.title}
					</a>
				</li>
			{/each}
		</ul>
		<ThemeSwitch />
	</div>

	<div class="path" aria-hidden="true">
		<svg class="agv" class:ready style="transform: translateX({x}px)" viewBox="0 0 36 18">
			<rect x="1" y="3" width="34" height="11" rx="2" class="body" />
			<rect x="4" y="1" width="12" height="3" rx="1" class="lift" />
			<circle cx="29" cy="6.5" r="1.6" class="beacon" />
			<rect x="21" y="9" width="10" height="2" rx="1" class="stripe" />
			<circle cx="8" cy="15" r="2.5" class="wheel" />
			<circle cx="28" cy="15" r="2.5" class="wheel" />
		</svg>
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

	.agv {
		position: absolute;
		left: 0;
		bottom: 3px;
		width: 48px;
		height: 24px;
		opacity: 0;
	}

	.agv.ready {
		opacity: 1;
		transition:
			transform 1.1s cubic-bezier(0.45, 0, 0.2, 1),
			opacity 0.3s ease;
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
