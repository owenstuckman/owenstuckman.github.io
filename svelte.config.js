import adapter from '@sveltejs/adapter-static';
import { mdsvex } from 'mdsvex';
import sveltePreprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: '404.html',
			precompress: false,
			strict: true
		}),
		paths: {
			base: ''
		},
		alias: {
			$lib: './src/lib'
		}
	},
	extensions: ['.svelte', '.svx', '.md'],
	preprocess: [
		sveltePreprocess({
			//postcss: true,
		}),
		mdsvex({
			extensions: ['.svx', '.md']
		})
	]
};

export default config;
