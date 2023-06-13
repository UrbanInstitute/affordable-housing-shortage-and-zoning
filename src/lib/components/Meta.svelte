<script>
	export let title = '';
	export let description = 'Description';
	export let url = '';
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta name="author" content="" />

	<meta property="og:title" content={title} />
	<meta property="og:site_name" content={title} />
	<meta property="og:url" content={url} />
	<meta property="og:description" content={description} />
	<meta property="og:type" content="website" />
	<meta property="og:locale" content="en_US" />

	<meta property="og:image" content="{url}/social.png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="675" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:site" content={title} />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image:src" content="{url}/social.jpg" />

	<meta name="robots" content="max-image-preview:large" />

	<link rel="canonical" href="{url}/" />

	<!-- Google Tag Manager -->
	<script async src="https://www.googletagmanager.com/gtag/js?id=G-N0EZ8ZMM8T"></script>
	<script>
		window.dataLayer = window.dataLayer || [];
		function gtag() {
			dataLayer.push(arguments);
		}
		gtag('js', new Date());
		gtag('config', 'G-N0EZ8ZMM8T');
	</script>

	<!-- End Google Tag Manager -->
</svelte:head>
