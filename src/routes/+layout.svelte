<script>
	import '../app.css';
	let { children } = $props();
</script>

<div class="min-h-screen bg-background">
	<nav class="bg-background border-b fixed w-full top-0 z-50">
		<div class="container flex justify-between items-center py-6">
			<a href="/" class="text-2xl font-bold text-foreground">Owen Stuckman</a>
			<div class="space-x-8">
				<a href="/about" class="text-lg text-foreground hover:text-primary">About</a>
				<a href="/projects" class="text-lg text-foreground hover:text-primary">Projects</a>
				<a href="/contact" class="text-lg text-foreground hover:text-primary">Contact</a>
			</div>
		</div>
	</nav>
	<div class="h-[80px]"></div> <!-- Increased height to match larger nav -->
	<main class="container py-4">
		{@render children()}
	</main>
</div>
