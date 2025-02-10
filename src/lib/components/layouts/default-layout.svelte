<script>
  let { children } = $props();
</script>

<article class="prose lg:prose-xl max-w-none prose-headings:font-display prose-headings:text-gray-800 prose-p:text-gray-600 prose-a:text-primary hover:prose-a:text-primary/80 prose-li:text-gray-600">
  {@render children()}
</article> 