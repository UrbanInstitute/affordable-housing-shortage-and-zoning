<script>
	import { fade } from 'svelte/transition';
	import Map from './Map.svelte';
	import Controls from './Controls.svelte';
	import Instructions from './Instructions.svelte';

	export let content = {};

	let showInstructions = true;
	const hideInstructions = () => (showInstructions = false);
</script>

<div class="map-tool-wrapper">
	{#if showInstructions}
		<div
			transition:fade={{ duration: 250 }}
			class="instructions-wrapper"
			on:click={hideInstructions}
			on:keypress={hideInstructions}
		>
			<Instructions {content} />
		</div>
	{/if}

	<div class="controls-wrapper">
		<Controls />
	</div>
	<Map />
</div>

<!-- Map Footnote -->
<div class="footnote"><b>Chart note:</b> {@html content.footnote}</div>

<style lang="scss">
	.map-tool-wrapper {
		position: relative;
		height: 75vh;
		width: 100%;
		// border: solid 1px red;
	}

	.instructions-wrapper {
		position: absolute;
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: rgba(0, 0, 0, 0.55);
		z-index: 11;
	}

	.controls-wrapper {
		position: absolute;
		right: 30px;
		top: 30px;
		z-index: 10;
	}

	.footnote {
		padding: 16px;
		b {
			font-size: inherit;
		}
	}

	@media screen and (max-width: 768px) {
		.controls-wrapper {
			right: 16px;
			top: 16px;
		}
	}

	@media screen and (max-width: 400px) {
		.map-tool-wrapper {
			height: 90vh;
		}
	}
</style>
