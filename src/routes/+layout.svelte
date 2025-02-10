<script>
	import '../app.css';
	let { children } = $props();
</script>

<div class="min-h-screen bg-gray-50">
	<nav class="bg-white shadow-md fixed w-full top-0 z-50">
		<div class="container flex justify-between items-center py-6">
			<a href="/" class="text-2xl font-bold text-gray-800 hover:text-primary transition-colors">Owen Stuckman</a>
			<div class="space-x-8">
				<a href="/about" class="text-lg text-gray-600 hover:text-primary transition-colors">About</a>
				<a href="/projects" class="text-lg text-gray-600 hover:text-primary transition-colors">Projects</a>
				<a href="/contact" class="text-lg text-gray-600 hover:text-primary transition-colors">Contact</a>
			</div>
		</div>
	</nav>
	<div class="h-[80px]"></div>
	<main class="container py-8">
		<div class="bg-white rounded-lg shadow-lg p-8">
			{@render children()}
		</div>
	</main>
</div>
