<script>
	import '$styles/app.css';
	import Header from '$components/Header/Header.svelte';
</script>

<div class="app">
	<!-- Header -->
	<header>
		<Header />
	</header>
	<main>
		<slot />
	</main>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		height: 100%;
		position: relative;
	}

	header {
		position: sticky;
		top: 0;
		z-index: 100;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		width: 100%;
		margin: 0 auto;
		box-sizing: border-box;
	}
</style>
