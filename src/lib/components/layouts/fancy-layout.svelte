<script lang="ts">
	import './github-markdown-light.css';
	export let title = 'Change me';
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<main class="markdown-body" style="width: 100%; padding-top: 2.5rem;">
	<h1>{title}</h1>
	<slot />
</main>