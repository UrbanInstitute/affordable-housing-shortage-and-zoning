import BG from './Bg.svelte';
import FgText from './FgText.svelte';
import FgNull from './FgNull.svelte';

import scrollyLocations from '$data/scrollyLocations.json';

export const getSteps = (scrollContent) => {
	// build a set of scrolly steps based on the site content
	const { introSlides, reforms, conclusionSlides } = scrollContent;
	let scrollySteps = [];

	// --- Build steps for INTRO slides --------------------------
	introSlides.forEach((d, i) => {
		scrollySteps.push({
			bgCmp: BG,
			bgProps: {
				reformImg: 'Plexify',
				currentReform: null,
				flyTo: [0.5, 0.5],
				scale: 0.8,
				annotations: [],
				overlay: null
			},
			fgCmp: FgText,
			fgProps: {
				textBlocks: d.slideText,
				showJumpLink: i === 2 // include the "jump to map" button on the last intro slide
			}
		});
	});

	// --- Build steps for REFORMS slides -----------------------------
	// unique steps for each annotation within each reform
	reforms.forEach((reform) => {
		const { name, overview, steps } = reform;

		// --- first step just introduces new image without any annotations
		// get the scrolly locations for the first step
		let initLocations = scrollyLocations.filter((d) => d.Reform === name).find((d) => d.Step === 0);
		let { centerAtX, centerAtY, scale } = initLocations;

		scrollySteps.push({
			bgCmp: BG,
			bgProps: {
				reformImg: name,
				currentReform: name,
				flyTo: [centerAtX, centerAtY],
				scale: scale,
				annotations: [],
				overlay: {
					name,
					overview
				}
			},
			fgCmp: FgNull,
			fgProps: {}
		});

		// --- next, add each substep for this reform
		// get the scrolly locations for this reform type
		steps.forEach((step, i) => {
			// get the locations for this step
			const stepNum = i + 1;
			let stepLocations = scrollyLocations
				.filter((d) => d.Reform === name)
				.find((d) => d.Step === stepNum);
			let { centerAtX, centerAtY, scale, textX, textY } = stepLocations;
			scrollySteps.push({
				bgCmp: BG,
				bgProps: {
					reformImg: name,
					currentReform: name,
					flyTo: [centerAtX, centerAtY],
					scale: scale,
					annotations: [
						{
							id: `${name}-annotation${i + 1}`,
							text: step.text,
							location: [textX, textY]
						}
					],
					overlay: {
						name,
						overview
					}
				},
				fgCmp: FgNull,
				fgProps: {}
			});
		});
	});

	// --- Build steps for CONCLUSION slides --------------------------
	conclusionSlides.forEach((d, i) => {
		scrollySteps.push({
			bgCmp: BG,
			bgProps: {
				reformImg: 'Legalize',
				currentReform: null,
				flyTo: [0.5, 0.5],
				scale: 0.8,
				annotations: [],
				overlay: null
			},
			fgCmp: FgText,
			fgProps: {
				textBlocks: d.slideText
			}
		});
	});

	return scrollySteps;
};
