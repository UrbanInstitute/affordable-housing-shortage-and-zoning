/* Script to prep the GEO data (geojson files for jurisdictions, census tracts, and stations)
The goal will be to store these files remotely and have the site load them in 
based on the options selected by the user. The user will be selecting "jurisdiction"
from the tool, and the map will load files for:
  - jurisdiction border
  - census tracts within this jurisdiction
  - stations within this jurisdiction

As such, the files should be named according to the GISJOIN ID value of the jurisdiction
they belong to. 

E.g. for Auburn (GIS JOIN: G53003180), there should be 3 files:
  - G53003180_jurisdiction.geojson
  - G53003180_tracts.geojson
  - G53003180_stations.geojson

These files will be stored in the <repo>/data/* directory so they can be easily
referenced and loaded (once the repo has been published to github)
*/

import fs from 'fs';
import csv from 'csvtojson';
import fastcsv from 'fast-csv';
import stringHash from 'string-hash';

const geoOutputDir = '../static/data/geo';
const dataOutputDir = '../src/lib/data';

const prepJurisdictionFiles = () => {
	console.log('...processing Jurisdiction Files...');
	const inputDir = '../data/raw/jurisdictions';
	fs.readdirSync(inputDir).forEach((file) => {
		if (file.split('.').pop() !== 'geojson') {
			return;
		}
		const GISJOIN = file.split('.')[0];
		const src = `${inputDir}/${file}`;
		const dst = `${geoOutputDir}/${GISJOIN}_jurisdiction.geojson`;
		fs.copyFileSync(src, dst);
	});
};

const prepJurisdictionCentroids = () => {
	console.log('...processing Jurisdiction Files...');
	const inputDir = '../data/raw/jurisdictions';
	const raw = fs.readFileSync(`${inputDir}/jurisdictions_centroids.geojson`);
	let data = JSON.parse(raw);

	// save out just coords and jurisdiction ID as csv file
	data = data.features.map((d) => {
		const JURISDICTION_ID = d.properties.GISJOIN;
		const name = d.properties.NAME;
		let lat = d.geometry.coordinates[1]; // MAYBE BETTER TO USE d.properties.INTPTLAT/INTPTLON?
		let lng = d.geometry.coordinates[0];

		// need to manually adjust a couple of the centroids (usually due to plots of land outside main city)
		if (JURISDICTION_ID === 'G53022640') {
			// Everett
			lat = 47.95811;
			lng = -122.22029;
		} else if (JURISDICTION_ID == 'G53035415') {
			// Kent
			lat = 47.39954;
			lng = -122.21882;
		}

		return {
			JURISDICTION_ID,
			name,
			lat,
			lng
		};
	});

	// write output file
	const ws = fs.createWriteStream(`${dataOutputDir}/jurisdictionsCentroids.csv`);
	fastcsv.write(data, { headers: true }).pipe(ws);
};

const prepTractFiles = () => {
	console.log('...processing Tract Files...');
	const inputDir = '../data/raw/tracts';
	fs.readdirSync(inputDir).forEach((file) => {
		if (file.split('.').pop() !== 'geojson') {
			return;
		}
		const raw = fs.readFileSync(`${inputDir}/${file}`);
		let data = JSON.parse(raw);

		// get the GISJOIN ID for this jurisdiction
		const jurisdictionID = data.features[0].properties.GISJOIN;

		// clean up features
		data.features = data.features.map((d) => {
			let properties = {
				JURISDICTION_ID: d.properties['GISJOIN'],
				TRACT_ID: d.properties['GISJOIN.1'], // this ID will be used to link with tract demographic data later
				NAME: d.properties['NAME.y']
			};
			return {
				...d,
				properties
			};
		});

		// write output file
		const dst = `${geoOutputDir}/${jurisdictionID}_tracts.geojson`;
		fs.writeFileSync(dst, JSON.stringify(data));
	});
};

const prepStationFiles = async () => {
	console.log('...processing Station Files...');
	const inputDir = '../data/raw/stations';

	// --- STATION DATA VARIABLES
	// load csv of station variables, assign unique ID to each station
	let stationData = await csv().fromFile(`${inputDir}/stations_table_for_tool.csv`);
	stationData = stationData.map((d, i) => ({
		STATION_ID: `S${stringHash(d.station_link)}`, // if this method changes, need to update prepData.js to match
		...d
	}));

	// --- STATION GEO FILES
	fs.readdirSync(inputDir).forEach((file) => {
		if (file.split('.').pop() !== 'geojson') {
			return;
		}
		const raw = fs.readFileSync(`${inputDir}/${file}`);
		let data = JSON.parse(raw);

		// get the GISJOIN ID for this jurisdiction
		console.log(file);
		const jurisdictionID = data.features[0].properties.GISJOIN;

		// walk through every station for this jurisdiction
		data.features = data.features.map((d) => {
			// find the station id for this station based on the "station_link" field, match with stationData above
			const stationLink = d.properties.station_link;
			const match = stationData.find((d) => d.station_link === stationLink);
			const STATION_ID = match.STATION_ID;

			let properties = {
				JURISDICTION_ID: d.properties['GISJOIN'],
				STATION_ID: STATION_ID, // this ID will be used to link with STATION data later
				NAME: d.properties['NAME.y']
			};
			return {
				...d,
				properties
			};
		});

		// write output file
		const dst = `${geoOutputDir}/${jurisdictionID}_stations.geojson`;
		fs.writeFileSync(dst, JSON.stringify(data));
	});
};

const prepTransitLineFiles = () => {
	console.log('...processing Transit Line Files...');
	const inputDir = '../data/raw/transitLines';

	// -- SPLITTING THE TRANSIT LINES BY JURISDICTION (OUTDATED)
	// // --- TRANIT LINE GEO FILES
	// fs.readdirSync(inputDir).forEach((file) => {
	// 	if (file.split('.').pop() !== 'geojson') return;
	// 	if (file.split('.')[0] === 'allTransit') return;

	// 	const raw = fs.readFileSync(`${inputDir}/${file}`);
	// 	let data = JSON.parse(raw);

	// 	// get the GISJOIN ID for this jurisdiction
	// 	const jurisdictionID = data.features[0].properties.GISJOIN;

	// 	// clean up features
	// 	data.features = data.features.map((d) => {
	// 		let properties = {
	// 			JURISDICTION_ID: d.properties['GISJOIN'],
	// 			MODE: d.properties['mode'],
	// 			STATUS: d.properties['status'],
	// 			NAME: d.properties['name']
	// 		};
	// 		return {
	// 			...d,
	// 			properties
	// 		};
	// 	});

	// 	// filter out any transit lines that aren't present in the stations data
	// 	const validModes = [
	// 		'Bus Rapid Transit',
	// 		'Arterial Rapid Transit',
	// 		'Streetcar',
	// 		'Light Rail',
	// 		'Commuter Rail'
	// 	];
	// 	data.features = data.features.filter((d) => validModes.includes(d.properties.MODE));

	// 	// write output file
	// 	const dst = `${geoOutputDir}/${jurisdictionID}_transitLines.geojson`;
	// 	fs.writeFileSync(dst, JSON.stringify(data));
	// });

	// --- PREPPING COMBINED TRANSIT LINES GEO FILE
	const raw = fs.readFileSync(`${inputDir}/allTransit.geojson`);
	let data = JSON.parse(raw);

	// clean up features
	data.features = data.features.map((d) => {
		// group arterial and bus rapid transit modes
		let mode = d.properties['mode'];
		if (mode === 'Arterial Rapid Transit' || mode === 'Bus Rapid Transit') {
			mode = 'Rapid Transit';
		}

		let properties = {
			MODE: mode,
			STATUS: d.properties['status'],
			NAME: d.properties['name']
		};
		return {
			...d,
			properties
		};
	});

	// filter out any transit lines that aren't present in the stations data
	const validModes = ['Rapid Transit', 'Streetcar', 'Light Rail', 'Commuter Rail'];
	data.features = data.features.filter((d) => validModes.includes(d.properties.MODE));

	// write output to src/data as this file will be read locally by the app
	const dst = `${dataOutputDir}/allTransitLines.geojson.json`; // .json so its importable
	fs.writeFileSync(dst, JSON.stringify(data));
};

(async () => {
	// prepJurisdictionFiles();
	// prepJurisdictionCentroids();
	// prepTractFiles();
	// await prepStationFiles();
	prepTransitLineFiles();
})();
