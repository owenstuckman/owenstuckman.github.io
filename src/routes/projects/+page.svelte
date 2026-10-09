<script>
	import currentData from '../../jsons/current_projects.json';
	import projectsData from '../../jsons/projects.json';
	import CurrentCard from '$lib/components/CurrentCard.svelte';
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import { infiniteScroll } from '$lib/actions/infiniteScroll.js';
	import { projectsBatchSize } from '$lib/config';

	const projects = projectsData.projects;
	let count = $state(projectsBatchSize);
	let visible = $derived(projects.slice(0, count));
	let done = $derived(count >= projects.length);

	function loadMore() {
		if (!done) count = Math.min(count + projectsBatchSize, projects.length);
	}
</script>

<svelte:head>
	<title>Projects · Owen Stuckman</title>
</svelte:head>

<p class="label">Station 02 · Projects</p>
<h1>Projects</h1>

<section>
	<h2>On the line now</h2>
	<div class="current">
		{#each currentData.current_projects as project}
			<CurrentCard {...project} />
		{/each}
	</div>
</section>

<section>
	<div class="heading">
		<h2>Shipped</h2>
		<span class="label">{projects.length} units</span>
	</div>
	<div class="grid">
		{#each visible as project, i}
			<ProjectCard {...project} index={i} eager={i < 3} />
		{/each}
	</div>

	{#if !done}
		<div class="sentinel" use:infiniteScroll={{ onReach: loadMore }}>
			<button type="button" class="more" onclick={loadMore}>
				Load next pallet ({projects.length - count} left)
			</button>
		</div>
	{:else}
		<p class="end label">End of line · {projects.length} of {projects.length}</p>
	{/if}
</section>

<style>
	.current {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
		gap: 1rem;
	}

	.heading {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 1rem;
		margin-top: 3rem;
	}

	.heading h2 {
		margin: 0 0 1rem;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(17rem, 1fr));
		gap: 1.25rem;
	}

	.sentinel,
	.end {
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
</style>
