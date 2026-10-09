<script>
	import { lazyImage } from '$lib/actions/lazyImage.js';

	let {
		index = 0,
		image = '',
		title = '',
		description = '',
		shortDescription = '',
		type = '',
		skills = [],
		links = [],
		additionalImages = [],
		date = '',
		eager = false
	} = $props();

	let dialog = $state();

	// Bin label, e.g. A-01, A-02 … B-01
	let bin = $derived(
		`${String.fromCharCode(65 + Math.floor(index / 12))}-${String((index % 12) + 1).padStart(2, '0')}`
	);

	// "hackvwin.png" would resolve relative to /projects — anchor bare paths at the site root
	const src = (path) => (/^(https?:|data:|\/)/.test(path) ? path : `/${path}`);

	function linkName(url) {
		try {
			const host = new URL(url).hostname.replace('www.', '');
			if (host.includes('github.com')) return 'GitHub';
			if (host.includes('devpost.com')) return 'Devpost';
			if (host.includes('youtube.com') || host.includes('youtu.be')) return 'YouTube';
			if (host.includes('linkedin.com')) return 'LinkedIn';
			if (host.includes('figma.com')) return 'Figma';
			if (host.includes('apple.com')) return 'App Store';
			const name = host.split('.')[0];
			return name.charAt(0).toUpperCase() + name.slice(1);
		} catch {
			return 'Link';
		}
	}

	function open() {
		dialog.showModal();
	}

	function close() {
		dialog.close();
	}

	// Clicking the backdrop (the dialog element itself, outside the panel) closes it
	function onDialogClick(e) {
		if (e.target === dialog) close();
	}
</script>

<button class="card" type="button" onclick={open} aria-haspopup="dialog">
	<div class="media">
		{#if image}
			<img
				use:lazyImage
				src={src(image)}
				alt=""
				loading={eager ? 'eager' : 'lazy'}
				decoding="async"
			/>
		{:else}
			<span class="placeholder label">No image on file</span>
		{/if}
		<span class="bin">{bin}</span>
	</div>
	<div class="content">
		<h3>{title}</h3>
		<p class="short">{shortDescription}</p>
		<p class="meta label">{date}{type ? ` · ${type}` : ''}</p>
	</div>
</button>

<!-- Escape closes natively; the click handler only adds backdrop-to-close -->
<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<dialog bind:this={dialog} onclick={onDialogClick} aria-label={title}>
	<div class="panel">
		<button class="close" type="button" onclick={close} aria-label="Close">✕</button>

		<header>
			{#if image}
				<div class="thumb"><img src={src(image)} alt="" loading="lazy" /></div>
			{/if}
			<div>
				<p class="label">{bin}{date ? ` · ${date}` : ''}</p>
				<h2>{title}</h2>
				{#if type}<p class="type">{type}</p>{/if}
			</div>
		</header>

		{#if skills?.length}
			<ul class="tags">
				{#each skills as skill}
					<li>{skill}</li>
				{/each}
			</ul>
		{/if}

		<p class="description">{description}</p>

		{#if links?.length}
			<div class="links">
				{#each links as l}
					{#if l?.startsWith('http')}
						<a href={l} target="_blank" rel="noopener">{linkName(l)} ↗</a>
					{:else if l}
						<span class="note">{l}</span>
					{/if}
				{/each}
			</div>
		{/if}

		{#if additionalImages?.length}
			<div class="gallery">
				{#each additionalImages as img}
					<img src={src(img)} alt="" loading="lazy" />
				{/each}
			</div>
		{/if}
	</div>
</dialog>

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

	/* ---------- Modal ---------- */
	dialog {
		width: min(52rem, calc(100% - 2rem));
		max-height: calc(100vh - 2rem);
		padding: 0;
		border: 1px solid var(--line);
		border-top: 6px solid var(--tape);
		border-radius: var(--radius);
		background: var(--surface);
		color: var(--ink);
		box-shadow: 0 30px 80px -20px rgb(0 0 0 / 0.5);
	}

	dialog::backdrop {
		background: rgb(10 10 10 / 0.55);
		backdrop-filter: blur(3px);
	}

	dialog[open] {
		animation: rise 0.22s ease-out;
	}

	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(12px);
		}
	}

	.panel {
		position: relative;
		padding: 2rem;
	}

	.close {
		position: absolute;
		top: 1rem;
		right: 1rem;
		width: 2.25rem;
		height: 2.25rem;
		border: 1px solid var(--line);
		border-radius: 999px;
		background: var(--surface-2);
		color: var(--ink);
		font-size: 0.9rem;
		cursor: pointer;
	}

	header {
		display: flex;
		gap: 1.25rem;
		align-items: center;
		margin-bottom: 1.25rem;
		padding-right: 2.5rem;
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
		.panel {
			padding: 1.25rem;
		}
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
