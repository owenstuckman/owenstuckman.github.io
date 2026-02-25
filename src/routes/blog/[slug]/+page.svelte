<script>
	let { data } = $props();
	const { component: Post, metadata } = data;
</script>

{#if metadata.title}
	<h1>{metadata.title}</h1>
	{#if metadata.date}<p class="post-date">{metadata.date}</p>{/if}
	<hr />
{/if}

<Post />

<style>
	.post-date {
		opacity: 0.6;
		font-size: 0.9rem;
		margin-top: -0.5rem;
	}
</style>
