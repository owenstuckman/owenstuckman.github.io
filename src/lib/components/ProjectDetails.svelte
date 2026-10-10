<!-- Full project write-up: shared by the projects-page dialog and the factory side panel. -->
<script>
	import { imageSrc, linkName } from '$lib/projects.js';

	let { project, compact = false } = $props();
</script>

<header class:compact>
	{#if project.image}
		<div class="thumb"><img src={imageSrc(project.image)} alt="" loading="lazy" /></div>
	{/if}
	<div>
		<p class="label">Line {project.code}{project.date ? ` · ${project.date}` : ''}</p>
		<h2>{project.title}</h2>
		{#if project.type}<p class="type">{project.type}</p>{/if}
	</div>
</header>

{#if project.skills?.length}
	<ul class="tags">
		{#each project.skills as skill}
			<li>{skill}</li>
		{/each}
	</ul>
{/if}

<p class="description">{project.description}</p>

{#if project.links?.length}
	<div class="links">
		{#each project.links as l}
			{#if l?.startsWith('http')}
				<a href={l} target="_blank" rel="noopener">{linkName(l)} ↗</a>
			{:else if l}
				<span class="note">{l}</span>
			{/if}
		{/each}
	</div>
{/if}

{#if project.additionalImages?.length}
	<div class="gallery">
		{#each project.additionalImages as img}
			<img src={imageSrc(img)} alt="" loading="lazy" />
		{/each}
	</div>
{/if}

<style>
	header {
		display: flex;
		gap: 1.25rem;
		align-items: center;
		margin-bottom: 1.25rem;
		padding-right: 2.5rem;
	}

	header.compact {
		gap: 0.9rem;
	}

	header.compact .thumb {
		width: 72px;
		height: 72px;
	}

	header.compact h2 {
		font-size: 1.6rem;
	}

	.thumb {
		flex-shrink: 0;
		width: 112px;
		height: 112px;
		display: grid;
		place-items: center;
		padding: 0.5rem;
		background: var(--surface-2);
		border: 1px solid var(--line);
		border-radius: var(--radius);
	}

	.thumb img {
		max-width: 100%;
		max-height: 100%;
		object-fit: contain;
	}

	header h2 {
		margin: 0.15rem 0 0.25rem;
		font-size: 2rem;
	}

	header .label,
	.type {
		margin: 0;
	}

	.type {
		color: var(--muted);
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		list-style: none;
		margin: 0 0 1.25rem;
		padding: 0;
	}

	.tags li {
		margin: 0;
		padding: 0.15rem 0.55rem;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		border: 1px solid var(--line);
		border-radius: 3px;
		background: var(--surface-2);
	}

	.description {
		line-height: 1.7;
	}

	.links {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem 1.25rem;
		margin-top: 1.25rem;
	}

	.note {
		color: var(--muted);
		font-style: italic;
	}

	.gallery {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
		gap: 1rem;
		margin-top: 1.5rem;
	}

	.gallery img {
		width: 100%;
		border-radius: var(--radius);
		border: 1px solid var(--line);
	}

	@media (max-width: 36rem) {
		header {
			flex-direction: column;
			align-items: flex-start;
		}
		.thumb {
			width: 80px;
			height: 80px;
		}
	}
</style>
