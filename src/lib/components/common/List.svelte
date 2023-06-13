<script>
	export let items = []; // array of list items
	export let labelKey = ''; // property name of the label in each item
	export let valueKey = ''; // property name of the value in each item
</script>

<div class="list-container body-content">
	<ul>
		{#each items as item}
			<li>
				<span class="label">{item[labelKey]}</span>
				{@html item[valueKey]}
			</li>
		{/each}
	</ul>
</div>

<style lang="scss">
	ul {
		list-style-type: none;
		padding: 0;
	}

	.label {
		text-transform: uppercase;
		padding-right: 0.5rem;
	}

	li {
		margin: 2rem 0;
	}
</style>
