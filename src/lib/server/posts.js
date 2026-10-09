import { render } from 'svelte/server';
import { building } from '$app/environment';
import { error } from '@sveltejs/kit';
import { encrypt } from '$lib/vault.js';

const modules = import.meta.glob('/src/lib/posts/*.md', { eager: true });

export const posts = Object.entries(modules)
	.map(([path, mod]) => {
		const { title, date } = mod.metadata ?? {};
		const slug = path.split('/').pop().replace(/\.md$/, '');
		return { slug, title: title ?? slug, date: date ?? '', component: mod.default };
	})
	.sort((a, b) => (a.date < b.date ? 1 : -1));

function password() {
	const pw = process.env.BLOG_PASSWORD;
	if (pw) return pw;
	if (building) {
		throw new Error(
			'BLOG_PASSWORD is not set. Set it in the environment (a GitHub Actions secret in CI) to build the blog.'
		);
	}
	console.warn('[blog] BLOG_PASSWORD not set — using "dev" for local development');
	return 'dev';
}

export function lockIndex() {
	return encrypt(
		posts.map(({ slug, title, date }) => ({ slug, title, date })),
		password()
	);
}

export function lockPost(slug) {
	const post = posts.find((p) => p.slug === slug);
	if (!post) error(404, 'Post not found');
	const { body } = render(post.component);
	return encrypt({ title: post.title, date: post.date, html: body }, password());
}
