<script>
    export let items = [];
</script>

<style>
    .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 2fr));
        gap: 0px; 
    }
</style>

<div class="grid">
    {#each items as item}
        <div>
            <ul>
                <li>{item}</li>
            </ul>
        </div>
    {/each}
</div>