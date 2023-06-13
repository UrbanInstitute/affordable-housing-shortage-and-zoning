import { get } from 'svelte/store';
import { geoData } from '$stores/siteData';
import { removeLayer } from './mapUtils';

// -- OUTLINE AROUND CURRENT JURISDICTION --------------------------------------
export const updateJurisdictionLayer = (map) => {
	const id = `jurisdiction-layer`;

	// remove this layer if it already exists
	removeLayer(map, id);

	// --- Prep the data for this layer
	let data = get(geoData);
	data = data.jurisdiction;

	// --- Add to map
	map.addSource(id, {
		type: 'geojson',
		data
	});
	map.addLayer({
		id: id,
		source: id,
		type: 'line',
		paint: {
			'line-color': '#000',
			'line-width': 2
		}
	});
};
