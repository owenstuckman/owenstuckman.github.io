<script>
	let { title = '', description = '' } = $props();
</script>

<article class="card">
	<p class="status label"><span class="light" aria-hidden="true"></span>In progress</p>
	<h3>{title}</h3>
	<p class="desc">{description}</p>
</article>

<style>
	.card {
		position: relative;
		padding: 1.1rem 1.2rem 1.2rem;
		background: var(--surface);
		border: 1px solid var(--line);
		border-left: 6px solid var(--tape);
		border-radius: var(--radius);
		box-shadow: var(--shadow);
	}

	.status {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		margin: 0 0 0.5rem;
		font-size: 0.68rem;
	}

	.light {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--signal);
		box-shadow: 0 0 0 0 var(--signal);
		animation: pulse 2s ease-out infinite;
	}

	@keyframes pulse {
		70% {
			box-shadow: 0 0 0 7px transparent;
		}
		100% {
			box-shadow: 0 0 0 0 transparent;
		}
	}

	h3 {
		margin: 0 0 0.35rem;
	}

	.desc {
		margin: 0;
		color: var(--muted);
	}
</style>
