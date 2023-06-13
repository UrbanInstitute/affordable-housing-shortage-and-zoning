import { get } from 'svelte/store';
import {
	geoData,
	demographicLayerData,
	stationsLayerData,
	stationType,
	stationTypeOpts,
	reformType
} from '$stores/siteData';
import circle from '@turf/circle';
import union from '@turf/union';
import { Threebox, THREE } from 'threebox-plugin';

import { color } from '$data/variables.json';
import chroma from 'chroma-js';

const removeLayer = (map, id) => {
	if (map.getLayer(id)) {
		map.removeLayer(id);
	}
	if (map.getSource(id)) {
		map.removeSource(id);
	}
};

const getLabelsLayerID = (map) => {
	// return the id of the layer containing labels
	const layers = map.getStyle().layers;
	for (const layer of layers) {
		if (layer.type === 'symbol') {
			return layer.id;
		}
	}
	return null;
};

// --- Set the layer order
export const setLayerOrder = (map) => {
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

// --- TRANSIT LINES -----------------------------------------
export const updateTransitLinesLayer = (map) => {
	// --- Prep data for this layer
	let geo = get(geoData);
	let currentStationType = get(stationType);

	let data = JSON.parse(JSON.stringify(geo.transitLines)); // copy so we can mutate original

	// filter the transit lines to match the current stationType
	if (currentStationType !== 'All') {
		data.features = data.features.filter((d) => d.properties.MODE === currentStationType);
	} else {
		let currentStationTypeOpts = get(stationTypeOpts);
		let validOpts = currentStationTypeOpts.map((d) => d.display);
		// data.features = data.features.filter((d) => validOpts.includes(d.properties.MODE));
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
			'line-color': '#000000',
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

// --- STATION LOCATIONS --------------------------------------
export const updateStationsLayer = (map) => {
	// --- Prep data for this layer
	let geo = get(geoData);
	let layerProps = get(stationsLayerData);

	// filter stations geo data to only include currently selected station types
	const stationIDs = layerProps.data.map((d) => d.STATION_ID);
	let data = JSON.parse(JSON.stringify(geo.stations)); // copy so we can mutate original
	data.features = data.features.filter((d) => stationIDs.includes(d.properties.STATION_ID));

	// -- AREA AROUND STATION
	// black circles
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
				'fill-color': '#000'
			}
		},
		labelLayerId
	);

	// --- yellow circles
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

// --- 3D BARS FOR HOUSING LAYER --------------------------------------
export const updateHousingLayer = (map) => {
	// --- Prep data for this layer
	let reformOpt = get(reformType);
	let layerData = get(stationsLayerData);

	// add props for each station that make clear the baseline value, and how many additional the current reform option would add
	let data = layerData.data.map((d) => {
		let baseline = +d['baseline_under_zoning'];
		let additional = +d[reformOpt] - baseline;
		let coords = [+d.lat, +d.long];
		return {
			baseline,
			additional,
			coords,
			...d
		};
	});

	// add to map
	const id = `housing-layer`;
	removeLayer(map, id);

	map.addLayer({
		id,
		type: 'custom',
		renderingMode: '3d',
		onAdd: function (map, gl) {
			window.tb = new Threebox(
				map,
				gl, //get the context from Mapbox
				{
					defaultLights: true,
					enableSelectingObjects: true
					// enableTooltips: true
				}
			);

			// add columns for each stations
			data.forEach((d) => {
				// -- Parent Group
				const group = new THREE.Group();
				let scalar = 0.03;

				// -- Baseline bar
				const opacity = 0.65;
				let baselineH = d.baseline * scalar;
				const baselineBar = new THREE.Mesh(
					new THREE.BoxGeometry(100, 100, baselineH),
					new THREE.MeshPhongMaterial({
						color: '#111', //color['gray-darker'],
						opacity,
						transparent: true,
						side: THREE.DoubleSide
					})
				);
				baselineBar.position.set(0, 0, 0);
				group.add(baselineBar);

				if (d.additional > 0) {
					// --- Added houses Bar
					const addedBarH = d.additional * scalar;
					const addedBar = new THREE.Mesh(
						new THREE.BoxGeometry(100, 100, addedBarH),
						new THREE.MeshPhongMaterial({
							color: color.yellow,
							opacity,
							transparent: true,
							side: THREE.DoubleSide
						})
					);
					let addedBarZ = 0.5 * (baselineH + addedBarH); // each bar is positioned based on origin at center of obj
					addedBar.position.set(0, 0, addedBarZ);
					group.add(addedBar);
				}

				// lift up
				group.position.set(0, 0, -50);

				let tower = tb.Object3D({ obj: group, units: 'meters', anchor: 'center', tooltip: true });
				tower.setCoords(d.coords);
				// tower.addTooltip('text');
				tower.addEventListener('ObjectMouseOver', handleMouseover, false);
				tb.add(tower);
			});
		},
		render: function (gl, matrix) {
			tb.update(); //update Threebox scene
		}
	});
};

function handleMouseover(e) {
	// console.log(e);
}
