<script>
	import { color } from '$data/variables.json';
	import { scaleLinear } from 'd3';

	export let legendProps;
	export let width = 320;
	export let height = 60;
	export let margin = { top: 15, right: 0, bottom: 25, left: 0 };

	$: ({ colorScale, title, tickVals } = legendProps);
	$: barHeight = height - margin.top - margin.bottom;
	$: barWidth = width - margin.left - margin.right;
	$: xScale = scaleLinear()
		.domain([0, colorScale.range().length]) // .domain([-1, colorScale.range().length - 1])
		.rangeRound([margin.left, width - margin.right]);
</script>

<svg viewBox={`0 0 ${width} ${height}`}>
	{#each colorScale.range() as color, i}
		<rect
			x={xScale(i)}
			y={margin.top}
			width={barWidth / colorScale.range().length}
			height={height - margin.top - margin.bottom}
			fill={color}
		/>
	{/each}

	<!-- AXIS AND LABELS -->
	<g transform={`translate(0,${height - margin.bottom})`}>
		{#each tickVals as tick, i}
			{@const tickIdx = i + 1}
			<line
				class="x-axis"
				x1={xScale(tickIdx)}
				x2={xScale(tickIdx)}
				y1={-barHeight}
				y2={0}
				stroke={color.white}
				stroke-width={1}
			/>
			<text
				class="tick-label"
				x={xScale(tickIdx)}
				y={5}
				text-anchor="middle"
				dominant-baseline="hanging">{tick}</text
			>
		{/each}
	</g>

	<!-- TITLE -->
	<text class="title" x={margin.left} y={0} text-anchor="start" dominant-baseline="hanging"
		>{title}</text
	>
</svg>

<style>
	svg {
		display: block;
		overflow: 'visible';
	}

	.tick-label {
		fill: var(--color-black);
		font-size: 12px;
	}

	.title {
		/* text-transform: uppercase; */
		font-size: 12px;
		fill: var(--color-black);
	}
</style>
