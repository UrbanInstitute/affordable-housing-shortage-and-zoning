<script>
	/* 
    Slightly odd approach here in order to allow us to place tooltip at 
    mouse location while using the mouseover events within the threebox 3D columns
    to control the visibility and content of the tooltip. 

    Basically:
      This component creates the tooltip and scaffolds the content within. It gets its x,y location
			(relative to the map) from store. 

      The mouseover function on the columns (see layer_housing.js) is responsible for 
      setting the current location of the mouse, updating the opacity of this tooltip, 
			and updating the contents of the tooltip based on whichever station is current hovered
  */
	import { mapMousePos } from '$stores/siteData';

	let width = 250;
	let height;
	let viewportW, viewportH;
	let xOffset = 30;

	let top = 0;
	let left = 0;
	let arrowSide = 'left';

	//  position the tooltip based on location within viewport
	$: x = $mapMousePos.x;
	$: y = $mapMousePos.y;
	$: {
		if (x + xOffset + width > viewportW) {
			// left of mouse
			left = x - xOffset - width;
			arrowSide = 'arrow-right';
		} else {
			// right of mouse
			left = x + xOffset;
			arrowSide = 'arrow-left';
		}

		// top position
		top = y - height / 2;
	}
</script>

<svelte:window bind:innerWidth={viewportW} bind:innerHeight={viewportH} />

<div
	id="map-tooltip"
	bind:clientHeight={height}
	class={arrowSide}
	style:width={`${width}px`}
	style:top={`${top}px`}
	style:left={`${left}px`}
>
	<!-- Station Info -->
	<div class="station-mode">Station Mode</div>
	<div class="station-name">Temp Station</div>
	<div class="station-status">status: station status</div>

	<div class="spacer" />

	<div class="units">Units closest to station</div>
	<div class="divider" />

	<!-- Reform Units -->
	<div class="units-container reform">
		<div class="n-units-container">
			<span class="n-units reform">999,999</span>
		</div>
		<span class="label reform"> possible if <span class="reform-type" /> enacted</span>
	</div>

	<!-- Baseline -->
	<div class="units-container current">
		<div class="n-units-container">
			<span class="n-units current">999,999</span>
		</div>
		<span class="label current"> possible with current zoning</span>
	</div>

	<!-- Existing -->
	<div class="units-container existing">
		<div class="n-units-container">
			<span class="n-units existing">9,999</span>
		</div>
		<span class="label existing"> existing units</span>
	</div>
</div>

<style lang="scss">
	#map-tooltip {
		position: absolute;
		background-color: white;
		padding: 15px;
		box-shadow: 0px 5px 5px rgba(0, 0, 0, 0.15);
		z-index: 10;
		opacity: 0;
		transition: opacity 0.15s;
		border: solid 1px var(--color-gray);
		pointer-events: none; // so that an "invisible" tooltip doesn't block mouseover on other content
	}

	// left facing arrow
	#map-tooltip.arrow-left {
		// arrow
		&:after {
			content: '';
			position: absolute;
			top: 50%;
			left: calc(0% - 20px);
			margin-top: -5px;
			border-style: solid;
			border-color: transparent #ffffff transparent transparent;
			border-width: 10px;
			transform: translate(0, -1px);
		}

		// arrow border
		&:before {
			content: '';
			position: absolute;
			top: 50%;
			left: calc(0% - 20px);
			margin-top: -5px;
			border-style: solid;
			border-color: transparent var(--color-gray) transparent transparent;
			border-width: 11px;
			transform: translate(-2px, -1px);
		}
	}

	// right facing arrow
	#map-tooltip.arrow-right {
		&:after {
			content: '';
			position: absolute;
			top: 50%;
			left: 100%;
			margin-top: -5px;
			border-style: solid;
			border-color: transparent transparent transparent #ffffff;
			border-width: 10px;
			transform: translate(0, -1px);
		}

		&:before {
			content: '';
			position: absolute;
			top: 50%;
			left: 100%;
			margin-top: -5px;
			border-style: solid;
			border-color: transparent transparent transparent var(--color-gray);
			border-width: 11px;
			transform: translate(1px, -1px);
		}
	}

	.station-mode {
		font-size: var(--text-sm);
		text-transform: uppercase;
	}

	.station-name {
		font-size: var(--text-xl);
		font-weight: var(--font-bold);
		margin: 2px 0px;
	}

	.station-status {
		font-size: var(--text-sm);
		text-transform: lowercase;
		font-style: italic;
	}

	.spacer {
		height: 16px;
		width: 100%;
	}

	.units {
		font-weight: var(--font-bold);
	}

	.units-container {
		width: 100%;
		display: flex;
		gap: 8px;
		margin: 8px 0px;
	}

	.n-units-container {
		width: 23%;
		text-align: right;
	}

	.n-units {
		align-self: flex-start;
		font-weight: var(--font-bold);
		text-align: right;
		border-bottom: solid 3px;

		&.reform {
			border-color: var(--color-yellow); // this can be overwritten by mouseover action
		}

		&.current {
			border-color: var(--color-gray-darkeset);
		}

		&.existing {
			border-color: var(--color-gray-dark);
		}
	}

	.label {
		width: 70%;
	}

	.divider {
		width: 100%;
		height: 2px;
		border-bottom: solid 1px var(--color-gray);
		margin: 4px 0px 10px;
	}
</style>
