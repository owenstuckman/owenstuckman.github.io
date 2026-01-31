<script>
    export let title = "";
    export let description = "";
</script>

<div class="card">
    <div class="status-indicator"></div>
    <h3>{title}</h3>
    <p>{description}</p>
</div>

<style>
    .card {
        width: 100%;
        padding: 24px;
        background: var(--white, #fff);
        border-radius: 14px;
        border: 1px solid #e5e7eb;
        transition: all 0.2s ease-in-out;
        position: relative;
    }

    .card:hover {
        transform: scale(1.02);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .status-indicator {
        width: 8px;
        height: 8px;
        background: var(--accent, #E63946);
        border-radius: 50%;
        position: absolute;
        top: 24px;
        right: 24px;
    }

    h3 {
        margin: 0 0 0.75rem 0;
        font-size: 1.4rem;
        font-weight: bold;
        color: var(--slate, #2F3948);
        font-family: var(--primaryFont, sans-serif);
    }

    p {
        margin: 0;
        color: #4b5563;
        font-size: 1.1rem;
        line-height: 1.5;
    }
</style>
