<script>
	import twitterIcon from '$assets/icon_twitter.svg';
	import facebookIcon from '$assets/icon_facebook.svg';
	import linkedinIcon from '$assets/icon_linkedin.svg';
	import mailIcon from '$assets/icon_mail.svg';

	import bgImg from '$assets/hero.jpg';

	export let text = {
		eyebrow: '',
		title: '',
		subtitle: ''
	};

	const socials = [
		{ name: 'twitter', icon: twitterIcon, url: 'https://twitter.com/urbaninstitute' },
		{ name: 'facebook', icon: facebookIcon, url: 'https://www.facebook.com/urbaninstitute/' },
		{
			name: 'linkedin',
			icon: linkedinIcon,
			url: 'https://www.linkedin.com/company/urban-institute/'
		},
		{
			name: 'contact urban institute',
			icon: mailIcon,
			url: 'https://www.urban.org/about/contact-us'
		}
	];

	let scrollY = 0;
</script>

<svelte:window bind:scrollY />
<div class="hero-container">
	<div class="bg-img-container">
		<img src={bgImg} alt="" />
		<div class="mask" />
	</div>

	<div class="eyebrow">{text.eyebrow}</div>
	<h1 class="title">{@html text.title}</h1>
	<p class="subtitle"><i>{text.subtitle}</i></p>
	<div class="date">June 2023</div>

	<div class="social-container">
		{#each socials as social}
			<a href={social.url} target="_blank" rel="noreferrer"
				><img class="social-icon" src={social.icon} alt={`${social.name} link`} /></a
			>
		{/each}
	</div>
</div>

<style lang="scss">
	.hero-container {
		position: relative;
		width: 100%;
		// aspect-ratio: 3 / 1;
		height: 100%;
		min-height: 450px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 24px;
		color: white;
		overflow: hidden;
	}

	.bg-img-container {
		z-index: -1;
		position: absolute;
		top: 0;
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;

		img {
			position: absolute;
			// top: -50%;
			width: 100%;
			height: 100%;
			object-fit: cover;
		}

		.mask {
			position: absolute;
			top: 0;
			width: 100%;
			height: 100%;
			background: rgba(0, 0, 0, 0.4);
		}
	}

	.title {
		text-align: center;
		max-width: 1000px;
	}

	.subtitle {
		text-align: center;
		margin: 0px;
	}

	.social-container {
		display: flex;
		justify-content: center;
		gap: 24px;
	}
	.social-icon {
		height: 24px;
		width: 24px;
	}

	@media screen and (max-width: 768px) {
		// .hero-container {
		// 	min-height: 560px;
		// }
	}
</style>
