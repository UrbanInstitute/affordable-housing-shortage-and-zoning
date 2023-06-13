import fs from 'fs';
import archieml from 'archieml';
import fetch from 'node-fetch';
import { csvParse } from 'd3-dsv';
import { autoType } from 'd3';

const CWD = process.cwd();

const docs = [
	{
		// id: '1aUdY-2B1StKNpTJkRcn9ahiOjSQnUbP-oDkYXs8OKP0',
		id: '1suCSOPpeFrPooXsNARrkKWKFFB8sW2njnYi3Y-rlDzI',
		filepath: '../src/lib/data/siteCopy.json'
	},
	{
		// id: '1hKKKGBlhopelncH4sze2Dwrh8shhPAwjkJzZU5BFY-8',
		id: '1XUdvIkUhVBWqvMtowDG-9d1AQ1E_kkAye67mGvd-RS0',
		gid: '0',
		filepath: '../src/lib/data/scrollyLocations.json'
	}
];

const fetchGoogle = async ({ id, gid }) => {
	console.log(`fetching...${id}`);

	const base = 'https://docs.google.com';
	const post = gid
		? `spreadsheets/u/1/d/${id}/export?format=csv&id=${id}&gid=${gid}`
		: `document/d/${id}/export?format=txt`;
	const url = `${base}/${post}`;

	try {
		const response = await fetch(url);
		const text = await response.text();

		if (gid) {
			// parse sheet data as JSON
			let data = csvParse(text, autoType);
			return JSON.stringify(data, null, 2);
		}

		const parsed = archieml.load(text);
		const str = JSON.stringify(parsed);
		return str;
	} catch (err) {
		throw new Error(err);
	}
};

(async () => {
	for (let d of docs) {
		try {
			const str = await fetchGoogle(d);
			const file = `${CWD}/${d.filepath}`;
			fs.writeFileSync(file, str);
		} catch (err) {
			console.log(err);
		}
	}
})();
