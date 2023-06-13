<script>
	export let handleClick = () => console.log('button clicked...');
	export let style = 'default'; // or 'blue'
</script>

<button on:click={() => handleClick()}>
	<div class={`button-content-container ${style}`}>
		<slot>Default Button</slot>
	</div>
</button>

<style lang="scss">
	.button-content-container {
		padding: 12px 16px;
		font-size: var(--text-lg);
		font-weight: var(--font-bold);
		line-height: var(--leading-none);
		text-transform: uppercase;
		text-decoration: none;
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 8px;

		&.default {
			color: var(--color-black);
			background: var(--color-white);
			border: solid 2px var(--color-black);
		}

		&.blue {
			color: var(--color-white);
			background: var(--color-blue);
			border: none;
		}
	}
</style>
