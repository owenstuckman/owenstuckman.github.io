<script>
	import '../app.css';
	let { children } = $props();

	function navigateTo(path) {
		window.location.href = path;
	}
</script>

<div class="min-h-screen bg-gray-50">
	<nav class="bg-white shadow-lg fixed w-full top-0 z-50 border-b border-gray-200">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style="background-color: white;">
			<div class="flex justify-between items-center h-16">
				<button onclick={() => navigateTo('/')} class="text-2xl font-bold text-gray-800 hover:text-primary transition-colors">Owen Stuckman</button>
				<div class="flex space-x-6">
					<button onclick={() => navigateTo('/about')} class="px-4 py-2 text-lg font-medium text-gray-700 hover:text-primary hover:bg-gray-50 transition-all duration-200">
						About
					</button>
					<button onclick={() => navigateTo('/projects')} class="px-4 py-2 text-lg font-medium text-gray-700 hover:text-primary hover:bg-gray-50 transition-all duration-200">
						Projects
					</button>
					<button onclick={() => navigateTo('/contact')} class="px-4 py-2 text-lg font-medium text-gray-700 hover:text-primary hover:bg-gray-50 transition-all duration-200">
						Contact
					</button>
				</div>
			</div>
		</div>
	</nav>
	<div class="h-16"></div>
	<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<div class="bg-white rounded-lg shadow-lg p-8">
			{@render children()}
		</div>
	</main>
</div>
