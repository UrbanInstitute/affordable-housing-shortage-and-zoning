import { get } from 'svelte/store';
import { mapReady, geoData } from '$stores/siteData';
import { updateJurisdictionLayer } from './layer_jurisdiction';
import { updateDemographicLayer } from './layer_demographic';
import { updateTransitLinesLayer } from './layer_transitLines';
import { updateStationsLayer } from './layer_stations';
import { updateHousingLayer } from './layer_housing';

export const initialViewState = {
	longitude: -122.3321,
	latitude: 47.6062,
	zoom: 11,
	pitch: 20,
	bearing: 0
};

export const updateView = (map, view) => {
	// animate camera motion to new view location
	if (!map) return;

	const mapIsReady = get(mapReady);
	if (!mapIsReady) return;

	let { lng, lat, zoom, pitch, bearing } = view;
	map.flyTo({
		center: [lng, lat],
		zoom,
		pitch,
		bearing,
		speed: 0.5,
		essential: true // this animation is considered essential with respect to prefers-reduced-motion
	});
};

// -- Remove source and layer corresponding to given id
export const removeLayer = (map, id) => {
	if (map.getLayer(id)) {
		map.removeLayer(id);
	}
	if (map.getSource(id)) {
		map.removeSource(id);
	}
};

// --- Return the layer id of the first layer containing labels
export const getLabelsLayerID = (map) => {
	const layers = map.getStyle().layers;
	for (const layer of layers) {
		if (layer.type === 'symbol') {
			return layer.id;
		}
	}
	return null;
};

// --- Set the layer order
const setLayerOrder = (map) => {
	// Move demographic layer beneath roads layer
	if (map.getLayer('demographic-layer')) {
		map.moveLayer('demographic-layer', 'road-simple');
	}

	// alternate transit lines and station locations layers
	[
		'stations-area-layer-1',
		'transit-lines-layer-1',
		'stations-area-layer-2',
		'transit-lines-layer-2'
	].forEach((layer) => {
		if (map.getLayer(layer)) {
			map.moveLayer(layer);
		}
	});

	// Position the labels at top, above station and transit lines
	const layers = map.getStyle().layers;
	layers
		.filter((d) => d.type === 'symbol')
		.forEach((layer) => {
			map.moveLayer(layer.id); // <- without a 2nd arg, moveLayer will place the layer at the top
		});

	// Now put housing 3D columns above those labels
	if (map.getLayer('housing-layer')) {
		map.moveLayer('housing-layer');
	}

	// Lastly, set the city label on top of everything so it doesn't get obscured
	// map.moveLayer('settlement-major-label');
};

// --- Update each of the layers in layersArr
export const updateLayers = (map, layersArr) => {
	if (!map) return;

	const mapIsReady = get(mapReady);
	if (!mapIsReady) return;

	let geo = get(geoData);
	if (Object.keys(geo).length === 0) return;

	// loop over each layer in layersArr and call the corresponding update fn
	layersArr.forEach((layerName) => {
		switch (layerName) {
			case 'jurisdiction':
				updateJurisdictionLayer(map);
				break;
			case 'demographic':
				updateDemographicLayer(map);
				break;
			case 'transitLines':
				updateTransitLinesLayer(map);
				break;
			case 'stations':
				updateStationsLayer(map);
				break;
			case 'housing':
				updateHousingLayer(map);
				break;
			default:
				console.log('Can not find a layer that matches ', layerName);
		}
	});
	setLayerOrder(map);
};
