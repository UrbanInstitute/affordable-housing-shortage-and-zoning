<script>
	import Scroller from '@sveltejs/svelte-scroller';
	import Background from './Background.svelte';

	let viewportW = 1000;
	let viewportH = 1000;

	let offset, progress;
	let index = 0;
	const steps = [
		{ idx: 0, flyTo: [0.5, 0.6], scale: 0.5 },
		{ idx: 1, flyTo: [0.65, 0.6], scale: 1.3 },
		{ idx: 2, flyTo: [0.65, 0.6], scale: 1.3 },
		{ idx: 3, flyTo: [0.5, 0.5], scale: 1 }
	];
</script>

<Scroller top={0} bottom={1} bind:index bind:offset bind:progress>
	<div slot="background">
		<div class="bg-container">
			<div class="viewport" style:width={`${viewportW}px`} style:height={`${viewportH}px`}>
				<Background
					viewportDims={[viewportW, viewportH]}
					{index}
					flyTo={steps[index].flyTo}
					scale={steps[index].scale}
				/>
			</div>
		</div>
	</div>

	<div slot="foreground">
		<div class="spacer" />

		<section>
			<div class="text-step">
				Lorem, ipsum dolor sit amet consectetur adipisicing elit. Facere consectetur officiis
				commodi rem excepturi, optio quos saepe dolore architecto.
			</div>
		</section>
		<section>
			<div class="text-step">
				Lorem, ipsum dolor sit amet consectetur adipisicing elit. Facere consectetur officiis
				commodi rem excepturi, optio quos saepe dolore architecto.
			</div>
		</section>
		<section>
			<div class="text-step">
				Lorem, ipsum dolor sit amet consectetur adipisicing elit. Facere consectetur officiis
				commodi rem excepturi, optio quos saepe dolore architecto.
			</div>
		</section>
		<section>
			<div class="text-step">
				Lorem, ipsum dolor sit amet consectetur adipisicing elit. Facere consectetur officiis
				commodi rem excepturi, optio quos saepe dolore architecto.
			</div>
		</section>
		<div class="spacer" />
	</div>
</Scroller>

<style lang="scss">
	.bg-container {
		width: 100vw;
		display: flex;
		justify-content: center;
	}

	.viewport {
		overflow: hidden;
		// border: solid 1px blue;
	}

	section {
		height: 100vh;
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.text-step {
		width: 50%;
		padding: 120px 60px;
		font-size: 24px;
		line-height: 1.3;
		border-radius: 10px;
		border: solid 2px #5695cf;
		background-color: rgb(255, 255, 255, 0.6);
		backdrop-filter: blur(8px);
		color: var(--color-g1);
		box-shadow: 5px 5px 10px rgb(0, 0, 0, 0.3);
	}

	.spacer {
		height: 100vh;
	}
</style>
