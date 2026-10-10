import data from '../jsons/projects.json';
import currentData from '../jsons/current_projects.json';

const slugify = (s) =>
	s
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');

// Line / bin code, e.g. A-01 … A-12, B-01 …
const code = (i) =>
	`${String.fromCharCode(65 + Math.floor(i / 12))}-${String((i % 12) + 1).padStart(2, '0')}`;

/** Every project, with a stable slug and line code. */
export const projects = data.projects.map((p, i) => ({
	...p,
	index: i,
	slug: slugify(p.title),
	code: code(i)
}));

export const currentProjects = currentData.current_projects;

/** "hackvwin.png" would resolve relative to the page — anchor bare paths at the site root */
export const imageSrc = (path) => (/^(https?:|data:|\/)/.test(path) ? path : `/${path}`);

export function linkName(url) {
	try {
		const host = new URL(url).hostname.replace('www.', '');
		if (host.includes('github.com')) return 'GitHub';
		if (host.includes('devpost.com')) return 'Devpost';
		if (host.includes('youtube.com') || host.includes('youtu.be')) return 'YouTube';
		if (host.includes('linkedin.com')) return 'LinkedIn';
		if (host.includes('figma.com')) return 'Figma';
		if (host.includes('apple.com')) return 'App Store';
		const name = host.split('.')[0];
		return name.charAt(0).toUpperCase() + name.slice(1);
	} catch {
		return 'Link';
	}
}
