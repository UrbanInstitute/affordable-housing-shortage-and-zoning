<script>
	import UrbanLogo from '$assets/urban-logo-badge-color.svg';
</script>

<div class="header-container">
	<a href="https://www.urban.org"><img src={UrbanLogo} alt="" /></a>
	<a href="https://www.urban.org/features">Stories and data tools</a>
</div>

<style lang="scss">
	.header-container {
		width: 100%;
		padding: 10px 24px;
		display: flex;
		justify-content: flex-start;
		align-items: center;
		gap: 36px;
		background-color: var(--color-white);
		border-bottom: solid 1px var(--color-gray);
		z-index: 100;
	}

	img {
		width: 32px;
	}

	a {
		font-size: var(--text-2xl);
		font-weight: var(--font-light);
		color: var(--color-gray-darker);
	}
</style>
