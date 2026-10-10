/**
 * What each line makes. A product is a few primitive parts; `size` is its
 * bounding box (x, y, z), used for stacking on pallets and spacing on belts.
 * `wrap` tints the stretch-wrapped pallet loads in the warehouse.
 */
const box = (x, y, z) => ({ shape: 'box', args: [x, y, z] });
const cyl = (r, h, seg = 16) => ({ shape: 'cyl', args: [r, r, h, seg] });

export const PRODUCTS = {
	raw: { size: [0.3, 0.3, 0.3], wrap: '#d9d6ce', parts: [{ ...box(0.3, 0.3, 0.3), color: '#e6e3dc' }] },
	carton: { size: [0.5, 0.4, 0.45], wrap: '#b98549', parts: [{ ...box(0.5, 0.4, 0.45), color: '#b98549' }] },
	book: {
		size: [0.46, 0.14, 0.34],
		wrap: '#7a4fb3',
		parts: [
			{ ...box(0.46, 0.14, 0.34), color: '#7a4fb3' },
			{ ...box(0.42, 0.1, 0.35), color: '#f4f1ea', pos: [0.03, 0, 0] }
		]
	},
	cart: {
		size: [0.6, 0.42, 0.4],
		wrap: '#c0392b',
		parts: [
			{ ...box(0.56, 0.24, 0.38), color: '#c0392b', pos: [0, 0.07, 0] },
			{ ...box(0.06, 0.3, 0.38), color: '#2b2d31', pos: [-0.3, 0.12, 0] },
			{ ...cyl(0.06, 0.4, 10), color: '#2b2d31', pos: [0, -0.15, 0], rot: [Math.PI / 2, 0, 0] }
		]
	},
	coin: {
		size: [0.4, 0.08, 0.4],
		wrap: '#e0b12e',
		parts: [{ ...cyl(0.2, 0.08, 20), color: '#e0b12e' }]
	},
	container: {
		size: [0.72, 0.36, 0.36],
		wrap: '#2f6fb0',
		parts: [
			{ ...box(0.72, 0.36, 0.36), color: '#2f6fb0' },
			{ ...box(0.74, 0.04, 0.38), color: '#1d4f82', pos: [0, 0.1, 0] },
			{ ...box(0.74, 0.04, 0.38), color: '#1d4f82', pos: [0, -0.06, 0] }
		]
	},
	folder: {
		size: [0.46, 0.07, 0.34],
		wrap: '#e8c47a',
		parts: [
			{ ...box(0.46, 0.07, 0.34), color: '#e8c47a' },
			{ ...box(0.14, 0.072, 0.06), color: '#d4a94c', pos: [-0.12, 0, -0.19] }
		]
	},
	card: {
		size: [0.42, 0.04, 0.3],
		wrap: '#f2b705',
		parts: [
			{ ...box(0.42, 0.04, 0.3), color: '#f7f6f2' },
			{ ...box(0.42, 0.045, 0.08), color: '#f2b705', pos: [0, 0, -0.11] }
		]
	},
	page: {
		size: [0.4, 0.03, 0.3],
		wrap: '#ffffff',
		parts: [
			{ ...box(0.4, 0.03, 0.3), color: '#ffffff' },
			{ ...box(0.3, 0.032, 0.03), color: '#3b7dd8', pos: [0, 0, -0.08] }
		]
	},
	chip: {
		size: [0.36, 0.08, 0.36],
		wrap: '#1f6b45',
		parts: [
			{ ...box(0.36, 0.05, 0.36), color: '#1f6b45' },
			{ ...box(0.16, 0.06, 0.16), color: '#2b2d31', pos: [0, 0.02, 0] }
		]
	},
	phone: {
		size: [0.24, 0.05, 0.44],
		wrap: '#2b2d31',
		parts: [
			{ ...box(0.24, 0.04, 0.44), color: '#2b2d31' },
			{ ...box(0.2, 0.042, 0.38), color: '#3ba3e8', pos: [0, 0.002, 0] }
		]
	},
	gear: {
		size: [0.5, 0.12, 0.5],
		wrap: '#8a9099',
		parts: [
			{ ...cyl(0.25, 0.12, 8), color: '#8a9099' },
			{ ...cyl(0.07, 0.13, 10), color: '#2b2d31' }
		]
	},
	trophy: {
		size: [0.3, 0.5, 0.3],
		wrap: '#e0b12e',
		parts: [
			{ ...box(0.3, 0.1, 0.3), color: '#2b2d31', pos: [0, -0.2, 0] },
			{ ...cyl(0.04, 0.16, 8), color: '#e0b12e', pos: [0, -0.07, 0] },
			{ shape: 'cyl', args: [0.15, 0.08, 0.22, 14], color: '#e0b12e', pos: [0, 0.13, 0] }
		]
	},
	disk: {
		size: [0.44, 0.06, 0.44],
		wrap: '#5c6470',
		parts: [
			{ ...cyl(0.22, 0.05, 20), color: '#c9ced6' },
			{ ...cyl(0.06, 0.055, 12), color: '#2b2d31' }
		]
	},
	frame: {
		size: [0.42, 0.06, 0.32],
		wrap: '#2b2d31',
		parts: [
			{ ...box(0.42, 0.05, 0.32), color: '#2b2d31' },
			{ ...box(0.34, 0.055, 0.24), color: '#7fc8a9' }
		]
	}
};

// A few projects get a specific product; everything else is picked by keyword.
const BY_SLUG = {
	steerclear: 'trophy',
	sipsafe: 'chip',
	predictpev: 'coin',
	'fico-score-simulator': 'coin',
	'apple-canada-remittance': 'coin',
	'apple-remittance-automation': 'coin',
	autoshowtracker: 'disk',
	'tapcap-bot': 'gear',
	'a-reasonable-wms': 'carton',
	'inflectors-project': 'folder',
	'harvard-s-cs50': 'book',
	'kids-like-food-2': 'page',
	'website-creation': 'page'
};

export function productFor(project) {
	if (BY_SLUG[project.slug]) return BY_SLUG[project.slug];
	const text = [project.type, ...(project.skills ?? [])].join(' ').toLowerCase();
	const has = (...words) => words.some((w) => text.includes(w));
	if (has('robotics')) return 'gear';
	if (has('esp32', 'arduino', 'iot', 'circuitry')) return 'chip';
	if (has('hackathon')) return 'trophy';
	if (has('flutter', 'swift', 'expo', 'react native', 'unity')) return 'phone';
	if (has('machine learning', 'scikit', 'xgboost')) return 'disk';
	if (has('power automate', 'power apps', 'smartsheet', 'sop', 'dataverse', 'tkinter')) return 'folder';
	if (has('html', 'markdown', 'svelte', 'react')) return 'page';
	return 'carton';
}
