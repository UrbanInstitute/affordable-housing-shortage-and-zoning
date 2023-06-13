import { get } from 'svelte/store';
import { geoData, stationsLayerData } from '$stores/siteData';
import circle from '@turf/circle';
import union from '@turf/union';
import { removeLayer, getLabelsLayerID } from './mapUtils';
import { color } from '$data/variables.json';

// --- STATION LOCATIONS --------------------------------------
export const updateStationsLayer = (map) => {
	// --- Prep data for this layer
	let geo = get(geoData);
	let layerProps = get(stationsLayerData);

	// filter stations geo data to only include currently selected station types
	const stationIDs = layerProps.data.map((d) => d.STATION_ID);
	let data = JSON.parse(JSON.stringify(geo.stations)); // copy so we can mutate original
	data.features = data.features.filter((d) => stationIDs.includes(d.properties.STATION_ID));

	// --- Black circles
	let id = `stations-area-layer-1`;
	removeLayer(map, id);

	// create a "area" circle around each station
	let radius = 0.06; // radius (in miles) around each station
	let circles = data.features.map((d) => {
		let center = d.geometry.coordinates;
		return circle(center, radius, {
			steps: 30,
			units: 'miles',
			properties: d.properties
		});
	});

	// combine overlapping areas into single polygon
	let combined = circles[0];
	for (let c of circles) {
		combined = union(combined, c);
	}
	data.features = [combined];

	// --- Add station areas to map
	let labelLayerId = getLabelsLayerID(map);
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
				'fill-color': color.black
			}
		},
		labelLayerId
	);

	// --- Yellow circles
	id = `stations-area-layer-2`;
	removeLayer(map, id);

	data = JSON.parse(JSON.stringify(geo.stations)); // copy so we can mutate original
	data.features = data.features.filter((d) => stationIDs.includes(d.properties.STATION_ID));

	// create a "area" circle around each station
	radius = 0.03; // radius (in miles) around each station
	circles = data.features.map((d) => {
		let center = d.geometry.coordinates;
		return circle(center, radius, {
			steps: 30,
			units: 'miles',
			properties: d.properties
		});
	});

	// combine overlapping areas into single polygon
	combined = circles[0];
	for (let c of circles) {
		combined = union(combined, c);
	}
	data.features = [combined];

	// --- Add station areas to map
	labelLayerId = getLabelsLayerID(map);
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
				'fill-color': color.yellow
			}
		},
		labelLayerId
	);
};
