<script>
	import '../app.css';
	let { children } = $props();
</script>


<div class="min-h-screen bg-white">
	<nav class="p-4 border-b">
		<div class="container mx-auto flex justify-between items-center">
			<a href="/" class="text-xl font-bold">Owen Stuckman</a>
			<div class="space-x-4">
				<a href="/about" class="hover:text-gray-600">About</a>
				<a href="/projects" class="hover:text-gray-600">Projects</a>
				<a href="/contact" class="hover:text-gray-600">Contact Me</a>
			</div>
		</div>
	</nav>

	
	
	<main class="container mx-auto px-4 py-8">
		{@render children()}
	</main>
</div>