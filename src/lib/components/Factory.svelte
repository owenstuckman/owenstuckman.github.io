<!--
	The 3D factory floor with its HUD: a list of production lines, a hover
	tooltip, and a panel for the selected project. three.js is loaded lazily so
	it never blocks the first paint (or runs during prerender).
-->
<script>
	import { onMount, tick } from 'svelte';
	import ProjectDetails from './ProjectDetails.svelte';

	let { projects, about, onfallback } = $props();

	let stage = $state();
	let factory = null;
	let status = $state('loading'); // loading | ready | failed
	let selected = $state(-1);
	let hover = $state({ line: -1, x: 0, y: 0 });
	let listOpen = $state(true);
	let listEl = $state();
	let panelEl = $state();

	let project = $derived(selected >= 0 ? projects[selected] : null);

	// Camera views are framed to the uncovered canvas, so update the HUD (and the
	// scene's insets) before asking for a view.
	async function select(i) {
		selected = i;
		if (i >= 0 && matchMedia('(max-width: 48rem)').matches) listOpen = false;
		await syncInsets();
		factory?.select(i);
	}

	async function home() {
		await select(-1);
		factory?.home();
	}

	async function readWall() {
		await select(-1);
		factory?.wall();
	}

	// Tell the scene which parts of the canvas the HUD covers
	async function syncInsets() {
		await tick();
		if (!factory || !stage) return;
		const s = stage.getBoundingClientRect();
		const mobile = matchMedia('(max-width: 48rem)').matches;
		const insets = { left: 0, right: 0, bottom: 0 };
		if (mobile) {
			if (panelEl) insets.bottom = s.bottom - panelEl.getBoundingClientRect().top;
		} else {
			if (listEl && listOpen) insets.left = listEl.getBoundingClientRect().right - s.left;
			if (panelEl) insets.right = s.right - panelEl.getBoundingClientRect().left;
		}
		factory.setInsets(insets);
	}

	$effect(() => {
		listOpen;
		if (status === 'ready') syncInsets();
	});

	function onkeydown(e) {
		if (e.key === 'Escape' && selected >= 0) home();
	}

	onMount(() => {
		if (matchMedia('(max-width: 48rem)').matches) listOpen = false;

		let destroyed = false;
		let themeObserver;
		const scheme = matchMedia('(prefers-color-scheme: dark)');
		const retheme = () => factory?.setTheme();

		(async () => {
			try {
				const { createFactory } = await import('$lib/factory/scene.js');
				if (destroyed) return;
				const created = await createFactory(stage, {
					projects,
					about,
					onSelect: select,
					onHover: (line, x = 0, y = 0) => {
						const rect = stage.getBoundingClientRect();
						hover = { line, x: x - rect.left, y: y - rect.top };
					}
				});
				if (destroyed) return created.destroy();
				factory = created;
				if (import.meta.env.DEV) window.__factory = created;
				status = 'ready';
				await syncInsets();
				factory.home();
				themeObserver = new MutationObserver(retheme);
				themeObserver.observe(document.documentElement, { attributeFilter: ['data-theme'] });
				scheme.addEventListener('change', retheme);
			} catch (err) {
				console.error('[factory] WebGL unavailable, showing the text version', err);
				status = 'failed';
				onfallback?.();
			}
		})();

		return () => {
			destroyed = true;
			themeObserver?.disconnect();
			scheme.removeEventListener('change', retheme);
			factory?.destroy();
		};
	});
</script>

<svelte:window {onkeydown} onresize={() => status === 'ready' && syncInsets()} />

{#if status !== 'failed'}
	<div class="stage" bind:this={stage}>
		{#if status === 'loading'}
			<div class="loading label" role="status">Powering up the floor…</div>
		{/if}

		<nav class="lines" class:open={listOpen} aria-label="Production lines" bind:this={listEl}>
			<button class="lines-toggle" type="button" aria-expanded={listOpen} onclick={() => (listOpen = !listOpen)}>
				<span>Production lines</span>
				<span class="count">{projects.length}</span>
				<span class="chev" aria-hidden="true">{listOpen ? '−' : '+'}</span>
			</button>
			{#if listOpen}
				<ol>
					{#each projects as p, i}
						<li>
							<button
								type="button"
								class:active={selected === i}
								class:hot={hover.line === i}
								aria-current={selected === i ? 'true' : undefined}
								onclick={() => select(i)}
							>
								<span class="code">{p.code}</span>
								<span class="name">{p.title}</span>
							</button>
						</li>
					{/each}
				</ol>
			{/if}
		</nav>

		{#if hover.line >= 0 && hover.line !== selected}
			<div class="tip" style="transform: translate({hover.x + 14}px, {hover.y + 14}px)" aria-hidden="true">
				<span class="code">{projects[hover.line].code}</span>
				{projects[hover.line].title}
			</div>
		{/if}

		{#if project}
			<aside class="panel" aria-label="Selected project" bind:this={panelEl}>
				<div class="panel-bar">
					<span class="label">Line {project.code} · running</span>
					<button type="button" class="close" onclick={home} aria-label="Close and return to the overview">✕</button>
				</div>
				<div class="panel-body">
					<ProjectDetails {project} compact />
				</div>
				<div class="panel-foot">
					<button type="button" onclick={() => select(Math.max(0, selected - 1))} disabled={selected === 0}>
						← Prev line
					</button>
					<a href="/projects#{project.slug}">Open in projects</a>
					<button
						type="button"
						onclick={() => select(Math.min(projects.length - 1, selected + 1))}
						disabled={selected === projects.length - 1}
					>
						Next line →
					</button>
				</div>
			</aside>
		{/if}

		<div class="hud-bottom">
			<button type="button" class="chip" onclick={home}>↺ Overview</button>
			<button type="button" class="chip" onclick={readWall}>Read the wall</button>
			<span class="hint label">Drag to look around · Scroll or pinch to zoom · Click a line</span>
		</div>
	</div>
{/if}

<style>
	.stage {
		position: relative;
		height: calc(100svh - 8.5rem);
		min-height: 30rem;
		overflow: hidden;
		border-top: 1px solid var(--line);
		border-bottom: 1px solid var(--line);
		background: var(--bg);
		touch-action: none;
	}

	.stage :global(canvas) {
		display: block;
		width: 100%;
		height: 100%;
		outline: none;
	}

	.loading {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
	}

	/* ---------- shared HUD chrome ---------- */
	.lines,
	.panel,
	.tip,
	.chip {
		background: color-mix(in srgb, var(--surface) 92%, transparent);
		backdrop-filter: blur(6px);
		border: 1px solid var(--line);
		border-radius: var(--radius);
		box-shadow: var(--shadow);
	}

	.code {
		flex-shrink: 0;
		padding: 0 0.3rem;
		font-family: var(--font-mono);
		font-size: 0.68rem;
		color: var(--tape-ink);
		background: var(--tape);
		border-radius: 2px;
	}

	/* ---------- line list ---------- */
	.lines {
		position: absolute;
		top: 1rem;
		left: 1rem;
		width: 17rem;
		max-height: calc(100% - 5.5rem);
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.lines-toggle {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
		padding: 0.6rem 0.8rem;
		font-family: var(--font-head);
		font-size: 1.1rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		color: var(--ink);
		background: none;
		border: 0;
		cursor: pointer;
	}

	.lines.open .lines-toggle {
		border-bottom: 1px solid var(--line);
	}

	.count {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		color: var(--muted);
	}

	.chev {
		margin-left: auto;
		font-family: var(--font-mono);
	}

	.lines ol {
		list-style: none;
		margin: 0;
		padding: 0.3rem;
		overflow-y: auto;
		overscroll-behavior: contain;
	}

	.lines li {
		margin: 0;
	}

	.lines li button {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		width: 100%;
		padding: 0.4rem 0.5rem;
		text-align: left;
		font: inherit;
		font-size: 0.9rem;
		color: var(--ink);
		background: none;
		border: 0;
		border-radius: 4px;
		cursor: pointer;
	}

	.lines li button:hover,
	.lines li button.hot {
		background: var(--surface-2);
	}

	.lines li button.active {
		background: color-mix(in srgb, var(--tape) 30%, transparent);
	}

	.name {
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	/* ---------- hover tip ---------- */
	.tip {
		position: absolute;
		top: 0;
		left: 0;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.35rem 0.6rem;
		font-family: var(--font-head);
		font-size: 1rem;
		font-weight: 700;
		text-transform: uppercase;
		pointer-events: none;
		white-space: nowrap;
	}

	/* ---------- selected project panel ---------- */
	.panel {
		position: absolute;
		top: 1rem;
		right: 1rem;
		bottom: 1rem;
		width: min(26rem, calc(100% - 2rem));
		display: flex;
		flex-direction: column;
		border-top: 5px solid var(--tape);
		animation: slide 0.25s ease-out;
	}

	@keyframes slide {
		from {
			opacity: 0;
			transform: translateX(12px);
		}
	}

	.panel-bar,
	.panel-foot {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
	}

	.panel-bar {
		border-bottom: 1px solid var(--line);
	}

	.panel-bar .label {
		font-size: 0.68rem;
	}

	.close {
		width: 2rem;
		height: 2rem;
		border: 1px solid var(--line);
		border-radius: 999px;
		background: var(--surface-2);
		color: var(--ink);
		cursor: pointer;
	}

	.panel-body {
		flex: 1;
		overflow-y: auto;
		overscroll-behavior: contain;
		padding: 1rem 1.1rem;
		font-size: 0.95rem;
	}

	.panel-foot {
		border-top: 1px solid var(--line);
		font-size: 0.85rem;
	}

	.panel-foot button {
		padding: 0.3rem 0.5rem;
		font: inherit;
		color: var(--ink);
		background: none;
		border: 1px solid var(--line);
		border-radius: 4px;
		cursor: pointer;
	}

	.panel-foot button:disabled {
		opacity: 0.4;
		cursor: default;
	}

	/* ---------- bottom bar ---------- */
	.hud-bottom {
		position: absolute;
		left: 1rem;
		bottom: 1rem;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		pointer-events: none;
	}

	.chip {
		pointer-events: auto;
		padding: 0.45rem 0.8rem;
		font: inherit;
		font-size: 0.9rem;
		color: var(--ink);
		cursor: pointer;
	}

	.hint {
		font-size: 0.66rem;
		text-shadow: 0 0 6px var(--bg);
	}

	@media (max-width: 48rem) {
		.stage {
			height: calc(100svh - 7.5rem);
		}
		.lines {
			left: 0.5rem;
			top: 0.5rem;
			right: 0.5rem;
			width: auto;
			max-height: 55%;
		}
		.panel {
			top: auto;
			left: 0.5rem;
			right: 0.5rem;
			bottom: 0.5rem;
			width: auto;
			max-height: 60%;
		}
		.hint {
			display: none;
		}
		.hud-bottom {
			left: 0.5rem;
			bottom: 0.5rem;
		}
		.panel ~ .hud-bottom {
			display: none;
		}
	}
</style>
