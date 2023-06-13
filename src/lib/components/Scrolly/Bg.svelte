<script>
	import { tweened } from 'svelte/motion';
	import { cubicInOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';

	import PlexifyImg from '$assets/reformIllustrations/Plexify_3200.webp';
	import MissingMiddleImg from '$assets/reformIllustrations/MissingMiddle_3200.webp';
	import MultiplyImg from '$assets/reformIllustrations/Multiply_3200.webp';
	import LegalizeImg from '$assets/reformIllustrations/Legalize_3200.webp';

	import Annotation from './Annotation.svelte';

	export let containerDims = []; // dims for the container holding the fixed bg layer
	export let reformImg = null; //
	export let currentReform = null; //
	export let flyTo = [0.5, 0.5]; // as proportion
	export let scale = 1;
	export let annotations = [];
	export let overlay = null;

	// --- Setup BG Image
	let bgImg;
	$: if (reformImg === 'Plexify') {
		bgImg = PlexifyImg;
	} else if (reformImg === 'Missing Middle') {
		bgImg = MissingMiddleImg;
	} else if (reformImg === 'Multiply') {
		bgImg = MultiplyImg;
	} else if (reformImg === 'Legalize') {
		bgImg = LegalizeImg;
	} else {
		bgImg = LegalizeImg; // Default Img
	}

	// Container dims
	let viewportW = 0;
	// let bgContainerSize = [0, 0];
	let overlaySize = [0, 0];
	$: overlayPos = viewportW > 1300 ? 'side' : 'top';

	// --- Camera position and tweens --------------------------
	let imgDims = [3200, 3200];

	// Tweens
	const flyToTween = tweened(flyTo, {
		delay: 0,
		duration: 1500,
		easing: cubicInOut
	});
	const scaleTween = tweened(scale, {
		delay: 0,
		duration: 1500,
		easing: cubicInOut
	});

	// Functions to update the camera scale and target
	let cameraTarget = [0, 0];
	const setCameraTarget = () => {
		/* if there's an annotation, ignore the input `flyTo` value and set the camera target
		so that the annotation is centered horizontally, and the bottom arrow of the annotation 
		is in the bottom half
		*/
		if (annotations.length > 0) {
			let x = annotations[0].location[0];
			let y = annotations[0].location[1];
			x = overlayPos === 'side' ? x - 0.05 : x; // offset slightly if overlay is on the side
			y = overlayPos === 'top' ? y - 0.05 : y; // drop the annotation lower if overlay on top
			if (viewportW < 400) {
				y = y - 0.02; // nudge down again for mobile size screens
			}

			cameraTarget = [x, y];
		} else {
			cameraTarget = flyTo;
		}
		flyToTween.set(cameraTarget);
	};

	const computeMinScale = () => {
		// return the minimum scale that could be applied without showing image edges
		let minScale = 0.1; // bigger is zooming in, smaller is zooming out. We want to know how far we can zoom out without hitting an edge

		// find the minScale independently in x,y dims, then take the smallest
		cameraTarget.forEach((pt, i) => {
			const targetPx = pt * imgDims[i]; // convert from proportion to px

			// calculate distance from target pt to nearest image edge (e.g for X dim, left and right; for Y dim, top and bot)
			let imgBounds = [0, imgDims[i]]; // image goes from 0 - XXX in this dimension
			let distToImgEdge = Math.min(...imgBounds.map((d) => Math.abs(targetPx - d)));

			// calculte the distance from middle of container to farthest container edge
			// const containerMdPt = bgContainerSize[i] / 2;
			// let containerBounds = [0, bgContainerSize[i]];
			const containerMdPt = containerDims[i] / 2;
			let containerBounds = [0, containerDims[i]];
			if (i === 0) {
				containerBounds[0] = overlayPos === 'side' ? overlaySize[i] : 0; // adjust lower bound based on where the overlay is
			} else if (i === 1) {
				containerBounds[0] = overlayPos === 'top' ? overlaySize[i] : 0;
			}
			let distToContainerEdge = Math.max(
				...containerBounds.map((d) => Math.abs(containerMdPt - d))
			);

			// calculate the scale that would bring the img edge right to the container edge
			let thisScale = distToContainerEdge / distToImgEdge;
			if (thisScale > minScale) {
				minScale = thisScale;
			}
		});

		return minScale;
	};

	const setCameraScale = () => {
		// compute the minimum possible scale (i.e. how far out we can zoom before hitting an edge)
		let minScale = computeMinScale();

		// compare with the scale value that was passed in as prop
		let scaleFactor = imgDims[0] / 1600; // since original scales were based on 1600px image, need to adjust for different images
		let origScale = scale / scaleFactor;
		const newScale = minScale > origScale ? minScale : origScale;

		// update the scale tween
		scaleTween.set(newScale);

		// The annotations need to be scaled inversely to the image
		annotationScale = 1 / newScale;
		// console.log('ideal scale', minScale, 'orig scale', origScale, `going with ${newScale}`);
	};

	$: flyTo, scale, updateCamera();
	const updateCamera = () => {
		setCameraTarget();
		setCameraScale();
	};

	// --- Build the image transform that changes the camera position ------
	let transform = `translate(0px, 0px)`;
	$: {
		/* Construct the transform to zoom and center the bgImg at the target location
		NOTE: you must have transform-origin set to 0,0 on the imgContainer for this to work
		Steps:
			1. Translate so target is at origin (top left corner, [0,0])
			2. Apply scale. Image will be scaled with target still at origin. 
			3. Translate target to center of container (i.e. translate it right half of the container width and down half container height)
		*/
		let targetX = $flyToTween[0] * imgDims[0];
		let targetY = $flyToTween[1] * imgDims[1];

		// zoom transform
		let setOriginToTarget = `translate(-${targetX}px, -${targetY}px)`; // set the origin to the target location
		let scaleTransform = `scale(${$scaleTween})`;

		// center in container
		let center = `translate(${containerDims[0] / 2}px, ${containerDims[1] / 2}px)`;

		// combine transforms. NOTE: Transforms applied from RIGHT to LEFT!
		transform = `${center} ${scaleTransform} ${setOriginToTarget}`;
	}

	// --- Annotations setup ----------------------------------
	let annotationScale = 1;
	$: annotations = annotations.map((d, i) => ({
		// convert coordinates from normalized to pixels
		coordinates: [d.location[0] * imgDims[0], d.location[1] * imgDims[1]],
		...d
	}));

	$: showMask = overlay === null;
</script>

<svelte:window bind:innerWidth={viewportW} />
<div
	class="bg-container"
	style:width={`${containerDims[0]}px`}
	style:height={`${containerDims[1]}px`}
>
	<!-- Background image and annotations -->
	<div class="img-container" style:transform>
		<img src={bgImg} alt="" loading="eager" />

		{#each annotations as annotation (annotation.id)}
			<Annotation
				{currentReform}
				text={annotation.text}
				coordinates={annotation.coordinates}
				scale={annotationScale}
			/>
		{/each}
	</div>

	<!-- Put transluscent white mask over bg image when no overlay-->
	{#if showMask}
		<div transition:fade class="mask" />
	{/if}

	<!-- Overlay containing info about the current reform -->
	{#if overlay}
		<div
			transition:fade
			class="overlay"
			bind:clientHeight={overlaySize[1]}
			bind:clientWidth={overlaySize[0]}
		>
			<div class="overlay-content">
				<h2>{overlay.name}</h2>
				<p>{overlay.overview}</p>
			</div>
		</div>
	{/if}
</div>

<style lang="scss">
	.bg-container {
		overflow: hidden;
		position: relative;
	}

	.img-container {
		position: relative;
		transform-origin: 0px 0px;
		background-color: white;
	}

	img {
		position: absolute;
	}

	.annotation-wrapper {
		position: absolute;
	}

	.mask {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(255, 255, 255, 0.7);
	}

	.overlay {
		position: absolute;
		width: 33%;
		height: 100%;
		padding: 40px 50px;
		display: flex;
		justify-content: center;
		align-items: center;
		color: white;
		background-color: var(--color-blue-dark);
		opacity: 1;
	}

	.overlay-content {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: flex-start;
	}

	@media screen and (max-width: 1300px) {
		.overlay {
			width: 100%;
			height: auto;
			padding: 30px 50px 26px;
		}

		.overlay-content {
			max-width: 768px;
		}
	}

	@media screen and (max-width: 768px) {
		.overlay {
			padding: 30px 50px 16px;
		}
	}

	@media screen and (max-width: 400px) {
		.overlay {
			padding: 24px 16px 16px;
		}
	}
</style>
