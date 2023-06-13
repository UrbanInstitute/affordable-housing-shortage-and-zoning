<script>
	import Heading from '$components/common/Heading.svelte';
	import TextBlocks from '$components/common/TextBlocks.svelte';
	import Button from '$components/common/Button.svelte';
	import IconDownload from '$assets/icon_download.svg';

	export let content = [];

	const goToDataCatalog = () => {
		window.open(
			'https://datacatalog.urban.org/dataset/puget-sound-transit-and-housing-data',
			'_blank'
		);
	};
</script>

<Heading text="About" />
<TextBlocks blocks={content} />
<div class="body-content">
	<Button handleClick={goToDataCatalog}
		>Download Data <img src={IconDownload} alt="" style:width={'16px'} /></Button
	>
</div>

<style lang="scss">
	.body-content {
		margin: 3rem auto;
	}
</style>
