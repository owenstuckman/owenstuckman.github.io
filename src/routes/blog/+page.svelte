<script>
	const postModules = import.meta.glob('$lib/posts/*.md', { eager: true });

	const posts = Object.entries(postModules)
		.map(([path, mod]) => {
			const slug = path.split('/').pop().replace('.md', '');
			const { title, date } = mod.metadata ?? {};
			return { slug, title: title ?? slug, date: date ?? '' };
		})
		.sort((a, b) => (a.date < b.date ? 1 : -1));
</script>

<h1>Blog</h1>

<hr />

{#if posts.length === 0}
	<p>No posts yet — check back soon!</p>
{:else}
	<ul class="post-list">
		{#each posts as post}
			<li>
				<a href="/blog/{post.slug}">{post.title}</a>
				{#if post.date}<span class="post-date">{post.date}</span>{/if}
			</li>
		{/each}
	</ul>
{/if}

<style>
	.post-list {
		list-style: none;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.post-list li {
		display: flex;
		align-items: baseline;
		gap: 1rem;
	}

	.post-list a {
		font-size: 1.1rem;
	}

	.post-date {
		font-size: 0.85rem;
		opacity: 0.6;
	}
</style>
