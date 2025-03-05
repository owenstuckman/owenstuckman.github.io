<script>
    import { onMount } from "svelte";
    import { fade, scale } from "svelte/transition";
    
    export let title = "";
    export let description = "";
    export let size = "medium";
</script>

<div class="card" style="width: 300px; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center;">
    <h3>{title}</h3>
    <p>{description}</p>
</div>

<style>
    .card {
        transition: all 0.2s ease-in-out;
        margin: 0 auto;
    }

    .card:hover {
        transform: scale(1.02);
    }

    h3 {
        margin: 0 0 0.5rem 0;
        font-size: 1.25rem;
        font-weight: bold;
    }

    p {
        margin: 0;
        color: #4b5563;
    }
</style>
