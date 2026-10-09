<script>
	import '../app.css';
	import Dock from '$lib/components/Dock.svelte';
	import { siteTitle, siteDescription } from '$lib/config';

	let { children } = $props();
</script>

<svelte:head>
	<title>{siteTitle}</title>
	<meta name="description" content={siteDescription} />
</svelte:head>

<div class="page">
	<Dock />
	<main id="main">
		{@render children?.()}
	</main>
</div>

<style>
	.page {
		width: 100%;
		max-width: var(--page);
		margin: 0 auto;
		padding: 1.5rem 1rem 5rem;
	}

	@media (min-width: 48rem) {
		.page {
			padding: 2.5rem 2rem 6rem;
		}
	}
</style>
