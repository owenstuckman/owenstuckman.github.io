import { lockIndex } from '$lib/server/posts.js';

export async function load() {
	return { payload: await lockIndex() };
}
