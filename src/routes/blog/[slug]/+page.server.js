import { lockPost, posts } from '$lib/server/posts.js';

export async function load({ params }) {
	return { payload: await lockPost(params.slug) };
}

export function entries() {
	return posts.map(({ slug }) => ({ slug }));
}
