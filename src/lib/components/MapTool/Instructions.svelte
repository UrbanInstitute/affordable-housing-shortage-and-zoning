<script>
	import { onMount } from 'svelte';

	import KeyImg from '$assets/map_key.png';
	import closeIcon from '$assets/icon_close.svg';
	import rightArrow from '$assets/right-arrow.png';

	export let content;

	const { keyTitle, keyText } = content;

	onMount(() => {
		// insert the arrow png into the html read in from the site copy gdoc
		let node = document.querySelector('span.right-arrow');
		node.innerHTML = `<img src=${rightArrow} />`;
	});
</script>

<div class="instructions-container">
	<div class="close-button">
		<img src={closeIcon} style:width={'24px'} alt="" />
	</div>

	<div class="title">{keyTitle}</div>
	<div class="hover-instructions">
		Hover over a station to see three measures of housing density:
	</div>
	<div class="image-container">
		<img
			class="map-key-img"
			src={KeyImg}
			alt="A vertical column divided into 3 sections representing total housing availability at a given transit station. The bottom section shows the units currently available, the middle section shows the units available under current zoning, and the topmost section shows the units available with reformed zoning"
		/>
	</div>
	<div class="text">
		{@html keyText}
	</div>
</div>

<style lang="scss">
	.instructions-container {
		position: relative;
		width: 70%;
		max-width: 840px;
		background-color: white;
		padding: 60px 50px;
		font-size: var(--text-lg);
		line-height: var(--leading-normal);
		border: solid 1px var(--color-gray-dark);
	}

	.close-button {
		position: absolute;
		top: 25px;
		right: 25px;
		display: flex;
		justify-content: flex-end;

		img {
			cursor: pointer;
		}
	}

	.title {
		font-size: var(--text-2xl);
		font-weight: var(--font-bold);
	}

	.hover-instructions {
		font-style: italic;
		font-weight: var(--font-bold);
		margin-top: 24px;
		margin-bottom: 24px;
	}

	.image-container {
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.text {
		margin-top: 48px;
	}

	:global(span.dark-yellow-key) {
		display: inline-block;
		width: 14px;
		height: 14px;
		background-color: var(--color-yellow-dark);
		margin: 0px 4px;
		transform: translateY(1px);
	}

	@media screen and (max-width: 768px) {
		.instructions-container {
			width: 95%;
			font-size: var(--text-base);
		}

		.title {
			font-size: var(--text-xl);
			line-height: var(--leading-normal);
		}
	}

	@media screen and (max-width: 500px) {
		.map-key-img {
			width: 100%;
		}
	} ;
</style>
