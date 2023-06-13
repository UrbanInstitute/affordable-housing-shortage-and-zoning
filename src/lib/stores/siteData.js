import { writable, readable, derived } from 'svelte/store';
import { base } from '$app/paths';
import * as d3 from 'd3';
import jurisdictionsCentroids from '$data/jurisdictionsCentroids.csv';
import jurisdictionData from '$data/jurisdictionData.csv';
import tractData from '$data/tractData.csv';
import stationData from '$data/stationData.csv';
import transitLinesGeo from '$data/allTransitLines.geojson.json';

// all data is hosted at github URL
const baseURL = `${base}/data/geo`;
const getGeo = async (jurisdictionID) => {
	let geo = {};
	let resp;

	// fetch the 4 different geo files for this jurisdiction
	const geoTypes = ['jurisdiction', 'tracts', 'stations'];
	for (const geoType of geoTypes) {
		try {
			resp = await fetch(`${baseURL}/${jurisdictionID}_${geoType}.geojson`);
			geo[geoType] = await resp.json();
		} catch {
			console.log(`Error downloading ${geoType} geoData for ${jurisdictionID}`);
			geo[geoType] = { type: 'FeatureCollection', features: [] };
		}
	}
	geo['transitLines'] = transitLinesGeo; // full set of transit lines for each geo
	return geo;
};

// --- API KEYS
export const MAPBOX_API_KEY = writable('');

// --- Set up drop down options
export const jurisdictionOpts = readable(
	jurisdictionData.map((d) => ({ display: d.name, key: d.JURISDICTION_ID }))
);
export const demographicOpts = readable([
	{ display: 'Median housing value', key: 'Med_housing_value' },
	{ display: 'Building permits', key: 'Permits' },
	{ display: 'Affordable housing', key: 'Subsidized_hsg_share' },
	{ display: 'Cost-burdened renters', key: 'Cost_burdened' },
	{ display: 'Population density', key: 'Pop_density' },
	{ display: 'Median household income', key: 'Med_HH_inc' },
	{ display: 'Share of white households', key: 'White_non_hisp' },
	{ display: 'Share of Black households', key: 'Black_non_hisp' },
	{ display: 'Share of Latino/a households', key: 'Hispanic' },
	{ display: 'Share of Asian households', key: 'Asian_non_Hisp' },
	{ display: 'Job density', key: 'Job_density' },
	{ display: 'Commuters using transit', key: 'Transit_to_work' },
	{ display: 'Commuters biking', key: 'Bike_to_work' },
	{ display: 'Commuters walking', key: 'Walk_to_Work' },
	{ display: 'Commuters using green modes', key: 'Green_commute_share' },
	{ display: 'Adults with college degrees', key: 'BA_plus_25_plus' }
]);

export const reformTypeOpts = readable([
	{ display: 'No', key: 'baseline_under_zoning' },
	{ display: 'Plexify', key: 'plexify_reform' },
	{ display: 'Missing Middle', key: 'middle_reform' },
	{ display: 'Multiply', key: 'multiply_reform' },
	{ display: 'Legalize', key: 'legalize_reform' },
	{ display: 'All', key: 'all_reforms' }
]);

// Set initial values (should be the "key" prop of desired value of corresponding opt)
export const jurisdiction = writable('G53063000'); // SHORELINE -> writable('G53063960'); // SEATTLE -> writable('G53063000');
export const demographic = writable('Pop_density');
export const stationType = writable('All');
export const reformType = writable('multiply_reform');

// hold status of whether map initiated or not
export const mapReady = writable(false);

// --- Set up datasets for each "view" of map
export const mapView = derived(jurisdiction, ($jurisdiction) => {
	if (!$jurisdiction) {
		return {};
	}
	const { lat, lng } = jurisdictionsCentroids.find((d) => d.JURISDICTION_ID === $jurisdiction);
	return {
		lat,
		lng,
		pitch: 60,
		bearing: -30,
		zoom: 12.5
	};
});

export const geoData = derived(jurisdiction, ($jurisdiction, set) => {
	// this should only be called whenever the jurisdiction changes so as to minimize
	// the calls to fetch the remote geoData
	set({});
	if (!$jurisdiction) {
		return;
	}

	// And reset stationType whenver the jurisdiction changes
	stationType.set('All');

	getGeo($jurisdiction).then((data) => set(data));
});

// --- Update stationType opts based on what's available in current jurisdiction
export const stationTypeOpts = derived(geoData, ($geoData) => {
	if (!$geoData.stations) return [{ display: 'All Transit Stations', key: 'All' }];

	// get a list of all stations for current jurisdiction
	const jurisdictionStations = $geoData.stations.features.map((d) => d.properties.STATION_ID);
	let data = stationData.filter((d) => jurisdictionStations.includes(d.STATION_ID));

	let opts = [
		{ display: 'All transit stations', key: 'All' },
		{ display: 'Light rail stations', key: 'Light Rail' },
		{ display: 'Bus rapid transit stations', key: 'Rapid Transit' },
		{ display: 'Streetcar stations', key: 'Streetcar' },
		{ display: 'Commuter rail stations', key: 'Commuter Rail' }
	];

	// set stationType options based on what types of stations are available in this jurisdiction
	let availableOpts = ['All', ...new Set(data.map((d) => d.mode))];
	opts = opts.filter((d) => availableOpts.includes(d.key));

	return opts;
});

// --- Define the data for each layer based on current options
const roundToNearest = (value, nearest) => {
	return Math.round(value / nearest) * nearest;
};

// choropleth legend
export const demographicLayerLegend = derived(demographic, ($demographic) => {
	// set up color scale for current selection
	const scaleData = tractData.map((d) => +d[$demographic]).filter((d) => d > 0); // filter to remove 0s, which dominate many of the "share of..." values
	const colors = ['#c6eaff', '#75b4dd', '#2d7fac', '#0a4c6a'];
	const colorScale = d3
		.scaleQuantile()
		.domain(scaleData) // pass the whole dataset to a scaleQuantile’s domain
		.range(colors);

	// Legend details for each variable
	let title;
	let tickVals = colorScale.quantiles();
	switch ($demographic) {
		case 'Med_housing_value':
			title = 'In US dollars';
			tickVals = tickVals.map((d) => roundToNearest(d, 10)).map((d) => d3.format('$,.0f')(d));
			break;
		case 'Permits':
			title = 'Number of permits';
			tickVals = tickVals.map((d) => roundToNearest(d, 1)).map((d) => d3.format(',')(d));
			break;
		case 'Subsidized_hsg_share':
			title = 'Share of all housing that is federally subsidized';
			tickVals = tickVals.map((d) => d3.format('.0%')(d));
			break;
		case 'Cost_burdened':
			title = 'Share of renters spending >30% of income on rent';
			tickVals = tickVals.map((d) => d3.format('.0%')(d));
			break;
		case 'Pop_density':
			title = 'Residents per square mile';
			tickVals = tickVals.map((d) => roundToNearest(d, 10)).map((d) => d3.format(',')(d));
			break;
		case 'Med_HH_inc':
			title = 'In US dollars';
			tickVals = tickVals.map((d) => roundToNearest(d, 10)).map((d) => d3.format('$,.0f')(d));
			break;
		case 'White_non_hisp':
			title = '';
			tickVals = tickVals.map((d) => d3.format('.0%')(d));
			break;
		case 'Black_non_hisp':
			title = '';
			tickVals = tickVals.map((d) => d3.format('.0%')(d));
			break;
		case 'Hispanic':
			title = '';
			tickVals = tickVals.map((d) => d3.format('.0%')(d));
			break;
		case 'Asian_non_Hisp':
			title = '';
			tickVals = tickVals.map((d) => d3.format('.0%')(d));
			break;
		case 'Job_density':
			title = 'Workers per square mile';
			tickVals = tickVals.map((d) => roundToNearest(d, 10)).map((d) => d3.format(',')(d));
			break;
		case 'Transit_to_work':
			title = 'Share who use transit';
			tickVals = tickVals.map((d) => d3.format('.0%')(d));
			break;
		case 'Bike_to_work':
			title = 'Share who bike';
			tickVals = tickVals.map((d) => d3.format('.1%')(d));
			break;
		case 'Walk_to_Work':
			title = 'Share who walk';
			tickVals = tickVals.map((d) => d3.format('.0%')(d));
			break;
		case 'Green_commute_share':
			title = 'Share who walk, bike, or use transit';
			tickVals = tickVals.map((d) => d3.format('.0%')(d));
			break;
		case 'BA_plus_25_plus':
			title = "Share 25 or older with a bachelor's degree";
			tickVals = tickVals.map((d) => d3.format('.0%')(d));
			break;
	}

	return {
		colorScale,
		title,
		tickVals
	};
});

// choropleth layer
export const demographicLayerData = derived(
	[geoData, demographic, demographicLayerLegend],
	([$geoData, $demographic, $demographicLayerLegend]) => {
		if (!$geoData.tracts) return { data: [] };

		// filter data to only include tracts within this jurisdiction
		const currentTracts = $geoData.tracts.features.map((d) => d.properties.TRACT_ID);
		let data = tractData
			.filter((d) => currentTracts.includes(d.TRACT_ID))
			.map((d) => ({
				TRACT_ID: d.TRACT_ID,
				value: +d[$demographic]
			}));

		// assign colors for each tract based on color scale
		data = data.map((d) => ({ ...d, color: $demographicLayerLegend.colorScale(d.value) }));

		return {
			data
		};
	}
);

// circles for station locations
export const stationsLayerData = derived([geoData, stationType], ([$geoData, $stationType]) => {
	if (!$geoData.stations) return { data: [] };

	// filter data to ony include stations in this jurisdiction
	const jurisdictionStations = $geoData.stations.features.map((d) => d.properties.STATION_ID);
	let data = stationData.filter((d) => jurisdictionStations.includes(d.STATION_ID));

	// now filter data by the selected station type (if applicable)
	if ($stationType !== 'All') {
		data = data.filter((d) => d.mode === $stationType);
	}
	return {
		data
	};
});

// estimates for housing at current jursidcition and zoning reform
export const housingEstimates = derived(
	[jurisdiction, reformType],
	([$jurisdiction, $reformType]) => {
		const currentJurisdiction = jurisdictionData.find((d) => d.JURISDICTION_ID === $jurisdiction);
		const existing = +currentJurisdiction['existing_housing_units'];
		const baseline = +currentJurisdiction['baseline_under_zoning'] - existing;
		const baselineTotal = +currentJurisdiction['baseline_under_zoning'];
		const reform = +currentJurisdiction[$reformType] - existing;
		const reformOverBaseline = reform - baseline;

		return {
			existing,
			baseline,
			baselineTotal,
			reform,
			reformOverBaseline
		};
	}
);

// x and y position of the mouse relative to the map container
export const mapMousePos = writable({ x: 0, y: 0 });
