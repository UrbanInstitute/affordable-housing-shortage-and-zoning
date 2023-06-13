import StyleDictionary from 'style-dictionary';
const CWD = process.cwd();

StyleDictionary.extend({
	source: [`${CWD}/properties/**/*.json`],
	platforms: {
		css: {
			transformGroup: 'css',
			buildPath: `${CWD}/src/lib/styles/`,
			files: [
				{
					format: 'css/variables',
					destination: 'variables.css'
				}
			]
		},
		json: {
			buildPath: `${CWD}/src/lib/data/`,
			files: [
				{
					format: 'json/nested',
					destination: 'variables.json'
				}
			]
		}
	}
}).buildAllPlatforms();
