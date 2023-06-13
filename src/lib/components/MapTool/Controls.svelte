<script>
	import { slide, fade } from 'svelte/transition';
	import siteCopy from '$data/siteCopy.json';
	import controlsIcon from '$assets/icon_controls.svg';
	import closeIcon from '$assets/icon_close.svg';
	import infoIconDefault from '$assets/icon_info-black.svg';
	import infoIconHovered from '$assets/icon_info-blue.svg';
	import {
		jurisdiction,
		jurisdictionOpts,
		demographic,
		demographicOpts,
		stationType,
		stationTypeOpts,
		reformType,
		reformTypeOpts,
		housingEstimates,
		demographicLayerData,
		demographicLayerLegend
	} from '$stores/siteData';
	import { gtagEvent } from '$utils/GoogleTrackingEvents.js';
	import Dropdown from './Dropdown.svelte';
	import LegendQuantile from './LegendQuantile.svelte';

	const handleUpdate = (name, e) => {
		let newValue = e.detail.value;
		if (name === 'jurisdiction') {
			jurisdiction.set(newValue);
		} else if (name === 'demographic') {
			demographic.set(newValue);
		} else if (name === 'stationType') {
			stationType.set(newValue);
		} else if (name === 'reformType') {
			reformType.set(newValue);
		} else {
			console.log('unrecognized dropdown name: ', name);
		}

		// --- Push event to google tracking
		// get the display name rather than the variable for easier tracking
		let eventValue;
		if (name === 'jurisdiction') {
			eventValue = $jurisdictionOpts.find((d) => d.key === newValue).display;
		} else if (name === 'reformType') {
			eventValue = $reformTypeOpts.find((d) => d.key === newValue).display;
		} else if (name === 'stationType') {
			eventValue = $stationTypeOpts.find((d) => d.key === newValue).display;
		} else if (name === 'demographic') {
			eventValue = $demographicOpts.find((d) => d.key === newValue).display;
		}
		gtagEvent('button-click', {
			'firing-event-name': `map.control.${name}`,
			'selected-option': eventValue
		});
	};

	// $: console.log(
	// 	'current options',
	// 	$jurisdiction,
	// 	$demographic,
	// 	$demographicLayerData,
	// 	$stationType,
	// 	$reformType,
	// 	$housingEstimates
	// );

	let open = true;
	let duration = 300;

	// -- construct reform sentence parts
	$: reformDiffEstimate = $housingEstimates.reformOverBaseline.toLocaleString('en-US');
	$: baselineEstimate = $housingEstimates.baselineTotal.toLocaleString('en-US');
	$: existingEstimate = $housingEstimates.existing.toLocaleString('en-US');
	$: jurisdictionName = $jurisdictionOpts.find((d) => d.key === $jurisdiction).display;

	let reformMsgA, reformMsgB, reformMsgC, reformMsgD;
	$: reformMsgA = ` currently has <span class="existing-value">${existingEstimate} housing units</span> within a half mile of transit and is zoned for a maxiumum of <span class="current-value">${baselineEstimate} units</span>.`;
	$: if ($reformType === 'all_reforms') {
		// i.e. "Enacted all"
		reformMsgB = 'If policymakers enacted ';
		reformMsgC = ' zoning changes, ';
	} else if ($reformType === 'baseline_under_zoning') {
		// i.e. "No Zoning Changes"
		reformMsgB = 'If policymakers enact ';
		reformMsgC = ' zoning changes, ';
	} else {
		reformMsgB = 'If policymakers enacted the ';
		reformMsgC = ` zoning `;
	}
	$: if (reformDiffEstimate === '0') {
		reformMsgD = `<span class="reform-value">no additional units</span> could be built.`;
	} else {
		reformMsgD = `an additional <span class="reform-value">${reformDiffEstimate} units</span> could be built.`;
	}

	// --- Reform Definition tooltip
	let infoIcon = infoIconDefault;
	$: showTooltip = [
		'plexify_reform',
		'multiply_reform',
		'legalize_reform',
		'middle_reform',
		'legalize_reform'
	].includes($reformType);
	$: currentDefinition = siteCopy.reformDefinitions.find((d) => d.name === $reformType)?.definition;
</script>

<div class="controls-container">
	{#if !open}
		<!-- CLOSED CONTROLS -->
		<div
			class="controls-closed"
			in:fade={{ delay: duration }}
			on:click={() => (open = !open)}
			on:keypress={() => (open = !open)}
		>
			Controls<img src={controlsIcon} alt="" />
		</div>
	{:else}
		<!-- OPEN CONTROLS -->
		<div class="controls-open" transition:slide={{ duration }}>
			<div class="close-button">
				<img
					src={closeIcon}
					style:width={'24px'}
					on:click={() => (open = !open)}
					on:keypress={() => (open = !open)}
					alt=""
				/>
			</div>

			<!-- Reform controls -->
			<div class="reform-controls control-section">
				<Dropdown
					options={$jurisdictionOpts}
					currentValue={$jurisdiction}
					on:update={(e) => handleUpdate('jurisdiction', e)}
				/>
				{@html reformMsgA}
				<br />
				{@html reformMsgB}
				<Dropdown
					options={$reformTypeOpts}
					currentValue={$reformType}
					on:update={(e) => handleUpdate('reformType', e)}
				/>
				{@html reformMsgC}
				{#if showTooltip}
					<div
						id="reform-tooltip-container"
						data-tooltip={currentDefinition}
						on:focus={() => (infoIcon = infoIconHovered)}
						on:mouseover={() => (infoIcon = infoIconHovered)}
						on:mouseleave={() => (infoIcon = infoIconDefault)}
					>
						<img id="reform-tooltip" src={infoIcon} alt="" />
					</div>
					{@html ` change, `}
				{/if}
				{@html reformMsgD}
			</div>

			<!-- Transit controls -->
			<div class="transit-controls control-section">
				<Dropdown
					options={$stationTypeOpts}
					currentValue={$stationType}
					on:update={(e) => handleUpdate('stationType', e)}
				/>
			</div>

			<!-- Demographic controls -->
			<div class="demographic-controls control-section">
				<Dropdown
					style="white"
					options={$demographicOpts}
					currentValue={$demographic}
					on:update={(e) => handleUpdate('demographic', e)}
				/>
				<div class="legend-container">
					<LegendQuantile legendProps={$demographicLayerLegend} width={265} height={60} />
				</div>
			</div>
			<!-- {#if showTooltip}
				<div class="reform-definition">* {currentDefinition}</div>
			{/if} -->
		</div>
	{/if}
</div>

<style lang="scss">
	.controls-container {
		z-index: 100;
	}

	.controls-open {
		width: 350px;
		padding: 16px;
		display: flex;
		flex-direction: column;
		background-color: white;
		border: solid 1px var(--color-gray-darkest);
	}

	.close-button {
		width: 100%;
		display: flex;
		justify-content: flex-end;

		img {
			cursor: pointer;
		}
	}

	#reform-tooltip-container {
		display: inline-block;
		position: relative;
		top: 4px;
		margin-left: 0px;
		cursor: pointer;
	}

	#reform-tooltip {
		display: inline-block;
		width: 20px;
		height: 20px;

		&:hover {
			opacity: 0.9;
		}
	}

	.reform-definition {
		margin-top: 8px;
		font-size: var(--text-sm);
		line-height: var(--leading-normal);
	}

	.control-section {
		padding: 16px 0;
		border-bottom: solid 1px var(--color-gray);
		font-size: var(--text-xl);
		font-weight: var(--font-normal);
		line-height: 1.8;

		:global(span) {
			font-weight: var(--font-bold);
			white-space: nowrap;
		}

		:global(span.existing-value) {
			border-bottom: solid 3px var(--color-gray);
		}

		:global(span.current-value) {
			border-bottom: solid 3px var(--color-gray-darkest);
		}

		:global(span.reform-value) {
			border-bottom: solid 3px var(--color-yellow);
		}

		&:last-of-type {
			border-bottom: none;
		}
	}

	.controls-closed {
		width: 160px;
		height: 50px;
		padding: 8px 11px;
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: var(--text-lg);
		font-weight: var(--font-bold);
		line-height: var(--leading-none);
		text-transform: uppercase;
		color: var(--color-white);
		background-color: var(--color-gray-darkest);
		cursor: pointer;

		img {
			width: 30px;
			height: 30px;
		}
	}

	// Tooltip
	[data-tooltip]:before,
	[data-tooltip]:after {
		visibility: hidden;
		opacity: 0;
		pointer-events: none;
		transition: 0.1s ease-out;
		transform: translate(-50%, 5px);
	}

	[data-tooltip]:before {
		position: absolute;
		bottom: 100%;
		left: 50%;
		margin-bottom: 5px;
		padding: 16px;
		width: 250px;
		min-width: 70px;
		max-width: 250px;
		-webkit-border-radius: 3px;
		-moz-border-radius: 3px;
		border-radius: 0px;
		border: solid 1px var(--color-black);
		background-color: rgba(0, 0, 0, 1);
		color: var(--color-white);
		content: attr(data-tooltip);
		text-align: left;
		font-size: var(--text-lg);
		line-height: var(--leading-normal);
		transition: 0.2s ease-out;
		box-shadow: 4px 4px 4px rgba(0, 0, 0, 0.2);
	}

	[data-tooltip]:after {
		position: absolute;
		bottom: 100%;
		left: 50%;
		width: 0;
		border-top: 10px solid #000;
		border-top: 10px solid hsla(0, 0%, 0%, 1);
		border-right: 10px solid transparent;
		border-left: 10px solid transparent;
		content: ' ';
		font-size: 0;
		line-height: 0;
	}

	[data-tooltip]:hover:before,
	[data-tooltip]:hover:after {
		visibility: visible;
		opacity: 1;
		transform: translate(-50%, 0);
	}
	[data-tooltip='false']:hover:before,
	[data-tooltip='false']:hover:after {
		visibility: hidden;
		opacity: 0;
	}
</style>
