<script>
	// Type alias 'Props' represents an object that may contain a 'children' property of type 'Snippet' from Svelte
	/**
	 * @typedef {Object} Props
	 * @property {import('svelte').Snippet} [children]
	 */

	// Initialize the 'children' variable from the component's props, adhering to the 'Props' type
	/** @type {Props} */
	let { children } = $props();
</script>

<div class="callout">
	{@render children?.()}
</div>