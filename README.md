# Urban Institute - Puget Sound Housing project

## Project details

This repo powers the Urban Institute feature “America Has a Housing Shortage. Zoning Changes Near Transit Could Help.” The project explores four types of zoning in the Puget Sound region showing how different types of zoning changes can increase the amount of potential housing units built in cities nationwide, with particular emphasis on housing near public transportation. This analysis uses data from the Puget Sound region to interactively display these potential changes while the narrative takes a national focus.

Developer: Jeff MacInnes  
Urban dataviz liaison: Mitchell Thorson  
Writer: Wes Jenkins  
Lead researcher: Yonah Freemark  

The published URL is https://apps.urban.org/features/affordable-housing-shortage-and-zoning/

## Data

Original source data is in `data/raw/`.

Original data is prepped/processed using scripts in `scripts/` dir.

The processed geojson files get stored in `static/data/geo`. The live site fetches these files as needed from the static directory.

The processed csv files get stored in `src/lib/data` where they can be ingested by the site.

All data used locally by the site is found in `src/lib/data`

## Developing

The site is built using SvelteKit. See `src/` directory for project files.

To install dependencies:

```bash
npm i
```

To run the development server

```bash
npm run dev
```

### Site Copy and Colors

_Credit to the terrific https://github.com/the-pudding/svelte-starter for this approach_

#### Site Copy

Most of the copy lives in a google doc. Edits to this document need to be manually pulled in to the site and redeployed before they are live. To do so:

```bash
npm run gdoc
```

or, from the `scripts/` dir:

```bash
node fetch-google.js
```

This script will pull down the google doc (which is written using http://archieml.org/ syntax) defined by the `id` specified in `scripts/fetch-google.js`, and convert it to json and save as `src/lib/data/siteCopy.json`. The site parses the contents of this json file to populate the site text.

#### Colors

Site colors are defined in `properties/colors.json`, and then a script converts these values to both css and json. In this way, a single source of truth can be used to define colors that can be used in both the css styles and javascript.

To update colors, edit `properties/colors.json` and then run:

```bash
npm run style
```

or, from the `scripts/` dir:

```bash
node style-dictionary.js
```

This script will produce 2 files:

- `src/lib/data/variables.json` (for importing into javascript files)
- `src/styles/variables.css` (automatically imported by `app.css`. Defines css variables that are usable by any style tag)

### Env Variables

This project uses a private token for services like Mapbox. All private tokens are stored in a local `.env` file in the root of the repository (see `.env.example` for how to structure it). **However, the `.env` file is NOT stored in the repository**.

- When working locall: Make your own `.env` file, with the same variable as `.env.example`. Do not track this file in git.
