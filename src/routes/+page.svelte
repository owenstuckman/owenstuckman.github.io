<script>
	const stack = [
		{ name: 'Flutter + Dart', note: 'mobile apps' },
		{ name: 'Supabase', note: 'Postgres, auth, storage, edge functions' },
		{ name: 'Svelte', note: 'and React, for web apps' },
		{ name: 'TypeScript', note: 'most things on the web' },
		{ name: 'Python', note: 'automation, ML, CV' },
		{ name: 'Java, C++, C#', note: 'across a wide range of projects' },
		{ name: 'Power Platform', note: 'Microsoft RPA' },
		{ name: 'OpenCV', note: 'computer vision' }
	];
</script>

<svelte:head>
	<title>Owen Stuckman</title>
</svelte:head>

<section class="hero">
	<div class="intro">
		<p class="label">Station 01 · About</p>
		<h1>Owen<br />Stuckman</h1>
		<p class="lede">
			I'm an undergraduate studying computer science with a minor in cybersecurity at Virginia
			Tech.
		</p>
	</div>
	<figure class="photo">
		<img src="/headshot.webp" alt="Owen Stuckman" width="291" height="250" />
		<figcaption class="label">ID · VT-CS</figcaption>
	</figure>
</section>

<div class="body">
	<section>
		<p>
			My professional interest is currently focused on automation, whether that's cloud-based or
			desktop robotic process automation. I enjoy creating and improving systems so people can
			spend time on things that matter rather than on inefficiencies or manual analog processes.
		</p>
		<p>
			I've worked across multiple industries including moving and storage, consumer packaged
			goods, small business food, hospitality, and more.
		</p>
		<p>
			In my free time I like to run, play spikeball and pickleball, work on my personal projects
			and businesses, and backpack.
		</p>
		<p class="links">
			<a href="/projects">See my projects →</a>
			<a href="https://github.com/owenstuckman" target="_blank" rel="noopener">GitHub ↗</a>
		</p>
	</section>

	<aside>
		<h2>Tooling</h2>
		<ul class="stack">
			{#each stack as item}
				<li>
					<span class="name">{item.name}</span>
					<span class="note">{item.note}</span>
				</li>
			{/each}
			<li>
				<span class="name">Whatever the job needs</span>
				<span class="note">I'll learn it</span>
			</li>
		</ul>
	</aside>
</div>

<style>
	.hero {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 2rem;
		align-items: end;
		margin-bottom: 3rem;
	}

	h1 {
		margin-bottom: 1rem;
	}

	.lede {
		font-size: 1.25rem;
		max-width: 32rem;
		color: var(--muted);
		margin: 0;
	}

	.photo {
		margin: 0;
		padding: 6px 6px 0;
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: var(--radius);
		box-shadow: var(--shadow);
	}

	.photo img {
		display: block;
		width: 180px;
		height: auto;
		border-radius: 3px;
		filter: grayscale(0.35) contrast(1.05);
	}

	.photo figcaption {
		padding: 0.35rem 0.2rem;
		font-size: 0.65rem;
	}

	.body {
		display: grid;
		grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
		gap: 3rem;
		max-width: 56rem;
	}

	.links {
		display: flex;
		flex-wrap: wrap;
		gap: 1.25rem;
		margin-top: 1.5rem;
	}

	aside h2 {
		margin-top: 0;
		font-size: 1.25rem;
		color: var(--muted);
	}

	.stack {
		list-style: none;
		padding: 0;
		margin: 0;
		border-top: 1px solid var(--line);
	}

	.stack li {
		display: flex;
		flex-direction: column;
		padding: 0.6rem 0;
		margin: 0;
		border-bottom: 1px solid var(--line);
	}

	.name {
		font-weight: 700;
	}

	.note {
		font-size: 0.875rem;
		color: var(--muted);
	}

	@media (max-width: 44rem) {
		.hero {
			grid-template-columns: 1fr;
		}
		.photo {
			order: -1;
			justify-self: start;
		}
		.photo img {
			width: 120px;
		}
		.body {
			grid-template-columns: 1fr;
			gap: 1rem;
		}
	}
</style>
