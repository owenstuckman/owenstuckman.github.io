/**
 * How each line is built. Stations run in order from the infeed to the
 * palletizer, and each is labeled with the stage of the project it stands for.
 *
 * Station kinds (see buildStation in scene.js):
 *   machine — enclosed box with a window      tank   — storage silos (databases)
 *   press   — stamping head that cycles        arch   — scanner gate over the belt
 *   robot   — arm swinging over the belt       oven   — long tunnel with heat bands
 *   screen  — console with a lit display
 *
 * `built` (construction lines only) is how many stations are up so far.
 */
import { productFor } from './products.js';

const C = {
	blue: '#3b7dd8',
	green: '#2fa36b',
	orange: '#e07b39',
	purple: '#7a4fb3',
	teal: '#1f9a9a',
	red: '#c8463d',
	slate: '#56606e'
};

const RECIPES = {
	wikiarena: {
		product: 'book',
		stations: [
			{ kind: 'press', label: 'Scrape · Selenium', color: C.slate },
			{ kind: 'tank', label: 'Supabase', color: C.green },
			{ kind: 'arch', label: 'Blind vote', color: C.purple },
			{ kind: 'screen', label: 'Glicko-2 rank', color: C.blue },
			{ kind: 'robot', label: 'Blend · Grok', color: C.orange }
		]
	},
	'hokie-cart-check-out': {
		product: 'cart',
		stations: [
			{ kind: 'arch', label: 'Badge scan', color: C.orange },
			{ kind: 'machine', label: 'Cart pick', color: C.red },
			{ kind: 'tank', label: 'Ledger', color: C.slate }
		]
	},
	orbit: {
		product: 'coin',
		stations: [
			{ kind: 'machine', label: 'Task intake', color: C.blue },
			{ kind: 'screen', label: 'QC model', color: C.purple },
			{ kind: 'oven', label: 'Monte Carlo', color: C.orange },
			{ kind: 'press', label: 'Payout', color: C.teal }
		]
	},
	'archimedes-snipe-bot': {
		product: 'frame',
		stations: [
			{ kind: 'arch', label: 'Snipe', color: C.red },
			{ kind: 'screen', label: 'Discord.js', color: C.purple }
		]
	},
	'homelab-v1': {
		product: 'container',
		stations: [
			{ kind: 'oven', label: 'Ubuntu', color: C.orange },
			{ kind: 'tank', label: 'Supabase', color: C.green },
			{ kind: 'robot', label: 'n8n flows', color: C.red }
		]
	},
	'archimedes-website': {
		product: 'page',
		stations: [
			{ kind: 'press', label: 'Svelte build', color: C.orange },
			{ kind: 'machine', label: 'Email.js', color: C.teal },
			{ kind: 'arch', label: 'Vercel deploy', color: C.slate }
		]
	},
	luma: {
		product: 'folder',
		stations: [
			{ kind: 'machine', label: 'Apply', color: C.orange },
			{ kind: 'arch', label: 'Screen', color: C.blue },
			{ kind: 'screen', label: 'Schedule', color: C.green },
			{ kind: 'press', label: 'Offer', color: C.purple }
		]
	},
	'portfolio-website-revamp': {
		product: 'card',
		stations: [
			{ kind: 'press', label: 'mdsvex', color: C.orange },
			{ kind: 'machine', label: 'SvelteKit', color: C.red },
			{ kind: 'arch', label: 'Pages deploy', color: C.slate }
		]
	},
	workbenched: {
		product: 'folder',
		built: 2,
		stations: [
			{ kind: 'tank', label: 'ActivityWatch', color: C.blue },
			{ kind: 'screen', label: 'Infer project', color: C.purple },
			{ kind: 'machine', label: 'Work log', color: C.green },
			{ kind: 'robot', label: 'Focus', color: C.orange }
		]
	},
	'luma-v2': {
		product: 'folder',
		built: 3,
		stations: [
			{ kind: 'machine', label: 'Form builder', color: C.orange },
			{ kind: 'arch', label: 'Triage', color: C.blue },
			{ kind: 'screen', label: 'Schedule-X', color: C.green },
			{ kind: 'robot', label: 'Multi-tenant', color: C.purple },
			{ kind: 'tank', label: 'Supabase', color: C.teal }
		]
	}
};

const KIND_LENGTH = { machine: 3.6, tank: 3.2, press: 3, arch: 2.2, robot: 2.8, oven: 5.2, screen: 3 };
const FALLBACK_KINDS = ['machine', 'press', 'tank', 'screen', 'arch', 'robot'];
const FALLBACK_COLORS = Object.values(C);

/** The line layout for a project. Projects without a recipe get stations from their skills. */
export function recipeFor(project) {
	const r = RECIPES[project.slug] ?? {
		product: productFor(project),
		built: 1,
		stations: (project.skills?.length ? project.skills : ['Build', 'Test', 'Ship']).slice(0, 4).map((skill, i) => ({
			kind: FALLBACK_KINDS[(project.index + i) % FALLBACK_KINDS.length],
			label: skill,
			color: FALLBACK_COLORS[(project.index + i) % FALLBACK_COLORS.length]
		}))
	};
	return {
		product: r.product,
		built: project.status === 'construction' ? (r.built ?? 1) : r.stations.length,
		stations: r.stations.map((s) => ({ ...s, len: KIND_LENGTH[s.kind] ?? 3 }))
	};
}
