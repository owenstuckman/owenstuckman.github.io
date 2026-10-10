<script>
	import { lazyImage } from '$lib/actions/lazyImage.js';
	import { imageSrc } from '$lib/projects.js';

	let { project, eager = false, onopen } = $props();
</script>

<button class="card" type="button" onclick={() => onopen(project)} aria-haspopup="dialog">
	<div class="media">
		{#if project.image}
			<img
				use:lazyImage
				src={imageSrc(project.image)}
				alt=""
				loading={eager ? 'eager' : 'lazy'}
				decoding="async"
			/>
		{:else}
			<span class="placeholder label">No image on file</span>
		{/if}
		<span class="bin">{project.code}</span>
	</div>
	<div class="content">
		<h3>{project.title}</h3>
		<p class="short">{project.shortDescription}</p>
		<p class="meta label">{project.date}{project.type ? ` · ${project.type}` : ''}</p>
	</div>
</button>

<style>

	.card {
		display: flex;
		flex-direction: column;
		width: 100%;
		padding: 0;
		text-align: left;
		font: inherit;
		color: inherit;
		cursor: pointer;
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: var(--radius);
		overflow: hidden;
		box-shadow: var(--shadow);
		transition:
			transform 0.2s ease,
			border-color 0.2s ease;
	}

	.card:hover {
		transform: translateY(-3px);
		border-color: var(--tape);
	}

	.media {
		position: relative;
		aspect-ratio: 16 / 9;
		display: grid;
		place-items: center;
		background: var(--surface-2);
		border-bottom: 1px solid var(--line);
		overflow: hidden;
	}

	/* skeleton shimmer until the image arrives */
	.media::before {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(
			100deg,
			transparent 30%,
			color-mix(in srgb, var(--ink) 6%, transparent) 50%,
			transparent 70%
		);
		background-size: 200% 100%;
		animation: shimmer 1.4s linear infinite;
	}

	.media:has(img:global(.loaded))::before,
	.media:has(img:global(.failed))::before,
	.media:has(.placeholder)::before {
		display: none;
	}

	.media img {
		position: relative;
		width: 100%;
		height: 100%;
		object-fit: contain;
		padding: 1rem;
		opacity: 0;
		filter: grayscale(1);
		transition:
			opacity 0.4s ease,
			filter 0.3s ease;
	}

	.media img:global(.loaded) {
		opacity: 1;
	}

	.card:hover .media img {
		filter: none;
	}

	.placeholder {
		font-size: 0.7rem;
	}

	/* external image that 404s or blocks hotlinking */
	.media:has(img:global(.failed))::after {
		content: 'Image unavailable';
		position: absolute;
		font-family: var(--font-mono);
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--muted);
	}

	.bin {
		position: absolute;
		top: 0.6rem;
		left: 0.6rem;
		padding: 0.1rem 0.4rem;
		font-family: var(--font-mono);
		font-size: 0.7rem;
		color: var(--tape-ink);
		background: var(--tape);
		border-radius: 2px;
	}

	.content {
		padding: 1rem 1.1rem 1.1rem;
	}

	h3 {
		margin: 0 0 0.35rem;
	}

	.short {
		margin: 0 0 0.6rem;
		color: var(--muted);
		line-height: 1.45;
	}

	.meta {
		margin: 0;
		font-size: 0.68rem;
	}

	@keyframes shimmer {
		to {
			background-position: -200% 0;
		}
	}
</style>
