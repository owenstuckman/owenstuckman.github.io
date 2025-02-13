<script>
	import '../app.css';
	let { children } = $props();
</script>

<div class="min-h-screen">
	<div class="flex justify-center w-full">
		<nav style="--accent: var(--accent-3, #01c0f0);">
			<a class="homepage-link" href="/" style="margin-left: 2rem;">
				<h1>Owen Stuckman</h1>
			</a>
			<div class="nav-links">
				<a href="/about" title="About" data-sveltekit-preload-data="hover" style="--accent: var(--accent-2, #b45eff);">About</a>
				<a href="/projects" title="Projects" data-sveltekit-preload-data="hover" style="--accent: var(--accent-3, #01c0f0);">Projects</a>
				<a href="/contact" title="Contact" data-sveltekit-preload-data="hover" style="--accent: var(--accent-4, #1de691);">Contact</a>
			</div>
		</nav>
	</div>
	<main>
		<div class="content">
			{@render children()}
		</div>
	</main>
</div>

<style>
	nav {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 2rem;
		background: white;
		box-shadow: 0 2px 4px rgba(0,0,0,0.1);
		position: fixed;
		width: 100%;
		top: 0;
		z-index: 50;
	}

	.homepage-link {
		text-decoration: none;
	}

	h1 {
		font-size: 1.5rem;
		font-weight: bold;
		color: #333;
		margin: 0;
	}

	.nav-links {
		display: flex;
		gap: 1.5rem;
		align-items: center;
	}

	.nav-links a {
		text-decoration: none;
		color: #333;
		font-weight: 500;
		padding: 0.5rem 1rem;
		border-radius: 0.25rem;
		transition: all 0.2s;
	}

	.nav-links a:hover {
		background: rgba(var(--accent), 0.1);
		color: rgb(var(--accent));
	}

	.open-theme-menu {
		background: none;
		border: none;
		cursor: pointer;
		font-size: 1.25rem;
		padding: 0.5rem;
	}

	main {
		margin-top: 4rem;
		padding: 2rem;
	}

	.content {
		max-width: 1200px;
		margin: 0 auto;
		background: white;
		padding: 2rem;
		border-radius: 0.5rem;
		box-shadow: 0 2px 4px rgba(0,0,0,0.1);
	}
</style>
