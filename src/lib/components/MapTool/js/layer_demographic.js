import { get } from 'svelte/store';
import { geoData, demographicLayerData } from '$stores/siteData';
import { removeLayer, getLabelsLayerID } from './mapUtils';

// -- CHOROPLETH SHOWING DEMOGRAPHIC DATA --------------------------------------
export const updateDemographicLayer = (map) => {
	const id = `demographic-layer`;

	// remove this layer if it already exists;
	removeLayer(map, id);

	// --- Prep data for this layer
	let geo = get(geoData); // <- geojson for current tracts
	let layerProps = get(demographicLayerData); // <- tract data (from csv)

	// add 'color' to each tract feature's properties object (in geo data)
	let data = geo.tracts;
	data.features = data.features.map((d) => {
		const tractID = d.properties.TRACT_ID;
		const match = layerProps.data.find((d) => d.TRACT_ID === tractID);
		d.properties.color = match ? match.color : '#f00';
		return d;
	});

	let labelLayerId = getLabelsLayerID(map);

	// --- Add to map
	map.addSource(id, {
		type: 'geojson',
		data
	});
	map.addLayer(
		{
			id,
			source: id,
			type: 'fill',
			paint: {
				'fill-color': ['get', 'color']
			}
		},
		labelLayerId
	);
};
