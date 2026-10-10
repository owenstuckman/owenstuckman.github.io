<script>
	import { onMount } from 'svelte';
	import CurrentCard from '$lib/components/CurrentCard.svelte';
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import ProjectDialog from '$lib/components/ProjectDialog.svelte';
	import { infiniteScroll } from '$lib/actions/infiniteScroll.js';
	import { projectsBatchSize } from '$lib/config';
	import { projects, currentProjects } from '$lib/projects.js';

	let query = $state('');
	let view = $state('grid');
	let selected = $state(null);
	let count = $state(projectsBatchSize);
	let ready = $state(false);

	let filtered = $derived.by(() => {
		const q = query.trim().toLowerCase();
		if (!q) return projects;
		return projects.filter((p) =>
			[p.title, p.shortDescription, p.date, p.type, ...(p.skills ?? [])]
				.join(' ')
				.toLowerCase()
				.includes(q)
		);
	});
	let visible = $derived(filtered.slice(0, count));
	let done = $derived(count >= filtered.length);

	function loadMore() {
		if (!done) count = Math.min(count + projectsBatchSize, filtered.length);
	}

	function setView(v) {
		view = v;
		try {
			localStorage.setItem('projects-view-v2', v);
		} catch {}
	}

	function open(project) {
		selected = project;
	}

	// Keep the URL hash in sync so a project can be linked directly (/projects#wikiarena)
	$effect(() => {
		if (!ready) return;
		const hash = selected ? `#${selected.slug}` : '';
		if (location.hash !== hash) history.replaceState(history.state, '', location.pathname + hash);
	});

	function openFromHash() {
		const slug = decodeURIComponent(location.hash.slice(1));
		if (slug) selected = projects.find((p) => p.slug === slug) ?? null;
	}

	onMount(() => {
		try {
			const saved = localStorage.getItem('projects-view-v2');
			if (saved === 'grid' || saved === 'list') view = saved;
		} catch {}
		openFromHash();
		ready = true;
	});
</script>

<svelte:window onhashchange={openFromHash} />

<svelte:head>
	<title>Projects · Owen Stuckman</title>
</svelte:head>

<p class="label">Station 02 · Projects</p>
<h1>Projects</h1>

<section>
	<h2>On the line now</h2>
	<div class="current">
		{#each currentProjects as project}
			<button type="button" class="current-open" onclick={() => open(project)} aria-haspopup="dialog">
				<CurrentCard title={project.title} description={project.shortDescription} />
			</button>
		{/each}
	</div>
</section>

<section>
	<div class="toolbar">
		<h2>Shipped</h2>
		<div class="controls">
			<label class="search">
				<span class="sr-only">Search projects</span>
				<input
					type="search"
					placeholder="Search {projects.length} projects or skills…"
					bind:value={query}
					oninput={() => (count = projectsBatchSize)}
				/>
			</label>
			<div class="toggle" role="radiogroup" aria-label="View">
				<button type="button" role="radio" aria-checked={view === 'grid'} onclick={() => setView('grid')}>
					Cards
				</button>
				<button type="button" role="radio" aria-checked={view === 'list'} onclick={() => setView('list')}>
					List
				</button>
			</div>
		</div>
	</div>

	{#if filtered.length === 0}
		<p class="empty label">No projects match “{query}”.</p>
	{:else if view === 'list'}
		<ol class="list">
			{#each filtered as project (project.slug)}
				<li>
					<button type="button" onclick={() => open(project)} aria-haspopup="dialog">
						<span class="code">{project.code}</span>
						<span class="main">
							<span class="title">{project.title}</span>
							<span class="short">{project.shortDescription}</span>
						</span>
						<span class="date label">{project.date}</span>
						<span class="arrow" aria-hidden="true">→</span>
					</button>
				</li>
			{/each}
		</ol>
	{:else}
		<div class="grid">
			{#each visible as project, i (project.slug)}
				<ProjectCard {project} eager={i < 3} onopen={open} />
			{/each}
		</div>

		{#if !done}
			<div class="sentinel" use:infiniteScroll={{ onReach: loadMore }}>
				<button type="button" class="more" onclick={loadMore}>
					Load next pallet ({filtered.length - count} left)
				</button>
			</div>
		{/if}
	{/if}
</section>

<ProjectDialog bind:project={selected} />

<style>
	.current {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
		gap: 1rem;
	}

	.current-open {
		display: block;
		width: 100%;
		padding: 0;
		text-align: left;
		font: inherit;
		color: inherit;
		background: none;
		border: 0;
		cursor: pointer;
	}

	.current-open:hover :global(.card) {
		border-color: var(--tape);
	}

	.toolbar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem 1rem;
		margin: 3rem 0 1rem;
	}

	.toolbar h2 {
		margin: 0;
	}

	.controls {
		display: flex;
		gap: 0.5rem;
		flex: 1;
		justify-content: flex-end;
		min-width: min(100%, 22rem);
	}

	.search {
		flex: 1;
		max-width: 22rem;
	}

	input {
		width: 100%;
		padding: 0.5rem 0.75rem;
		font: inherit;
		font-size: 0.95rem;
		color: var(--ink);
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: var(--radius);
	}

	.toggle {
		display: inline-flex;
		padding: 3px;
		border: 1px solid var(--line);
		border-radius: var(--radius);
		background: var(--surface);
	}

	.toggle button {
		padding: 0.3rem 0.75rem;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--muted);
		background: none;
		border: 0;
		border-radius: 3px;
		cursor: pointer;
	}

	.toggle button[aria-checked='true'] {
		color: var(--tape-ink);
		background: var(--tape);
	}

	/* ---------- List view ---------- */
	.list {
		list-style: none;
		margin: 0;
		padding: 0;
		border-top: 1px solid var(--line);
	}

	.list li {
		margin: 0;
		border-bottom: 1px solid var(--line);
	}

	.list button {
		display: grid;
		grid-template-columns: 3.5rem minmax(0, 1fr) auto 1.5rem;
		align-items: center;
		gap: 1rem;
		width: 100%;
		padding: 0.85rem 0.5rem;
		text-align: left;
		font: inherit;
		color: inherit;
		background: none;
		border: 0;
		cursor: pointer;
		transition: background-color 0.15s ease;
	}

	.list button:hover,
	.list button:focus-visible {
		background: var(--surface);
	}

	.code {
		justify-self: start;
		padding: 0.05rem 0.35rem;
		font-family: var(--font-mono);
		font-size: 0.72rem;
		color: var(--tape-ink);
		background: var(--tape);
		border-radius: 2px;
	}

	.main {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.title {
		font-family: var(--font-head);
		font-size: 1.3rem;
		font-weight: 700;
		text-transform: uppercase;
		line-height: 1.15;
	}

	.short {
		color: var(--muted);
		font-size: 0.95rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.date {
		font-size: 0.68rem;
		text-align: right;
	}

	.arrow {
		color: var(--muted);
		transition: transform 0.15s ease;
	}

	.list button:hover .arrow {
		transform: translateX(3px);
		color: var(--ink);
	}

	/* ---------- Grid view ---------- */
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(17rem, 1fr));
		gap: 1.25rem;
	}

	.sentinel {
		display: flex;
		justify-content: center;
		margin-top: 2rem;
	}

	.more {
		font-family: var(--font-mono);
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		padding: 0.6rem 1.1rem;
		border: 1px dashed var(--line);
		border-radius: var(--radius);
		background: var(--surface);
		color: var(--muted);
		cursor: pointer;
	}

	.more:hover {
		border-color: var(--tape);
		color: var(--ink);
	}

	.empty {
		padding: 2rem 0;
	}

	@media (max-width: 40rem) {
		.list button {
			grid-template-columns: 3rem minmax(0, 1fr) 1rem;
			gap: 0.75rem;
		}
		.date {
			display: none;
		}
		.short {
			white-space: normal;
		}
	}
</style>
