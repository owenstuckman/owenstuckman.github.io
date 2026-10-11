/**
 * How each project is laid out on the floor. A project's stations are its
 * `phases` from projects.json (name + detail), in order. A recipe only picks
 * the machine for each phase, the output product, and (for construction
 * lines) how many phases are built so far.
 *
 * Machine kinds (see buildStation in scene.js):
 *   machine — enclosed box with a window      tank   — storage silos
 *   press   — stamping head that cycles        arch   — scanner gate over the belt
 *   robot   — arm swinging over the belt       oven   — long tunnel with heat bands
 *   screen  — console with a lit display
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

// [kind, color] per phase
const RECIPES = {
	wikiarena: {
		product: 'book',
		machines: [['press', C.slate], ['tank', C.green], ['arch', C.purple], ['screen', C.blue], ['robot', C.orange]]
	},
	'hokie-cart-check-out': {
		product: 'cart',
		machines: [['arch', C.orange], ['machine', C.red], ['tank', C.slate]]
	},
	orbit: {
		product: 'coin',
		machines: [['machine', C.blue], ['screen', C.purple], ['oven', C.orange], ['press', C.teal]]
	},
	'archimedes-snipe-bot': {
		product: 'frame',
		machines: [['arch', C.red], ['screen', C.purple]]
	},
	'homelab-v1': {
		product: 'container',
		machines: [['oven', C.orange], ['tank', C.green], ['robot', C.red]]
	},
	'archimedes-website': {
		product: 'page',
		machines: [['press', C.orange], ['machine', C.teal], ['arch', C.slate]]
	},
	luma: {
		product: 'folder',
		machines: [['machine', C.orange], ['arch', C.blue], ['screen', C.green], ['press', C.purple]]
	},
	'portfolio-website-revamp': {
		product: 'card',
		machines: [['press', C.orange], ['machine', C.red], ['arch', C.slate]]
	},
	workbenched: {
		product: 'folder',
		built: 2,
		machines: [['tank', C.blue], ['screen', C.purple], ['machine', C.green], ['robot', C.orange]]
	},
	'luma-v2': {
		product: 'folder',
		built: 3,
		machines: [['machine', C.orange], ['arch', C.blue], ['screen', C.green], ['robot', C.purple], ['tank', C.teal]]
	}
};

const KIND_LENGTH = { machine: 3.6, tank: 3.2, press: 3, arch: 2.2, robot: 2.8, oven: 5.2, screen: 3 };
const FALLBACK_KINDS = ['machine', 'press', 'tank', 'screen', 'arch', 'robot'];
const FALLBACK_COLORS = Object.values(C);

// A project's phases; projects without any get two generic ones
function phasesOf(project) {
	if (project.phases?.length) return project.phases;
	return [
		{ name: 'Build', detail: project.shortDescription ?? '' },
		{ name: 'Ship', detail: project.date ? `Wrapped up ${project.date}.` : '' }
	];
}

/** The floor layout for a project: one station (or pallet) per phase. */
export function recipeFor(project) {
	const r = RECIPES[project.slug] ?? {};
	const phases = phasesOf(project);
	const built = project.status === 'construction' ? (r.built ?? 1) : phases.length;
	return {
		product: r.product ?? productFor(project),
		stations: phases.map((phase, i) => {
			const [kind, color] = r.machines?.[i] ?? [
				FALLBACK_KINDS[(project.index + i) % FALLBACK_KINDS.length],
				FALLBACK_COLORS[(project.index + i) % FALLBACK_COLORS.length]
			];
			return { kind, color, label: phase.name, detail: phase.detail, len: KIND_LENGTH[kind] ?? 3, built: i < built };
		})
	};
}

export const KIND_NAMES = {
	machine: 'Enclosed machine',
	tank: 'Storage silos',
	press: 'Press',
	arch: 'Scanner gate',
	robot: 'Robot arm',
	oven: 'Tunnel oven',
	screen: 'Control console'
};
