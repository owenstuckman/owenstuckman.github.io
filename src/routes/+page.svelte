<script>
	import Factory from '$lib/components/Factory.svelte';
	import { about } from '$lib/about.js';
	import { projects } from '$lib/projects.js';

	let showText = $state(false);
</script>

<svelte:head>
	<title>Owen Stuckman</title>
</svelte:head>

<h1 class="sr-only">{about.name}</h1>

<div class="bleed">
	<Factory {projects} {about} onfallback={() => (showText = true)} />
</div>

<div class="below">
	<button type="button" class="text-toggle" aria-expanded={showText} onclick={() => (showText = !showText)}>
		{showText ? 'Hide' : 'Read'} the wall as text
	</button>
	<a href="/projects">All projects as a list →</a>
</div>

<section class="text" class:sr-only={!showText} aria-label="About">
	<p class="label">Station 01 · About</p>
	<div class="cols">
		<div>
			<h2>{about.name}</h2>
			<p class="lede">{about.lede}</p>
			{#each about.paragraphs as p}
				<p>{p}</p>
			{/each}
			<p><a href={about.github} target="_blank" rel="noopener">GitHub ↗</a></p>
		</div>
		<div>
			<h2>Tooling</h2>
			<ul class="stack">
				{#each about.tooling as item}
					<li><strong>{item.name}</strong> <span>{item.note}</span></li>
				{/each}
			</ul>
		</div>
	</div>
</section>

<style>
	.bleed {
		width: 100vw;
		margin: -2rem 0 0 calc(50% - 50vw);
	}

	.below {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin-top: 1.25rem;
	}

	.text-toggle {
		padding: 0.45rem 0.9rem;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--ink);
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: var(--radius);
		cursor: pointer;
	}

	.text {
		margin-top: 2.5rem;
	}

	.cols {
		display: grid;
		grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
		gap: 3rem;
	}

	.cols h2 {
		margin-top: 0;
	}

	.lede {
		font-size: 1.2rem;
		color: var(--muted);
	}

	.stack {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.stack li {
		display: flex;
		flex-direction: column;
		padding: 0.5rem 0;
		margin: 0;
		border-bottom: 1px solid var(--line);
	}

	.stack span {
		font-size: 0.875rem;
		color: var(--muted);
	}

	@media (max-width: 44rem) {
		.cols {
			grid-template-columns: 1fr;
			gap: 1rem;
		}
	}
</style>
