import { error } from '@sveltejs/kit';

export const prerender = true;

const postModules = import.meta.glob('$lib/posts/*.md');

export async function load({ params }) {
	const match = postModules[`/src/lib/posts/${params.slug}.md`];
	if (!match) {
		throw error(404, `Post "${params.slug}" not found`);
	}
	const mod = await match() as { default: unknown; metadata?: Record<string, string> };
	return {
		component: mod.default,
		metadata: mod.metadata ?? {}
	};
}

export async function entries() {
	const modules = import.meta.glob('$lib/posts/*.md', { eager: true });
	return Object.keys(modules).map((path) => ({
		slug: path.split('/').pop()!.replace('.md', '')
	}));
}
