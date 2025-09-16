<script>
    export let src = "";
    export let size = "100px"; // Default size for square
</script>

<style>
    .icon {
        width: var(--icon-size, 50px);
        height: var(--icon-size, 50px);
        border-radius: 10px; /* Rounded corners */
        border: 2px solid gray; /* Gray border */
        overflow: hidden; /* Ensures the image fits within the rounded corners */
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .icon img {
        width: 100%;
        height: 100%;
        object-fit: cover; /* Ensures the image covers the entire area */
    }
</style>

<div class="icon" style="--icon-size: {size};">
    {#if src}
        <img src={src} alt="Icon" />
    {:else}
        <span>No Image</span>
    {/if}
</div>
