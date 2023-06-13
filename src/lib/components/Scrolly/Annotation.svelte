<script>
	import { fade } from 'svelte/transition';

	export let currentReform;
	export let coordinates = [0, 0]; // px coords of where to place on bg image
	export let scale = 1; // inverse of whatever scale is applied to bg image
	export let text = '';

	$: left = `${coordinates[0]}px`;
	$: top = `${coordinates[1]}px`;
	$: reformClass = currentReform.toLowerCase().replace(' ', '-');

	/* build a transform that will position the annotation above the target coords
    with the arrow pointing down at it. 
  */
	$: transform = `translate(-50%, -100%) translateY(-15px) scale(${scale})`;
</script>

<div transition:fade class={`annotation ${reformClass}`} style:left style:top style:transform>
	<div class="annotation-text">{@html text}</div>
</div>

<style lang="scss">
	.annotation {
		position: absolute;
		width: 100%;
		max-width: 200px;
		padding: 15px;
		background-color: #d1e7af;
		transform-origin: bottom center;
		box-shadow: 0 4px 4px rgb(0, 0, 0, 0.1);
		border: 1px solid var(--color-gray);
	}

	.annotation:after,
	.annotation:before {
		content: '';
		display: block;
		position: absolute;
		left: calc(50% - 10px);
		width: 0;
		height: 0;
		border-style: solid;
	}

	.annotation:after {
		top: 100%;
		border-color: #d1e7af transparent transparent transparent;
		border-width: 10px;
		transform: translate(0, -1px);
	}

	.annotation:before {
		top: 100%;
		border-color: var(--color-gray) transparent transparent transparent;
		border-width: 11px;
		transform: translate(-1px);
	}

	.annotation-text {
		font-size: 14px;
		line-height: 150%;
	}

	// --- Set different colors for different reform types
	.annotation.plexify {
		background-color: #d1e7af;

		&:after {
			border-color: #d1e7af transparent transparent transparent;
		}
	}

	.annotation.missing-middle {
		background-color: #e5cd85;

		&:after {
			border-color: #e5cd85 transparent transparent transparent;
		}
	}

	.annotation.multiply {
		background-color: #a1d2cf;

		&:after {
			border-color: #a1d2cf transparent transparent transparent;
		}
	}

	.annotation.legalize {
		background-color: #ffb6ad;

		&:after {
			border-color: #ffb6ad transparent transparent transparent;
		}
	}
</style>
