import { sveltekit } from "@sveltejs/kit/vite";

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit()],
	build: {
		// three.js is one ~500 kB chunk, lazy-loaded by the factory scene
		chunkSizeWarningLimit: 600,
	},
	server: {
		fs: {
			allow: ["."],
		},
	},
};

export default config;
