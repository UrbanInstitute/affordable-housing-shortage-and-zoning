<script>
	import Button from '$components/common/Button.svelte';
	import { gtagEvent } from '$utils/GoogleTrackingEvents.js';
	export let textBlocks = [];
	export let showJumpLink = false;

	const scrollToMap = () => {
		const el = document.querySelector('#map-tool');
		if (!el) return;
		gtagEvent('button-click', { 'firing-module-name': 'jumpToMap' }); // log for analytics
		el.scrollIntoView({
			behavior: 'smooth'
		});
	};
</script>

<div class="textblock-container">
	{#each textBlocks as textBlock}
		<div class="text-block">
			<p>{@html textBlock.value}</p>
		</div>
	{/each}
	{#if showJumpLink}
		<div class="button-container">
			<Button style="blue" handleClick={scrollToMap}>Jump to Map ⭣</Button>
		</div>
	{/if}
</div>

<style lang="scss">
	.textblock-container {
		display: flex;
		flex-direction: column;
		gap: 16px;
		width: 66%;
		max-width: 600px;
		padding: 48px 54px;
		border: solid 1px var(--color-gray);
		background-color: white;
		box-shadow: 0px 5px 5px rgba(0, 0, 0, 0.15);
		z-index: 10;
	}

	.button-container {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	@media screen and (max-width: 768px) {
		.textblock-container {
			width: 90%;
		}
	}

	@media screen and (max-width: 400px) {
		.textblock-container {
			padding: 48px 30px;
		}
	}
</style>
