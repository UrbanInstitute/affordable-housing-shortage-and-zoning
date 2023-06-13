<script>
	// add a anchor tag with given offset. This can be used for linking to certain parts of a page
	export let id;
	export let offset = 0;
</script>

<div class="link-anchor" {id} style:top={`-${offset}px`} />

<style>
	.link-anchor {
		position: relative;
	}
</style>
