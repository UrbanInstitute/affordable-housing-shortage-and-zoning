<script>
	export let blocks = [];
</script>

<div class="text-blocks-container body-content">
	{#each blocks as textBlock}
		<p>{@html textBlock.value}</p>
	{/each}
</div>
