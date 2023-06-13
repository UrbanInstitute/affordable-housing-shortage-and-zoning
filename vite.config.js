import { sveltekit } from '@sveltejs/kit/vite';
import dsv from '@rollup/plugin-dsv';

const isDev = process.env.NODE_ENV === 'development';
const noExternalArr = isDev ? ['gsap'] : ['gsap', 'threebox-plugin'];

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit(), dsv()],
	ssr: {
		noExternal: noExternalArr
	}
};

export default config;
