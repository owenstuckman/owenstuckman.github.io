<!-- One modal for the whole page; `project` drives what it shows. -->
<script>
	import ProjectDetails from './ProjectDetails.svelte';

	let { project = $bindable(null) } = $props();
	let dialog = $state();

	$effect(() => {
		if (project && !dialog.open) dialog.showModal();
		if (!project && dialog.open) dialog.close();
	});

	// Clicking the backdrop (the dialog element itself, outside the panel) closes it
	function onclick(e) {
		if (e.target === dialog) dialog.close();
	}
</script>

<!-- Escape closes natively; the click handler only adds backdrop-to-close -->
<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<dialog
	bind:this={dialog}
	{onclick}
	onclose={() => (project = null)}
	aria-label={project?.title}
>
	{#if project}
		<div class="panel">
			<button class="close" type="button" onclick={() => dialog.close()} aria-label="Close">✕</button>
			<ProjectDetails {project} />
		</div>
	{/if}
</dialog>

<style>
	dialog {
		width: min(52rem, calc(100% - 2rem));
		max-height: calc(100vh - 2rem);
		padding: 0;
		border: 1px solid var(--line);
		border-top: 6px solid var(--tape);
		border-radius: var(--radius);
		background: var(--surface);
		color: var(--ink);
		box-shadow: 0 30px 80px -20px rgb(0 0 0 / 0.5);
	}

	dialog::backdrop {
		background: rgb(10 10 10 / 0.55);
		backdrop-filter: blur(3px);
	}

	dialog[open] {
		animation: rise 0.22s ease-out;
	}

	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(12px);
		}
	}

	.panel {
		position: relative;
		padding: 2rem;
	}

	.close {
		position: absolute;
		top: 1rem;
		right: 1rem;
		width: 2.25rem;
		height: 2.25rem;
		border: 1px solid var(--line);
		border-radius: 999px;
		background: var(--surface-2);
		color: var(--ink);
		font-size: 0.9rem;
		cursor: pointer;
	}

	@media (max-width: 36rem) {
		.panel {
			padding: 1.25rem;
		}
	}
</style>
