<script>
	import { onMount } from 'svelte';
	import mapboxgl from 'mapbox-gl';
	import { Threebox } from 'threebox-plugin';
	import Tooltip from './Tooltip.svelte';
	import {
		MAPBOX_API_KEY,
		mapReady,
		geoData,
		mapView,
		demographicLayerData,
		stationsLayerData,
		reformType
	} from '$stores/siteData';
	import { initialViewState, updateView, updateLayers } from './js/mapUtils';

	let map = null;
	let mapRef;
	let mapStyle = 'mapbox://styles/urbaninstitute/cleoryx1x000101my2y9cr08m';
	onMount(() => {
		// setup mapbox
		map = new mapboxgl.Map({
			accessToken: $MAPBOX_API_KEY,
			container: mapRef,
			antialias: true,
			dragPan: true,
			dragRotate: false,
			scrollZoom: false,
			style: mapStyle,
			center: [initialViewState.longitude, initialViewState.latitude],
			zoom: initialViewState.zoom,
			pitch: initialViewState.pitch,
			bearing: initialViewState.bearing
		});

		// initiate threebox plugin
		const mapCanvas = map.getCanvas();
		const glCtx = mapCanvas.getContext('webgl');
		window.tb = new Threebox(
			map,
			glCtx, // get the context from Mapbox
			{
				defaultLights: true,
				enableSelectingObjects: true
			}
		);

		const waitForMap = setInterval(() => {
			// check if necessary conditions are met before populating the map loaded
			const mapLoaded = map.loaded();
			const mapViewLoaded = Object.keys($mapView).length > 0;
			const geoDataLoaded = Object.keys($geoData).length > 0;

			// once ready, update the view and the layers
			if (mapLoaded && mapViewLoaded && geoDataLoaded) {
				mapReady.set(true);
				updateLayers(map, ['jurisdiction', 'demographic', 'transitLines', 'stations', 'housing']);
				updateView(map, $mapView);
				clearInterval(waitForMap);
			}
		}, 1000);

		map.on('style.load', function () {
			map.resize();
		});

		map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'bottom-right');
	});

	// map update triggers
	$: $mapView, updateView(map, $mapView);
	$: $geoData, updateLayers(map, ['jurisdiction', 'demographic']);
	$: $demographicLayerData, updateLayers(map, ['demographic']);
	$: $stationsLayerData, updateLayers(map, ['transitLines', 'stations', 'housing']);
	$: $reformType, updateLayers(map, ['housing']);
</script>

<div class="map-container">
	<div id="map" bind:this={mapRef} />
	<Tooltip />
</div>

<style lang="scss">
	.map-container {
		position: relative;
		width: 100%;
		height: 100%;
		min-height: 300px;
		border: solid 1px var(--color-white);
	}

	#map {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		overflow: hidden;
		// border: solid 1px blue;
	}
</style>
