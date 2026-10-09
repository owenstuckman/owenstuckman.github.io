<script>
	import BlogLock from '$lib/components/BlogLock.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Blog · Owen Stuckman</title>
</svelte:head>

<BlogLock payload={data.payload}>
	{#snippet children(posts)}
		<p class="label">Station 03 · Blog</p>
		<h1>Blog</h1>
		{#if posts.length === 0}
			<p>No posts yet. Check back soon!</p>
		{:else}
			<ul class="posts">
				{#each posts as post}
					<li>
						<a href="/blog/{post.slug}">{post.title}</a>
						{#if post.date}<span class="label">{post.date}</span>{/if}
					</li>
				{/each}
			</ul>
		{/if}
	{/snippet}
</BlogLock>

<style>
	.posts {
		list-style: none;
		padding: 0;
		margin: 2rem 0 0;
		max-width: 42rem;
		border-top: 1px solid var(--line);
	}

	.posts li {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 1rem;
		margin: 0;
		padding: 0.9rem 0;
		border-bottom: 1px solid var(--line);
	}

	.posts a {
		font-size: 1.15rem;
		font-weight: 700;
	}
</style>
