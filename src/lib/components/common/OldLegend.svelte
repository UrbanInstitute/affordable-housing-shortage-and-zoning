<!-- 
  Generate Legends
  Based on: https://observablehq.com/@d3/color-legend
 -->
<script>
	import { onMount } from 'svelte';
	import {
		quantile,
		range,
		format,
		extent,
		scaleLinear,
		scaleSequential,
		quantize,
		interpolate,
		interpolateRound
	} from 'd3';
	import { color } from '$data/variables.json';

	export let colorScale;
	export let title = '';
	export let tickSize = 6;
	export let width = 320;
	export let height = 44 + tickSize;
	export let margin = { top: 15, right: 0, bottom: 15, left: 0 };
	export let nTicks = width / 64;

	let x;
	let n;
	let type;
	let xlink;
	let tickVals;
	let tickFormat;
	let barWidth = width - margin.left - margin.right;
	let barHeight = height - margin.top - margin.bottom;

	$: if (!colorScale.ticks) {
		const n = Math.round(nTicks + 1);
		tickVals = range(n).map((i) => quantile(colorScale.domain(), i / (n - 1)));
	} else {
		tickVals = colorScale.ticks(nTicks);
	}

	let xScale = scaleLinear().domain(colorScale.domain()).range([margin.left, barWidth]);

	const genRamp = (colorScale, n = 256) => {
		const canvas = document.createElement('canvas');
		canvas.width = n;
		canvas.height = 1;
		const context = canvas.getContext('2d');
		for (let i = 0; i < n; i++) {
			context.fillStyle = colorScale(i / (n - 1));
			context.fillRect(i, 0, 1, 1);
		}
		return canvas;
	};

	onMount(() => {
		// continuous
		if (colorScale.interpolate) {
			type = 'continuous';
			n = Math.min(colorScale.domain().length, colorScale.range().length);
			x = colorScale.copy().rangeRound(quantize(interpolate(margin.left, width - margin.right), n));
			xlink = genRamp(colorScale.copy().domain(quantize(interpolate(0, 1), n))).toDataURL();

			// sequential
		} else if (colorScale.interpolator) {
			type = 'sequential';
			x = Object.assign(
				colorScale.copy().interpolator(interpolateRound(margin.left, width - margin.right)),
				{
					range() {
						return [margin.left, width - margin.right];
					}
				}
			);
			xlink = genRamp(colorScale.interpolator()).toDataURL();

			// quantize, quantile, or threshold scales
		} else if (colorScale.invertExtent) {
			type = 'quantile';
			const thresholds = colorScale.thresholds
				? colorScale.thresholds() // scaleQuantize
				: colorScale.quantiles
				? colorScale.quantiles() // scaleQuantile
				: colorScale.domain(); // scaleThreshold

			const thresholdFormat =
				tickFormat === undefined
					? (d) => d
					: typeof tickFormat === 'string'
					? format(tickFormat)
					: tickFormat;

			x = scaleLinear()
				.domain([-1, colorScale.range().length - 1])
				.rangeRound([margin.left, width - margin.right]);

			// tickFormat = (i) => thresholdFormat(thresholds[i], i);
			tickVals = thresholds;

			xScale = scaleLinear()
				.domain([0, tickVals.length + 1])
				.range([margin.left, barWidth]);
			console.log(extent(colorScale.domain()), thresholds);
			console.log(colorScale.quantiles());
		}
	});
</script>

<svg viewBox={`0 0 ${width} ${height}`}>
	<!-- <rect x={0} y={0} {width} {height} fill="red" opacity={0.2} /> -->

	<!-- COLOR SCALE -->
	{#if ['continuous', 'sequential'].includes(type)}
		<image
			x={margin.left}
			y={margin.top}
			width={barWidth}
			height={barHeight}
			preserveAspectRatio="none"
			xlink:href={xlink}
		/>
	{:else if type === 'quantile'}
		{#each colorScale.range() as color, i}
			<rect
				x={x(i - 1)}
				y={margin.top}
				width={x(i) - x(i - 1)}
				height={height - margin.top - margin.bottom}
				fill={color}
			/>
		{/each}
	{/if}

	<!-- AXIS AND LABELS -->
	<g transform={`translate(0,${height - margin.bottom})`}>
		{#each tickVals as tick, i}
			<line
				class="x-axis"
				x1={xScale(i + 1)}
				x2={xScale(i + 1)}
				y1={-barHeight}
				y2={0}
				stroke={color.white}
				stroke-width={1}
			/>
			<text
				class="tick-label"
				x={xScale(i + 1)}
				y={5}
				text-anchor="middle"
				dominant-baseline="hanging">{Math.floor(tick).toLocaleString('en-us')}</text
			>
		{/each}

		<!-- Title -->
		<text class="title" x={margin.left} y={-barHeight - 6} text-anchor="start">{title}</text>
	</g>
</svg>

<style>
	svg {
		display: block;
		overflow: 'visible';
	}

	.tick-label {
		fill: var(--color-black);
		font-size: 10px;
		font-weight: 500;
	}

	.title {
		text-transform: uppercase;
		font-size: 10px;
		font-weight: 500;
		fill: var(--color-black);
	}
</style>
