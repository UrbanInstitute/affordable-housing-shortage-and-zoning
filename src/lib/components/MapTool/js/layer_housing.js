import { get } from 'svelte/store';
import { reformType, stationsLayerData, mapMousePos } from '$stores/siteData';
import { removeLayer } from './mapUtils';
import { color } from '$data/variables.json';
import { Threebox, THREE } from 'threebox-plugin';

// Column config
const largeThresh = 100_000; // 50_000 threshold for triggering larger columns
const defaultOpacity = 0.65;
const outlineColor = new THREE.Color('#222');
const hoveredOutlineColor = new THREE.Color('#fff');

const generateStationObj = (data) => {
	/* 
		Build the station obj. Each station will be a stacked column comprised of sections
		for existing housing units, housing units added under current zoning, and housing
		units added under reformed zoning
	*/
	const { existing, currentZoning, reformedZoning } = data;

	// config settings for determining column type
	let totalUnits = existing + currentZoning + reformedZoning;
	let useLargeCols = totalUnits > largeThresh;

	// --- Create the parent station object
	let baseDim = 100; // units are meters
	let heightScalar = 0.2; // 0.075;
	if (useLargeCols) {
		let colScalar = 6;
		baseDim = Math.sqrt(baseDim * baseDim * colScalar); // make the footprint colScalar times bigger
		heightScalar = heightScalar / colScalar; // scale the height colScalar times less
	}
	const stationObj = new THREE.Group();

	// --- Create subcolumns for each section
	const colSections = [
		{ nUnits: existing, color: color['gray-dark'] },
		{ nUnits: currentZoning, color: color['gray-darkest'] },
		{ nUnits: reformedZoning, color: color['yellow'] } //useLargeCols ? color['yellow-dark'] : color['yellow'] }
	];
	let totalH = 0; // init var to track the growing height with each bar
	colSections
		.filter((d) => d.nUnits > 0)
		.forEach((d, i) => {
			const barH = d.nUnits * heightScalar;
			let barColor = new THREE.Color(d.color);
			barColor.convertSRGBToLinear();
			const bar = new THREE.Mesh(
				new THREE.BoxGeometry(baseDim, baseDim, barH),
				new THREE.MeshBasicMaterial({
					color: barColor,
					opacity: defaultOpacity,
					transparent: true,
					side: THREE.DoubleSide,
					depthTest: true,
					depthWrite: true
				})
			);
			let barPosZ = totalH + barH / 2;
			bar.position.set(0, 0, barPosZ);

			var geometry = new THREE.EdgesGeometry(bar.geometry);
			var material = new THREE.LineBasicMaterial({ color: outlineColor });
			var wireframe = new THREE.LineSegments(geometry, material);
			wireframe.position.set(0, 0, barPosZ);

			// add to the parent stationObj
			stationObj.add(bar);
			stationObj.add(wireframe);

			// update the total barH
			totalH = totalH + barH;
		});

	// Elevate the stationObj slightly off the ground plane
	stationObj.position.set(0, 0, -50);

	return stationObj;
};

// --- 3D BARS FOR HOUSING LAYER --------------------------------------
export const updateHousingLayer = (map) => {
	// --- Prep data for this layer
	let reformOpt = get(reformType);
	let layerData = get(stationsLayerData);

	// add props for each station that make clear the baseline value, and how many additional the current reform option would add
	let data = layerData.data.map((d) => {
		// each of these values will represent the # of units specific to that category only
		let existing = +d['existing_housing_units'];
		let currentZoning = +d['baseline_under_zoning'] - existing;
		let reformedZoning = +d[reformOpt] - +d['baseline_under_zoning'];
		// let coords = [+d.lat, +d.long];
		let coords = [+d.long, +d.lat];
		let meta = {
			name: d.name,
			mode: d.mode,
			status: d.status
		};
		return {
			existing,
			currentZoning,
			reformedZoning,
			coords,
			meta
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
			// create tb instance if not already created
			if (!window.tb) {
				console.log('creating tb');
				window.tb = new Threebox(
					map,
					gl, // get the context from Mapbox
					{
						defaultLights: true,
						enableSelectingObjects: true
					}
				);
				console.log(tb);
			} else {
				// console.log('tb already created, deleting all objects');
				tb.clear(null, true);
			}

			// add columns for each stations
			data.forEach((d) => {
				let stationObj = generateStationObj(d);

				let tower = tb.Object3D({
					obj: stationObj,
					units: 'meters',
					anchor: 'center',
					tooltip: true
				});
				tower.stationData = d; // attach station data so accessible from tooltip
				tower.setCoords(d.coords);
				tower.addEventListener('ObjectMouseOver', handleStationMouseover, false);
				tower.addEventListener('ObjectMouseOut', handleStationMouseout, false);
				tb.add(tower);
			});

			// Make the default hovered/selected materials invisible
			tb.objects._defaults.materials.boxSelectedMaterial = new THREE.LineBasicMaterial({
				color: '#000',
				transparent: true,
				opacity: 0
			});
			tb.objects._defaults.materials.boxOverMaterial = new THREE.LineBasicMaterial({
				color: '#000',
				transparent: true,
				opacity: 0
			});
		},
		render: function (gl, matrix) {
			tb.update(); //update Threebox scene
		}
	});
};

function handleStationMouseover(e) {
	// update the mouse position store with the current mouse coords
	mapMousePos.set(tb.map.mousePos);

	// walk through children column sections, making outlines white and faces opaque
	const { model, stationData } = e.detail;
	model.children.forEach((child) => {
		if (child.isLineSegments) {
			child.material.color = hoveredOutlineColor;
		}
		if (child.isMesh) {
			child.material.opacity = 1;
		}
	});

	// --- Update tooltip contents
	// Station MetaData
	let { name, mode, status } = stationData.meta;
	mode = mode === 'Rapid Transit' ? 'Bus Rapid Transit' : mode;
	status = status === 'uc' ? 'under construction' : status;
	const tooltip = document.getElementById('map-tooltip');
	tooltip.style.opacity = '1';
	tooltip.querySelector('.station-name').innerHTML = name;
	tooltip.querySelector('.station-mode').innerHTML = mode;
	tooltip.querySelector('.station-status').innerHTML = `status: ${status}`;

	// Current reform type
	const currentReform = get(reformType);
	tooltip.querySelector('.reform-type').innerHTML = currentReform.replace('_', ' ');

	// Station Housing units;
	const { existing, currentZoning, reformedZoning } = stationData;
	const currentZoningTotal = existing + currentZoning;
	const reformedZoningTotal = existing + currentZoning + reformedZoning;

	tooltip.querySelector('.n-units.reform').innerHTML = reformedZoningTotal.toLocaleString('en-US');
	tooltip.querySelector('.n-units.current').innerHTML = currentZoningTotal.toLocaleString('en-US');
	tooltip.querySelector('.n-units.existing').innerHTML = existing.toLocaleString('en-US');

	// hide reform number and label if reform value is 0 (i.e. "no zoning change" selected)
	const reformNode = tooltip.querySelector('.units-container.reform');
	if (reformedZoning === 0) {
		reformNode.style.display = 'none';
	} else {
		reformNode.style.display = 'flex';
	}

	// hide current zoning number and label if value is 0
	const currentNode = tooltip.querySelector('.units-container.current');
	if (currentZoning === 0) {
		currentNode.style.display = 'none';
	} else {
		currentNode.style.display = 'flex';
	}

	// set the color of the reform val
	let reformUnitsNode = tooltip.querySelector('.n-units.reform');
	if (reformedZoningTotal >= largeThresh) {
		reformUnitsNode.style.borderColor = color.yellow;
	} else {
		reformUnitsNode.style.borderColor = color.yellow;
	}
}

function handleStationMouseout(e) {
	const { model } = e.detail;

	// walk through children column sections, reset outlines and faces
	model.children.forEach((child) => {
		if (child.isLineSegments) {
			child.material.color = outlineColor;
		}
		if (child.isMesh) {
			child.material.opacity = defaultOpacity;
		}
	});
	document.getElementById('map-tooltip').style.opacity = '0';
}
