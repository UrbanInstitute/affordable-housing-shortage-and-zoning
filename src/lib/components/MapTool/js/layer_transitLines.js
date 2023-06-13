import { get } from 'svelte/store';
import { geoData, stationType } from '$stores/siteData';
import { removeLayer } from './mapUtils';
import { color } from '$data/variables.json';

// --- TRANSIT LINES -----------------------------------------
export const updateTransitLinesLayer = (map) => {
	// --- Prep data for this layer
	let geo = get(geoData);
	let currentStationType = get(stationType);

	let data = JSON.parse(JSON.stringify(geo.transitLines)); // copy so we can mutate original

	// filter the transit lines to match the current stationType
	if (currentStationType !== 'All') {
		data.features = data.features.filter((d) => d.properties.MODE === currentStationType);
	}

	// --- Add to map
	// Add thick base line
	let id = 'transit-lines-layer-1';
	removeLayer(map, id);
	map.addSource(id, {
		type: 'geojson',
		data
	});
	map.addLayer({
		id,
		source: id,
		type: 'line',
		paint: {
			'line-color': color.black,
			'line-width': 8
		}
	});

	// Add 2nd lighter line on top
	id = 'transit-lines-layer-2';
	removeLayer(map, id);
	map.addSource(id, {
		type: 'geojson',
		data
	});
	map.addLayer({
		id,
		source: id,
		type: 'line',
		paint: {
			'line-color': color.yellow,
			'line-width': 2
		}
	});
};
