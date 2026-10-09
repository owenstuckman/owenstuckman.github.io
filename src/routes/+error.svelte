<script>
	import { page } from '$app/stores';
</script>

<p class="label">Error {$page.status}</p>
<h1>Wrong aisle</h1>
<p>{$page.error?.message}</p>
<p><a href="/">Back to the start</a></p>
