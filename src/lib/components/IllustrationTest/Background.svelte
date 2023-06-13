<script>
	import bg from '$assets/bg.jpg';
	import bgOverlay from '$assets/bg_overlay.png';
	import train from '$assets/train.svg';
	import buildingOutline from '$assets/buildingOutline.svg';
	import buildingFill from '$assets/buildingFill.png';

	import { gsap } from 'gsap';
	import { tweened } from 'svelte/motion';

	import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
	import { MotionPathHelper } from 'gsap/MotionPathHelper';
	import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
	import { onMount } from 'svelte';
	export let viewportDims = [0, 0];
	export let flyTo = [0.5, 0.5]; // as proportion
	export let scale = 1;
	export let index = 0;

	const flyToTween = tweened(flyTo, {
		delay: 0,
		duration: 1500,
		easing: easings.cubicInOut
	});

	const scaleTween = tweened(scale, {
		delay: 0,
		duration: 1500,
		easing: easings.cubicInOut
	});

	$: if (flyTo) {
		flyToTween.set(flyTo);
	}
	$: if (scale) {
		scaleTween.set(scale);
	}

	const cityDims = [1728, 1728];

	let transform = `translate(0px, 0px)`;
	$: {
		let x = -($flyToTween[0] * cityDims[0]) + viewportDims[0] / 2; // add half of viewport dim to center in viewport
		let y = -($flyToTween[1] * cityDims[1]) + viewportDims[1] / 2;
		transform = `translate(${x}px, ${y}px) scale(${$scaleTween})`;
	}

	let buildingTL;
	onMount(() => {
		gsap.registerPlugin(MotionPathPlugin, MotionPathHelper, DrawSVGPlugin);

		gsap.to('#train', {
			motionPath: {
				path: 'M-1084.25,-540.243 C-980.347,-519.243 393.978,-131.235 409.99,-114.249 425.978,-99.231 1353.887,154.127 1495.589,188.311 ',
				alignOrigin: [0.5, 0.5],
				autoRotate: false
			},
			duration: 15,
			ease: 'none',
			repeat: -1
		});

		// building
		buildingTL = gsap.timeline();
		buildingTL.from('#Building_Outline-2', {
			drawSVG: '50% 50%',
			duration: 1,
			delay: 0.5
		});
		buildingTL.to(
			'#building-fill',
			{
				opacity: 1,
				duration: 1
			},
			'-=.2'
		);
		buildingTL.pause();

		// MotionPathHelper.create('#train');
	});

	$: if (buildingTL) {
		if (index >= 2) {
			buildingTL.play();
		} else {
			buildingTL.seek(0);
			buildingTL.pause();
		}
	}
</script>

<div class="bg-container" style:transform>
	<img id="bg" src={bg} alt="" />
	<img id="train" src={train} alt="" />
	<img id="bg-overlay" src={bgOverlay} alt="" />

	<!-- <div id="midpt" /> -->
	<img id="building-fill" src={buildingFill} alt="" />
	<div id="building-outline-svg">
		<svg
			id="Building_Outline"
			width="1728px"
			height="1728px"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 864 864"
			><path
				id="Building_Outline-2"
				class="cls-1"
				d="m671.25,532.64l-144.55,100.27-71.02-41v-23.66l21.81-12.63.08-120.62,46.68-27.03,44.95,25.95v30.47l33.19,19.16,41.37-23.88,31.98,10.07-.03,20.63s-11.46,5.25-11.22,13.62c0,0,.5.77,6.76,5.02v23.64Z"
			/></svg
		>
	</div>
</div>

<style>
	.bg-container {
		position: relative;
		/* border: solid 1px red; */
		width: 1728px;
		height: 1728px;
		max-width: 1728px;
		max-height: 1728px;
		overflow: hidden;
	}

	#midpt {
		position: absolute;
		width: 15px;
		height: 15px;
		border-radius: 50%;
		top: 50%;
		left: 50%;
		background-color: red;
	}

	#building-outline-svg {
		position: absolute;
		top: 0;
		left: 0;
	}

	#building-fill {
		position: absolute;
		top: 0;
		left: 0;
		opacity: 0;
	}

	#bg-overlay {
		position: absolute;
		top: 0;
		left: 0;
	}

	#train {
		position: absolute;
		top: 50%;
		left: 50%;
	}

	#bg {
		position: absolute;
		top: 0;
		left: 0;
	}

	.cls-1 {
		fill: none;
		stroke: #002b55;
		stroke-linejoin: round;
		stroke-width: 2.5px;
	}
</style>
