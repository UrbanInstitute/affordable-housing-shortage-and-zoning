<script>
	import Main from '$components/Main.svelte';
	import Meta from '$components/Meta.svelte';
	import { MAPBOX_API_KEY } from '$stores/siteData';

	import siteCopy from '$data/siteCopy.json';

	export let data; // data object loaded from +page.server.js;

	if (data.MAPBOX_API_KEY) {
		MAPBOX_API_KEY.set(data.MAPBOX_API_KEY);
	}
</script>

<Meta title={siteCopy.meta.title} description={siteCopy.meta.description} url={siteCopy.meta.url} />
<section>
	<Main />
</section>

<style>
	h1 {
		width: 100%;
	}
</style>
