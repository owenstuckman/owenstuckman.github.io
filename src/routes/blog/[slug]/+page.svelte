<script>
	import BlogLock from '$lib/components/BlogLock.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Blog · Owen Stuckman</title>
</svelte:head>

<BlogLock payload={data.payload}>
	{#snippet children(post)}
		<article>
			<p class="label"><a href="/blog">← Blog</a>{post.date ? ` · ${post.date}` : ''}</p>
			<h1>{post.title}</h1>
			<hr />
			<div class="prose">{@html post.html}</div>
		</article>
	{/snippet}
</BlogLock>

<style>
	article {
		max-width: 44rem;
	}

	h1 {
		font-size: clamp(2.25rem, 6vw, 3.5rem);
	}

	.prose :global(h1) {
		font-size: 2rem;
		margin-top: 2.5rem;
	}

	.prose :global(hr) {
		height: 1px;
		margin: 2rem 0;
		background: var(--line);
	}

	.prose :global(h2) {
		font-size: 1.5rem;
	}
</style>
