import data from '../jsons/projects.json';

const slugify = (s) =>
	s
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');

/**
 * Where a project sits on the factory floor, from its `status` in projects.json:
 *   running      → a production line making product
 *   construction → a line still being built (current projects)
 *   archived     → a pallet in the warehouse (default)
 */
export const ZONES = {
	running: { prefix: 'L', label: 'Running line' },
	construction: { prefix: 'UC', label: 'Under construction' },
	archived: { prefix: 'W', label: 'Warehouse' }
};

const counters = { running: 0, construction: 0, archived: 0 };

/** Every project, with a stable slug, its zone, and a zone code (L-01, UC-01, W-01 …). */
export const projects = data.projects.map((p, i) => {
	const status = ZONES[p.status] ? p.status : 'archived';
	const n = ++counters[status];
	return {
		...p,
		index: i,
		status,
		slug: slugify(p.title),
		code: `${ZONES[status].prefix}-${String(n).padStart(2, '0')}`
	};
});

export const currentProjects = projects.filter((p) => p.status === 'construction');

/** "hackvwin.png" would resolve relative to the page — anchor bare paths at the site root */
export const imageSrc = (path) => (/^(https?:|data:|\/)/.test(path) ? path : `/${path}`);

export function linkName(url) {
	try {
		const host = new URL(url).hostname.replace('www.', '');
		if (host.includes('github.com')) {
			// owner/repo, so several repos on one project stay distinguishable
			const [owner, repo] = new URL(url).pathname.split('/').filter(Boolean);
			return repo ? `GitHub · ${owner}/${repo}` : 'GitHub';
		}
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
