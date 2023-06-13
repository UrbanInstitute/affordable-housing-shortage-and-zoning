<script>
	import { fade } from 'svelte/transition';
	import { color } from '$data/variables.json';

	export let currentReform;

	const height = 190;
	const width = 20;
	const margin = { top: 15, bottom: 15, left: 0, right: 0 };
	const svgW = width - margin.left - margin.right;
	const svgH = height - margin.top - margin.bottom;
	const r = (width / 2) * 0.9;
	const reforms = ['Plexify', 'Missing Middle', 'Multiply', 'Legalize'];

	$: showProgress = currentReform !== null;
	$: activeIdx = reforms.indexOf(currentReform);
</script>

{#if showProgress}
	<div class="progress-container" transition:fade>
		<svg {width} {height}>
			<!-- <rect x="0" y="0" {width} {height} fill="#f00" /> -->
			<g transform={`translate(${margin.left}, ${margin.top})`}>
				<line x1={svgW / 2} y1="0" x2={svgW / 2} y2={svgH} stroke={color['gray-darker']} />

				{#each [0, 1, 2, 3] as _, i}
					{@const y = 0.33 * svgH * i}
					<circle
						cx={svgW / 2}
						cy={y}
						{r}
						fill={activeIdx === i ? color['blue-dark'] : color['gray-light']}
						stroke={color['gray-darker']}
					/>
				{/each}
			</g>
		</svg>
	</div>{/if}

<style lang="scss">
	.progress-container {
		width: 30px;
		height: 190px;
		// background-color: yellow;
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
