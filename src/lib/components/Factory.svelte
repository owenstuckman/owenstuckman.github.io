<!--
	The 3D factory floor with its HUD: a list of production lines, a hover
	tooltip, and a panel for the selected project. three.js is loaded lazily so
	it never blocks the first paint (or runs during prerender).
-->
<script>
	import { onMount, tick } from 'svelte';
	import ProjectDetails from './ProjectDetails.svelte';
	import { ZONES } from '$lib/projects.js';
	import { recipeFor, KIND_NAMES } from '$lib/factory/recipes.js';
	import { dock } from '$lib/dock.svelte.js';
	import { experience, draft } from '$lib/experience.js';

	let { projects, about, onfallback } = $props();

	let stage = $state();
	let factory = null;
	let status = $state('loading'); // loading | ready | failed
	let selected = $state(-1);
	let stageIndex = $state(-1); // selected station on the line, -1 = whole line
	let selectedExp = $state(-1); // selected job on the timeline
	let hover = $state({ line: -1, station: -1, exp: -1, x: 0, y: 0 });
	let zone = $state('Wall');
	let listOpen = $state(true);
	let listEl = $state();
	let panelEl = $state();

	let project = $derived(selected >= 0 ? projects[selected] : null);
	let job = $derived(selectedExp >= 0 ? experience[selectedExp] : null);
	const bySlug = new Map(projects.map((p) => [p.slug, p]));
	const linkedProjects = (e) => e.projects.map((slug) => bySlug.get(slug)).filter(Boolean);
	let recipe = $derived(project ? recipeFor(project) : null);
	let stored = $derived(project?.status === 'archived');
	let unit = $derived(stored ? 'Pallet' : 'Stage');
	let station = $derived(recipe && stageIndex >= 0 ? recipe.stations[stageIndex] : null);
	const stationName = (i, s) => recipeFor(projects[i]).stations[s]?.label;

	// Floor order: running lines, construction sites, then the warehouse
	const groups = [
		{ status: 'running', title: 'Running lines' },
		{ status: 'construction', title: 'Under construction' },
		{ status: 'archived', title: 'Warehouse' }
	].map((g) => ({ ...g, items: projects.filter((p) => p.status === g.status) }));
	const ordered = groups.flatMap((g) => g.items);
	let position = $derived(project ? ordered.indexOf(project) : -1);

	// Camera views are framed to the uncovered canvas, so update the HUD (and the
	// scene's insets) before asking for a view.
	async function select(i, s = -1) {
		selected = i;
		stageIndex = s;
		selectedExp = -1;
		if (i >= 0 && matchMedia('(max-width: 48rem)').matches) listOpen = false;
		await syncInsets();
		factory?.select(i, s);
		panelBody?.scrollTo({ top: 0 });
	}

	async function selectExperience(i) {
		selected = -1;
		stageIndex = -1;
		selectedExp = i;
		if (i >= 0 && matchMedia('(max-width: 48rem)').matches) listOpen = false;
		await syncInsets();
		factory?.selectExperience(i, i >= 0 ? linkedProjects(experience[i]).map((p) => p.index) : []);
		panelBody?.scrollTo({ top: 0 });
	}

	// Jump-to views: the side rail and the stops on the top-bar tape
	const JUMPS = [
		{ view: 'wall', label: 'Wall', short: 'Wall', zone: 'Wall' },
		{ view: 'timeline', label: 'Work history', short: 'Jobs', zone: null },
		{ view: 'lines', label: 'Production floor', short: 'Floor', zone: 'Lines' },
		{ view: 'warehouse', label: 'Warehouse', short: 'Store', zone: 'Warehouse' }
	];

	async function jump(view) {
		selectedExp = -1;
		await select(-1);
		factory?.[view]();
	}

	const home = () => jump('home');
	let panelBody = $state();

	const step = (d) => select(ordered[Math.min(ordered.length - 1, Math.max(0, position + d))].index);

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
		if (e.key === 'Escape' && selectedExp >= 0) return jump('timeline');
		if (e.key !== 'Escape' || selected < 0) return;
		if (stageIndex >= 0) select(selected);
		else home();
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
					experience,
					draft,
					onSelect: select,
					onSelectExperience: selectExperience,
					onHover: (line, x = 0, y = 0, station = -1, exp = -1) => {
						const rect = stage.getBoundingClientRect();
						hover = { line, station, exp, x: x - rect.left, y: y - rect.top };
					},
					onMove: ({ progress, zone: z }) => {
						zone = z;
						dock.progress = progress;
						dock.label = z;
					}
				});
				if (destroyed) return created.destroy();
				factory = created;
				if (import.meta.env.DEV) window.__factory = created;
				status = 'ready';
				dock.owner = 'factory';
				dock.stops = created.stops.map((stop) => ({ ...stop, go: () => jump(stop.view) }));
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
			Object.assign(dock, { owner: null, stops: [], label: '', progress: 0 });
		};
	});
</script>

<svelte:window {onkeydown} onresize={() => status === 'ready' && syncInsets()} />

{#if status !== 'failed'}
	<div class="stage" bind:this={stage}>
		{#if status === 'loading'}
			<div class="loading label" role="status">Powering up the floor…</div>
		{/if}

		<nav class="lines" class:open={listOpen} aria-label="Floor index" bind:this={listEl}>
			<button class="lines-toggle" type="button" aria-expanded={listOpen} onclick={() => (listOpen = !listOpen)}>
				<span>Floor index</span>
				<span class="count">{projects.length}</span>
				<span class="chev" aria-hidden="true">{listOpen ? '−' : '+'}</span>
			</button>
			{#if listOpen}
				<div class="groups">
					{#if experience.length}
						<p class="group label">Work history · {experience.length}</p>
						<ol>
							{#each experience as e (e.index)}
								<li>
									<button
										type="button"
										class:active={selectedExp === e.index}
										class:hot={hover.exp === e.index}
										onclick={() => selectExperience(e.index)}
									>
										<span class="code exp">{e.code}</span>
										<span class="name">{e.org}</span>
									</button>
								</li>
							{/each}
						</ol>
					{/if}
					{#each groups as group}
						<p class="group label">{group.title} · {group.items.length}</p>
						<ol>
							{#each group.items as p (p.index)}
								<li>
									<button
										type="button"
										class:active={selected === p.index}
										class:hot={hover.line === p.index}
										class:muted={p.status === 'archived'}
										aria-current={selected === p.index ? 'true' : undefined}
										onclick={() => select(p.index)}
									>
										<span class="code" class:uc={p.status === 'construction'}>{p.code}</span>
										<span class="name">{p.title}</span>
									</button>
								</li>
							{/each}
						</ol>
					{/each}
				</div>
			{/if}
		</nav>

		{#if hover.exp >= 0 && hover.exp !== selectedExp}
			<div class="tip" style="transform: translate({hover.x + 14}px, {hover.y + 14}px)" aria-hidden="true">
				<span class="code exp">{experience[hover.exp].code}</span>
				{experience[hover.exp].org}
				<span class="tip-stage">· {experience[hover.exp].dates}</span>
			</div>
		{:else if hover.line >= 0 && !(hover.line === selected && hover.station === stageIndex)}
			<div class="tip" style="transform: translate({hover.x + 14}px, {hover.y + 14}px)" aria-hidden="true">
				<span class="code">{projects[hover.line].code}</span>
				{projects[hover.line].title}
				{#if hover.station >= 0}<span class="tip-stage">· {stationName(hover.line, hover.station)}</span>{/if}
			</div>
		{/if}

		{#if job}
			<aside class="panel" aria-label="Selected job" bind:this={panelEl}>
				<div class="panel-bar">
					<span class="label">Work history · {job.code}</span>
					<button type="button" class="close" onclick={() => jump('timeline')} aria-label="Close and return to the timeline">✕</button>
				</div>
				<div class="panel-body" bind:this={panelBody}>
					<p class="label">{job.dates}</p>
					<h2 class="job-org">{job.org}</h2>
					<p class="job-role">{job.role ?? 'Role to come'}</p>
					{#if job.summary}<p>{job.summary}</p>{/if}
					{#if job.bullets?.length}
						<ul class="job-bullets">
							{#each job.bullets as b}<li>{b}</li>{/each}
						</ul>
					{/if}
					{#if linkedProjects(job).length}
						<section class="stages" aria-label="Projects from this job">
							<p class="label">Projects from this job · lit up on the floor</p>
							<ol>
								{#each linkedProjects(job) as p}
									<li>
										<button type="button" onclick={() => select(p.index)}>
											<span class="code" class:uc={p.status === 'construction'}>{p.code}</span>
											<span class="st-name">{p.title}</span>
										</button>
									</li>
								{/each}
							</ol>
						</section>
					{/if}
					{#if draft}
						<p class="draft-note label">Draft from project notes · LinkedIn details coming</p>
					{/if}
				</div>
				<div class="panel-foot">
					<button type="button" onclick={() => selectExperience(selectedExp - 1)} disabled={selectedExp <= 0}>← Earlier</button>
					<button type="button" onclick={() => jump('timeline')}>Timeline</button>
					<button
						type="button"
						onclick={() => selectExperience(selectedExp + 1)}
						disabled={selectedExp >= experience.length - 1}>Later →</button
					>
				</div>
			</aside>
		{:else if project}
			<aside class="panel" aria-label="Selected project" bind:this={panelEl}>
				<div class="panel-bar">
					<span class="label">{ZONES[project.status].label} · {project.code}</span>
					<button type="button" class="close" onclick={home} aria-label="Close and return to the overview">✕</button>
				</div>
				<div class="panel-body" bind:this={panelBody}>
					{#if station}
						<section class="stage-card" aria-label="Station">
							<p class="label">
								{unit} {stageIndex + 1} of {recipe.stations.length}{stored ? '' : ` · ${KIND_NAMES[station.kind]}`}
								{#if !station.built}<span class="planned">Planned</span>{/if}
							</p>
							<h3>{station.label}</h3>
							<p>{station.detail}</p>
							<div class="stage-nav">
								<button type="button" disabled={stageIndex === 0} onclick={() => select(selected, stageIndex - 1)}>← {unit}</button>
								<button type="button" onclick={() => select(selected)}>{stored ? 'All pallets' : 'Whole line'}</button>
								<button
									type="button"
									disabled={stageIndex === recipe.stations.length - 1}
									onclick={() => select(selected, stageIndex + 1)}>{unit} →</button
								>
							</div>
						</section>
					{/if}
					<ProjectDetails {project} compact />
					{#if recipe}
						<section class="stages" aria-label={stored ? 'Pallets' : 'Stations on this line'}>
							<p class="label">
								{stored ? `In storage · ${recipe.stations.length} pallets` : `The line · makes ${recipe.product}s`}
							</p>
							<ol>
								{#each recipe.stations as st, s}
									<li>
										<button
											type="button"
											class:active={stageIndex === s}
											class:planned={!st.built}
											onclick={() => select(selected, s)}
										>
											<span class="num">{s + 1}</span>
											<span class="st-name">{st.label}</span>
											{#if !st.built}<span class="tag">planned</span>{/if}
										</button>
									</li>
								{/each}
							</ol>
						</section>
					{/if}
				</div>
				<div class="panel-foot">
					<button type="button" onclick={() => step(-1)} disabled={position <= 0}>← Prev</button>
					<a href="/projects#{project.slug}">Open in projects</a>
					<button type="button" onclick={() => step(1)} disabled={position >= ordered.length - 1}>Next →</button>
				</div>
			</aside>
		{/if}

		<nav class="rail" class:shifted={!!project || !!job} aria-label="Jump to">
			{#each JUMPS as j, i}
				<button type="button" class:here={zone === j.zone} data-short={j.short} onclick={() => jump(j.view)}>
					<span class="rail-num">{String(i + 1).padStart(2, '0')}</span>
					<span class="rail-label">{j.label}</span>
				</button>
			{/each}
		</nav>

		<div class="hud-bottom">
			<button type="button" class="chip" onclick={home}>↺ Overview</button>
			<span class="hint label">WASD or drag to move · Q/E or right-drag to rotate · Scroll to zoom · Click a station, line, or pallet</span>
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

	.groups {
		min-height: 0;
		overflow-y: auto;
		overscroll-behavior: contain;
		padding-bottom: 0.3rem;
	}

	.group {
		margin: 0;
		padding: 0.6rem 0.8rem 0.2rem;
		font-size: 0.64rem;
	}

	.lines ol {
		list-style: none;
		margin: 0;
		padding: 0 0.3rem;
	}

	.muted .name {
		color: var(--muted);
	}

	.code.uc {
		background: repeating-linear-gradient(-45deg, var(--tape) 0 5px, #ffd75e 5px 10px);
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

	.code.exp {
		color: var(--bg);
		background: var(--ink);
	}

	.job-org {
		margin: 0.1rem 0 0.1rem;
		font-size: 1.8rem;
	}

	.job-role {
		margin: 0 0 0.9rem;
		color: var(--muted);
		font-size: 1.05rem;
	}

	.job-bullets {
		margin: 0 0 1rem;
		padding-left: 1.1rem;
	}

	.draft-note {
		margin-top: 1.25rem;
		font-size: 0.64rem;
	}

	.tip-stage {
		color: var(--muted);
	}

	/* ---------- stations ---------- */
	.stage-card {
		margin: -0.25rem 0 1.25rem;
		padding: 0.9rem 1rem;
		background: var(--surface-2);
		border-left: 4px solid var(--tape);
		border-radius: 4px;
	}

	.stage-card .label {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		margin: 0 0 0.25rem;
		font-size: 0.66rem;
	}

	.stage-card h3 {
		margin: 0 0 0.4rem;
		font-size: 1.5rem;
	}

	.stage-card p:not(.label) {
		margin: 0 0 0.75rem;
		line-height: 1.6;
	}

	.planned {
		padding: 0 0.3rem;
		color: var(--tape-ink);
		background: repeating-linear-gradient(-45deg, var(--tape) 0 5px, #ffd75e 5px 10px);
		border-radius: 2px;
	}

	.stage-nav {
		display: flex;
		gap: 0.4rem;
		flex-wrap: wrap;
	}

	.stage-nav button,
	.stages button {
		font: inherit;
		color: var(--ink);
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: 4px;
		cursor: pointer;
	}

	.stage-nav button {
		padding: 0.25rem 0.55rem;
		font-size: 0.82rem;
	}

	.stage-nav button:disabled {
		opacity: 0.4;
		cursor: default;
	}

	.stages {
		margin-top: 1.5rem;
	}

	.stages .label {
		margin: 0 0 0.5rem;
		font-size: 0.66rem;
	}

	.stages ol {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}

	.stages li {
		margin: 0;
	}

	.stages button {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		width: 100%;
		padding: 0.4rem 0.6rem;
		text-align: left;
	}

	.stages button:hover {
		border-color: var(--tape);
	}

	.stages button.active {
		background: color-mix(in srgb, var(--tape) 30%, var(--surface));
		border-color: var(--tape);
	}

	.stages button.planned {
		border-style: dashed;
		color: var(--muted);
	}

	.num {
		width: 1.4rem;
		font-family: var(--font-mono);
		font-size: 0.72rem;
		color: var(--muted);
	}

	.st-name {
		font-family: var(--font-head);
		font-size: 1.05rem;
		font-weight: 700;
		text-transform: uppercase;
	}

	.tag {
		margin-left: auto;
		font-family: var(--font-mono);
		font-size: 0.62rem;
		text-transform: uppercase;
	}

	/* ---------- jump rail ---------- */
	.rail {
		position: absolute;
		top: 50%;
		right: 1rem;
		transform: translateY(-50%);
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		transition: right 0.25s ease;
	}

	.rail.shifted {
		right: calc(min(26rem, 100% - 2rem) + 2rem);
	}

	/* compact next to the project panel */
	.rail.shifted .rail-label {
		display: none;
	}

	.rail.shifted button::after {
		content: attr(data-short);
	}

	.rail button {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.45rem 0.7rem 0.45rem 0.5rem;
		font-family: var(--font-head);
		font-size: 1rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		color: var(--ink);
		background: color-mix(in srgb, var(--surface) 92%, transparent);
		backdrop-filter: blur(6px);
		border: 1px solid var(--line);
		border-radius: var(--radius);
		box-shadow: var(--shadow);
		cursor: pointer;
	}

	.rail button:hover {
		border-color: var(--tape);
	}

	.rail button.here {
		border-color: var(--tape);
		box-shadow: inset 4px 0 0 var(--tape), var(--shadow);
	}

	.rail-num {
		font-family: var(--font-mono);
		font-size: 0.66rem;
		font-weight: 400;
		color: var(--muted);
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
		.rail {
			top: auto;
			bottom: 0.5rem;
			right: 0.5rem;
			transform: none;
		}
		.rail.shifted {
			display: none;
		}
		.rail-label {
			display: none;
		}
		.rail button {
			padding: 0.45rem 0.6rem;
		}
		.rail button::after {
			content: attr(data-short);
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
