/**
 * The factory floor.
 *
 *   back wall (about boards)
 *   ── production hall: one line per running project, plus construction sites
 *      for current projects. Each line is built from its project's recipe:
 *      infeed → its own stations → palletizer, making its own product.
 *   ── warehouse: rack bays down both sides of the aisle. Archived projects are
 *      wrapped pallets on the upper levels; AGVs drop finished pallets from the
 *      running lines into the ground-level bays.
 */
import * as THREE from 'three';
import { MapControls } from 'three/examples/jsm/controls/MapControls.js';
import {
	drawAboutBoard,
	drawToolingBoard,
	drawLineSign,
	drawStationLabel,
	drawSlotLabel,
	drawZoneBanner,
	drawOrgLabel,
	drawRoleBar,
	drawYearTick,
	drawRailTitle,
	loadFonts
} from './signage.js';
import { PRODUCTS } from './products.js';
import { recipeFor } from './recipes.js';

// ---- Layout (world units ≈ meters) ----
const PICK_X = 8.2; // |x| of each line's pallet pickup spot
const AISLE = 5; // aisle half-width
const ROW = 9; // z spacing between rows of lines
const WALL_Z = -20;
const GAP = 1.4; // belt between stations
const BELT_Y = 0.96;
const BELT_SPEED = 0.8;
const PALLET_Y = 0.43; // pallet center on its stand
const PALLET_TOP = PALLET_Y + 0.075;

// Warehouse racks
const BAY = 2.3;
const RACK_FACE = 6.2; // |x| of the rack face on the aisle
const SLOT_X = 7.0; // |x| of a pallet in a bay
const LEVELS = [0, 2.1, 4.0, 5.9]; // beam heights; level 0 is the AGV drop level
const RACK_H = 7.7;

// Back wall
// Work-history timeline: a Gantt chart, one row per organization, one bar per role
const TL_X0 = -19; // where time starts (org labels sit to the left)
const TL_X1 = 27;
const ORG_W = 8.4;
const ROW_H = 1.25;
const BAR_H = 1.0;
const MIN_BAR_W = 1.1;

const AGV_COUNT = 6;
const AGV_SPEED = 9;

const COLORS = {
	steel: '#8a9099',
	dark: '#2b2d31',
	cap: '#3a3d42',
	tape: '#f2b705',
	glass: '#1f2a36',
	wood: '#c8a165',
	rack: '#e07b39',
	ghost: '#3b7dd8',
	cone: '#f26b1d'
};

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function toonGradient() {
	const data = new Uint8Array([90, 170, 255]);
	const tex = new THREE.DataTexture(data, 3, 1, THREE.RedFormat);
	tex.minFilter = tex.magFilter = THREE.NearestFilter;
	tex.needsUpdate = true;
	return tex;
}

export async function createFactory(container, { projects, about, experience = [], draft = false, onSelect, onSelectExperience, onHover, onMove }) {
	const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

	// ---- Renderer / scene / camera / controls ----
	const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
	renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
	renderer.outputColorSpace = THREE.SRGBColorSpace;
	container.appendChild(renderer.domElement);

	const scene = new THREE.Scene();
	scene.fog = new THREE.Fog('#ecebe6', 110, 260);
	const camera = new THREE.PerspectiveCamera(50, 1, 0.5, 400);

	// Drag pans across the floor; right-drag (or two fingers) rotates; wheel/pinch zooms
	const controls = new MapControls(camera, renderer.domElement);
	controls.enableDamping = true;
	controls.dampingFactor = 0.08;
	controls.maxPolarAngle = Math.PI * 0.47;
	controls.minDistance = 5;
	controls.maxDistance = 150;

	scene.add(new THREE.HemisphereLight('#ffffff', '#8d8a80', 1.6));
	const sun = new THREE.DirectionalLight('#ffffff', 1.4);
	sun.position.set(30, 60, 40);
	scene.add(sun);

	const gradientMap = toonGradient();
	const materials = new Map();
	const mat = (color) => {
		if (!materials.has(color)) materials.set(color, new THREE.MeshToonMaterial({ color, gradientMap }));
		return materials.get(color);
	};
	const ghostMat = new THREE.MeshBasicMaterial({
		color: COLORS.ghost,
		transparent: true,
		opacity: 0.16,
		depthWrite: false
	});
	const ghostEdgeMat = new THREE.LineBasicMaterial({ color: COLORS.ghost, transparent: true, opacity: 0.8 });

	const geoCache = new Map();
	const boxGeo = (x, y, z) => {
		const key = `b${x},${y},${z}`;
		if (!geoCache.has(key)) geoCache.set(key, new THREE.BoxGeometry(x, y, z));
		return geoCache.get(key);
	};
	const cylGeo = (rt, rb, h, seg = 16) => {
		const key = `c${rt},${rb},${h},${seg}`;
		if (!geoCache.has(key)) geoCache.set(key, new THREE.CylinderGeometry(rt, rb, h, seg));
		return geoCache.get(key);
	};
	const at = (x, y, z) => new THREE.Matrix4().makeTranslation(x, y, z);
	const tmp = new THREE.Matrix4();
	const tmp2 = new THREE.Matrix4();
	const v = new THREE.Vector3();
	const q = new THREE.Quaternion();
	const one = new THREE.Vector3(1, 1, 1);
	const yAxis = new THREE.Vector3(0, 1, 0);

	// ---- Sort projects onto the floor ----
	// running lines first, construction sites nearest the warehouse
	const lineProjects = [
		...projects.filter((p) => p.status === 'running'),
		...projects.filter((p) => p.status === 'construction')
	];
	const archived = projects.filter((p) => p.status === 'archived');

	const lines = lineProjects.map((project, j) => {
		const recipe = recipeFor(project);
		const side = j % 2 === 0 ? -1 : 1;
		const z = Math.floor(j / 2) * ROW;
		// Origin at the pallet spot; the line runs outward along local -x
		const matrix = new THREE.Matrix4().makeTranslation(side * PICK_X, 0, z);
		if (side > 0) matrix.multiply(new THREE.Matrix4().makeRotationY(Math.PI));
		let cursor = -4.4 - 1.2;
		const stations = [];
		for (let s = recipe.stations.length - 1; s >= 0; s--) {
			const st = recipe.stations[s];
			stations[s] = { ...st, x: cursor - st.len / 2 };
			cursor -= st.len + GAP;
		}
		const hopperX = cursor - 0.4;
		const start = hopperX - 1;
		return {
			project,
			recipe,
			running: project.status === 'running',
			side,
			z,
			matrix,
			stations,
			hopperX,
			start,
			length: 2 - start,
			count: 0,
			capacity: 0,
			timer: 0,
			placing: false,
			pallet: true,
			claimed: -1
		};
	});
	const rows = Math.ceil(lines.length / 2);
	const lastRowZ = Math.max(0, (rows - 1) * ROW);
	const maxOuter = Math.max(30, ...lines.map((l) => PICK_X + l.length));

	// Each archived project is a run of pallets (one per part of the project) on
	// one rack level. Runs fill level 1 left, level 1 right, level 2 left, …
	const groups = archived.map((project) => ({ project, recipe: recipeFor(project) }));
	const palletCount = groups.reduce((n, g) => n + g.recipe.stations.length, 0);
	function pack(bays) {
		const rows = [];
		for (let level = 1; level < LEVELS.length; level++) for (const side of [-1, 1]) rows.push({ side, level });
		let row = 0;
		let used = 0;
		for (const g of groups) {
			const n = g.recipe.stations.length;
			if (used + n > bays) {
				row++;
				used = 0;
			}
			if (row >= rows.length || n > bays) return false;
			Object.assign(g, { side: rows[row].side, level: rows[row].level, bay: used });
			used += n;
		}
		return true;
	}
	let baysPerSide = Math.max(10, Math.ceil(palletCount / ((LEVELS.length - 1) * 2)));
	while (!pack(baysPerSide)) baysPerSide++;
	const W0 = lastRowZ + 16; // warehouse start
	const W1 = W0 + baysPerSide * BAY;
	const toWorld = (line, x, y = 0, z = 0) => new THREE.Vector3(x, y, z).applyMatrix4(line.matrix);
	const yawOf = (line) => (line.side > 0 ? Math.PI : 0);

	// ---- Back wall layout: timeline rows decide where the rail and boards sit ----
	// Rows are organizations, most recent at the top; each role is a bar on its row.
	const tl = { y0: 0, y1: 1, orgs: [], items: [] };
	if (experience.length) {
		tl.y0 = Math.floor(Math.min(...experience.map((e) => e.startYear)));
		tl.y1 = Math.ceil(Math.max(...experience.map((e) => e.endYear)));
		const latest = new Map();
		for (const e of experience) latest.set(e.org, Math.max(latest.get(e.org) ?? -Infinity, e.endYear + e.startYear / 1e4));
		tl.orgs = [...latest.keys()].sort((a, b) => latest.get(b) - latest.get(a));
		for (const e of experience) {
			const x0 = TL_X0 + ((e.startYear - tl.y0) / (tl.y1 - tl.y0)) * (TL_X1 - TL_X0);
			const x1 = Math.max(TL_X0 + ((e.endYear - tl.y0) / (tl.y1 - tl.y0)) * (TL_X1 - TL_X0), x0 + MIN_BAR_W);
			tl.items.push({ e, x0, x1, row: tl.orgs.indexOf(e.org) });
		}
		// a minimum-width bar mustn't run into the next role on the same row
		const byRow = [...tl.items].sort((a, b) => a.row - b.row || a.x0 - b.x0);
		for (let i = 0; i < byRow.length - 1; i++) {
			const [cur, next] = [byRow[i], byRow[i + 1]];
			if (cur.row === next.row && cur.x1 > next.x0 - 0.06) cur.x1 = Math.max(next.x0 - 0.06, cur.x0 + 0.3);
		}
	}
	const xOf = (year) => TL_X0 + ((year - tl.y0) / (tl.y1 - tl.y0)) * (TL_X1 - TL_X0);
	const RAIL_Y = tl.orgs.length ? 0.6 + tl.orgs.length * ROW_H + 0.35 : 0; // the year axis, above the rows
	const BOARD_Y = Math.max(8, RAIL_Y + 1.4 + 6.5); // about boards sit above the axis
	const WALL_H = Math.max(20, BOARD_Y + 7.5);
	const rowY = (row) => RAIL_Y - 0.35 - ROW_H / 2 - row * ROW_H;

	// ---- Floor, tape, back wall ----
	const floorCanvas = document.createElement('canvas');
	floorCanvas.width = floorCanvas.height = 128;
	const floorTex = new THREE.CanvasTexture(floorCanvas);
	floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
	floorTex.colorSpace = THREE.SRGBColorSpace;
	const floorW = maxOuter * 2 + 16;
	const floorD = W1 - WALL_Z + 24;
	floorTex.repeat.set(floorW / 4, floorD / 4);
	const floor = new THREE.Mesh(new THREE.PlaneGeometry(floorW, floorD), new THREE.MeshLambertMaterial({ map: floorTex }));
	floor.rotation.x = -Math.PI / 2;
	floor.position.set(0, 0, WALL_Z + floorD / 2);
	scene.add(floor);

	const flat = (w, d, material, x, z, y = 0.01) => {
		const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), material);
		m.rotation.x = -Math.PI / 2;
		m.position.set(x, y, z);
		scene.add(m);
		return m;
	};
	const tapeMat = new THREE.MeshBasicMaterial({ color: COLORS.tape });
	for (const x of [-AISLE, AISLE]) flat(0.25, W1 - WALL_Z - 6, tapeMat, x, (WALL_Z + 6 + W1) / 2);

	const hazardCanvas = document.createElement('canvas');
	hazardCanvas.width = 256;
	hazardCanvas.height = 32;
	{
		const g = hazardCanvas.getContext('2d');
		g.fillStyle = COLORS.tape;
		g.fillRect(0, 0, 256, 32);
		g.fillStyle = COLORS.dark;
		for (let i = -32; i < 256; i += 32) {
			g.beginPath();
			g.moveTo(i, 32);
			g.lineTo(i + 16, 32);
			g.lineTo(i + 48, 0);
			g.lineTo(i + 32, 0);
			g.fill();
		}
	}
	const hazardMat = (repeat) => {
		const t = new THREE.CanvasTexture(hazardCanvas);
		t.wrapS = THREE.RepeatWrapping;
		t.colorSpace = THREE.SRGBColorSpace;
		t.repeat.set(Math.max(1, repeat), 1);
		return new THREE.MeshBasicMaterial({ map: t });
	};
	// warehouse threshold across the aisle
	flat(2 * RACK_FACE, 0.6, hazardMat(6), 0, W0 - 2, 0.012);

	const wallMat = new THREE.MeshLambertMaterial({ color: '#d8d5cc' });
	const wall = new THREE.Mesh(new THREE.BoxGeometry(floorW, WALL_H, 0.6), wallMat);
	wall.position.set(0, WALL_H / 2, WALL_Z - 0.3);
	scene.add(wall);

	// ---- Signs ----
	await loadFonts();
	const texFrom = (canvasEl, aniso = 4) => {
		const tex = new THREE.CanvasTexture(canvasEl);
		tex.colorSpace = THREE.SRGBColorSpace;
		tex.anisotropy = aniso;
		return tex;
	};
	/** A flat sign facing +z (rotated by rotY). */
	function sign(canvasEl, w, h, x, y, z, rotY = 0, aniso = 4) {
		const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: texFrom(canvasEl, aniso) }));
		m.position.set(x, y, z);
		m.rotation.y = rotY;
		scene.add(m);
		return m;
	}
	const poleGeo = cylGeo(0.05, 0.05, 1, 6);
	function poles(x1, x2, height, z) {
		for (const x of [x1, x2]) {
			const p = new THREE.Mesh(poleGeo, mat(COLORS.dark));
			p.scale.y = height;
			p.position.set(x, height / 2, z);
			scene.add(p);
		}
	}

	const maxAniso = renderer.capabilities.getMaxAnisotropy();
	const boards = [
		sign(await drawAboutBoard(about), 26, 13, -7, BOARD_Y, WALL_Z + 0.02, 0, maxAniso),
		sign(drawToolingBoard(about, projects.length), 13.6, 12.75, 14, BOARD_Y - 0.1, WALL_Z + 0.02, 0, maxAniso)
	];


	// Zone banner over the aisle, back to back so it reads from both directions
	const banner = drawZoneBanner('Warehouse', `${archived.length} archived projects · ${palletCount} pallets`);
	sign(banner, 10, 1.875, 0, 7, W0 - 2.2);
	sign(banner, 10, 1.875, 0, 7, W0 - 2.26, Math.PI);
	poles(-5.1, 5.1, 7.9, W0 - 2.23);

	// ---- Product parts ----
	const productParts = (type) =>
		PRODUCTS[type].parts.map((part) => {
			const geo = part.shape === 'cyl' ? cylGeo(...part.args) : boxGeo(...part.args);
			const local = new THREE.Matrix4().compose(
				new THREE.Vector3(...(part.pos ?? [0, 0, 0])),
				new THREE.Quaternion().setFromEuler(new THREE.Euler(...(part.rot ?? [0, 0, 0]))),
				one
			);
			return { geo, color: part.color, local };
		});

	// Pallet stacking pattern for a product: as many as fit on 1.3 × 1.3, up to ~1 m tall
	function stackLayout(type) {
		const [sx, sy, sz] = PRODUCTS[type].size;
		const nx = Math.max(1, Math.floor(1.3 / (sx + 0.03)));
		const nz = Math.max(1, Math.floor(1.3 / (sz + 0.03)));
		const ny = Math.max(1, Math.min(Math.floor(0.95 / (sy + 0.005)), Math.floor(40 / (nx * nz))));
		const out = [];
		for (let y = 0; y < ny; y++)
			for (let ix = 0; ix < nx; ix++)
				for (let iz = 0; iz < nz; iz++)
					out.push([(ix - (nx - 1) / 2) * (sx + 0.03), PALLET_TOP + sy / 2 + y * (sy + 0.005), (iz - (nz - 1) / 2) * (sz + 0.03)]);
		return out;
	}

	// ---- Static pieces, batched into one InstancedMesh per (geometry, color) ----
	const instancedPieces = new Map();
	const addPiece = (key, geo, color, matrix) => {
		const k = `${key}|${color}`;
		if (!instancedPieces.has(k)) instancedPieces.set(k, { geo, color, mats: [] });
		instancedPieces.get(k).mats.push(matrix);
	};
	const piece = (line, key, geo, color, local) =>
		addPiece(key, geo, color, new THREE.Matrix4().multiplyMatrices(line.matrix, local));

	// ---- Work history: a Gantt chart on the wall under the boards ----
	const expTargets = [];
	if (tl.items.length) {
		const z = WALL_Z + 0.04;
		const bottom = rowY(tl.orgs.length - 1) - ROW_H / 2;
		addPiece('rail', boxGeo(TL_X1 - TL_X0 + ORG_W + 1, 0.16, 0.16), COLORS.tape, at((TL_X0 - ORG_W + TL_X1) / 2, RAIL_Y, WALL_Z + 0.12));
		sign(drawRailTitle('Work history'), 5.6, 0.7, TL_X0 - ORG_W / 2 - 0.3, RAIL_Y + 0.6, z);
		// year scale with gridlines down through the rows
		for (let y = tl.y0; y <= tl.y1; y++) {
			const h = RAIL_Y - bottom;
			addPiece(`grid-${h.toFixed(2)}`, boxGeo(0.03, h, 0.02), COLORS.steel, at(xOf(y), bottom + h / 2, WALL_Z + 0.02));
			sign(drawYearTick(y), 1.2, 0.6, xOf(y), RAIL_Y + 0.55, z);
		}
		// one row per organization
		tl.orgs.forEach((org, row) => {
			sign(drawOrgLabel(org), ORG_W - 0.3, (ORG_W - 0.3) / 8, TL_X0 - ORG_W / 2 - 0.3, rowY(row), z);
		});
		for (const { e, x0, x1, row } of tl.items) {
			const w = x1 - x0;
			const bar = sign(drawRoleBar(e, (w / BAR_H) * 128, draft), w, BAR_H, x0 + w / 2, rowY(row), WALL_Z + 0.06);
			expTargets[e.index] = { experience: e, mesh: bar, center: bar.position.clone(), size: new THREE.Vector3(w, BAR_H, 0.2) };
		}
	}
	const expMeshes = expTargets.map((t) => t.mesh);

	const animated = []; // { update(time) }
	const flows = []; // running lines' belt items and palletizers
	const hitTargets = []; // { project, center, size, kind: 'line' | 'group', line?, group? }
	const stationTargets = []; // line stations and stored pallets: { project, line? | group?, station, pallet?, center, size }

	function ghostBox(line, w, h, d, x, y, z) {
		const world = new THREE.Matrix4().multiplyMatrices(line.matrix, at(x, y, z));
		const m = new THREE.Mesh(boxGeo(w, h, d), ghostMat);
		const edges = new THREE.LineSegments(new THREE.EdgesGeometry(boxGeo(w, h, d)), ghostEdgeMat);
		for (const o of [m, edges]) {
			o.matrixAutoUpdate = false;
			o.matrix.copy(world);
			scene.add(o);
		}
	}

	function scaffold(line, x, len, h) {
		for (const dx of [-len / 2, len / 2])
			for (const dz of [-1.4, 1.4]) piece(line, `scaffold-post-${h}`, boxGeo(0.1, h + 0.6, 0.1), COLORS.steel, at(x + dx, (h + 0.6) / 2, dz));
		for (const dz of [-1.4, 1.4]) {
			piece(line, `scaffold-rail-${len}`, boxGeo(len, 0.08, 0.08), COLORS.tape, at(x, h + 0.4, dz));
			piece(line, `scaffold-rail-${len}`, boxGeo(len, 0.08, 0.08), COLORS.tape, at(x, h / 2, dz));
		}
	}

	function cone(line, x, z) {
		piece(line, 'cone', cylGeo(0.02, 0.22, 0.6, 10), COLORS.cone, at(x, 0.3, z));
		piece(line, 'cone-band', cylGeo(0.12, 0.15, 0.1, 10), '#ffffff', at(x, 0.32, z));
	}

	/** One station. Returns its height (for the label). */
	function buildStation(line, st) {
		const { x, len, color, kind } = st;
		if (!st.built) {
			const h = kind === 'tank' || kind === 'press' ? 3.2 : 2.4;
			ghostBox(line, len, h, 2.4, x, h / 2, 0);
			scaffold(line, x, len, h);
			return h;
		}
		const p = (key, geo, c, local) => piece(line, key, geo, c, local);
		const phase = Math.random() * 6;
		switch (kind) {
			case 'tank': {
				for (const dx of [-0.8, 0.8]) {
					p('tank', cylGeo(0.7, 0.7, 3, 18), color, at(x + dx, 1.5, -1.05));
					p('tank-lid', cylGeo(0.5, 0.72, 0.3, 18), COLORS.cap, at(x + dx, 3.15, -1.05));
					p('tank-pipe', boxGeo(0.14, 1.6, 0.14), COLORS.steel, at(x + dx, 0.8, -0.3));
				}
				p(`tank-hood-${len}`, boxGeo(len * 0.5, 1.3, 1.2), color, at(x, 1.35, 0));
				return 3.3;
			}
			case 'press': {
				for (const dx of [-len / 2 + 0.2, len / 2 - 0.2]) p('press-post', boxGeo(0.3, 3.4, 0.3), COLORS.dark, at(x + dx, 1.7, 0));
				p(`press-beam-${len}`, boxGeo(len, 0.5, 1.2), color, at(x, 3.35, 0));
				const head = new THREE.Mesh(boxGeo(1.3, 0.55, 1.0), mat(color));
				head.position.copy(toWorld(line, x, 2.6, 0));
				scene.add(head);
				if (line.running)
					animated.push({ update: (t) => (head.position.y = 1.55 + Math.pow((Math.sin(t * 2.4 + phase) + 1) / 2, 3) * 1.3) });
				return 3.6;
			}
			case 'arch': {
				for (const dx of [-0.5, 0.5]) {
					for (const dz of [-0.8, 0.8]) p('arch-post', boxGeo(0.22, 2.3, 0.22), color, at(x + dx, 1.15, dz));
					p('arch-top', boxGeo(0.3, 0.3, 1.9), color, at(x + dx, 2.35, 0));
				}
				p('arch-roof', boxGeo(1.3, 0.12, 1.9), COLORS.cap, at(x, 2.55, 0));
				const light = new THREE.Mesh(boxGeo(1.0, 0.06, 1.2), new THREE.MeshBasicMaterial({ color: '#ff5a4f' }));
				light.position.copy(toWorld(line, x, 2.18, 0));
				scene.add(light);
				if (line.running)
					animated.push({ update: (t) => light.material.color.set((t * 1.5 + phase) % 2 < 1 ? '#ff5a4f' : '#3ddc84') });
				return 2.6;
			}
			case 'robot': {
				p('robot-base', cylGeo(0.35, 0.45, 1.2, 12), COLORS.dark, at(x, 0.6, -1.25));
				const arm = new THREE.Group();
				const upper = new THREE.Mesh(boxGeo(1.7, 0.22, 0.26), mat(color));
				upper.position.x = 0.85;
				const grip = new THREE.Mesh(boxGeo(0.2, 0.5, 0.2), mat(COLORS.dark));
				grip.position.set(1.6, -0.3, 0);
				arm.add(upper, grip);
				arm.position.copy(toWorld(line, x, 1.35, -1.25));
				// local +z → world: the arm reaches toward the belt
				const toward = yawOf(line) - Math.PI / 2;
				arm.rotation.y = toward;
				scene.add(arm);
				if (line.running) animated.push({ update: (t) => (arm.rotation.y = toward + Math.sin(t * 1.3 + phase) * 0.9) });
				return 2.2;
			}
			case 'oven': {
				p(`oven-${len}`, boxGeo(len, 1.7, 1.9), color, at(x, 0.85, 0));
				p(`oven-cap-${len}`, boxGeo(len + 0.05, 0.12, 1.95), COLORS.cap, at(x, 1.74, 0));
				p('oven-stack', cylGeo(0.22, 0.22, 1.4, 10), COLORS.dark, at(x + len / 2 - 0.6, 2.4, -0.4));
				const bands = [-len / 3, 0, len / 3].map((dx) => {
					const band = new THREE.Mesh(boxGeo(0.18, 1.74, 1.96), new THREE.MeshBasicMaterial({ color: '#ff8a3d' }));
					band.position.copy(toWorld(line, x + dx, 0.86, 0));
					scene.add(band);
					return band;
				});
				if (line.running)
					animated.push({ update: (t) => bands.forEach((b, i) => b.material.color.setHSL(0.06, 1, 0.5 + 0.12 * Math.sin(t * 3 + i))) });
				return 2.4;
			}
			case 'screen': {
				p(`console-${len}`, boxGeo(len * 0.7, 1.2, 1.2), color, at(x, 0.6, -1.25));
				p('screen-frame', boxGeo(2, 1.3, 0.12), COLORS.dark, at(x, 1.95, -1.3));
				const screen = new THREE.Mesh(boxGeo(1.8, 1.1, 0.02), new THREE.MeshBasicMaterial({ color: '#7fd3ff' }));
				screen.position.copy(toWorld(line, x, 1.95, -1.23));
				screen.rotation.y = yawOf(line);
				scene.add(screen);
				p('camera-gantry', boxGeo(0.12, 1.8, 0.12), COLORS.steel, at(x, 0.9, 0.6));
				p('camera-head', boxGeo(0.4, 0.25, 0.7), COLORS.dark, at(x, 1.75, 0.3));
				if (line.running)
					animated.push({ update: (t) => screen.material.color.setHSL(0.55, 0.8, 0.62 + 0.08 * Math.sin(t * 2 + phase)) });
				return 2.7;
			}
			default: {
				p(`machine-${len}`, boxGeo(len, 2.4, 2.4), color, at(x, 1.2, 0));
				p(`machine-cap-${len}`, boxGeo(len + 0.04, 0.12, 2.44), COLORS.cap, at(x, 2.44, 0));
				p(`machine-band-${len}`, boxGeo(len + 0.06, 0.14, 2.46), COLORS.tape, at(x, 0.2, 0));
				p('machine-window', boxGeo(1.6, 0.8, 0.04), COLORS.glass, at(x, 1.5, 1.22));
				return 2.6;
			}
		}
	}

	// ---- Build each line ----
	const ARM_PIVOT = [-1.6, 1.75, -1.5];
	const angleTo = (x, z) => Math.atan2(-(z - ARM_PIVOT[2]), x - ARM_PIVOT[0]);
	const ARM_CONVEYOR = angleTo(-2.4, 0);
	const ARM_PALLET = angleTo(0, 0);
	const ARM_OFFSET = at(0.95, 0, 0);

	for (const line of lines) {
		const { recipe, stations } = line;
		const builtStations = stations.filter((s) => s.built);
		const builtEnd = line.running
			? -2.2
			: Math.max(line.hopperX + 1.5, ...builtStations.map((s) => s.x + s.len / 2)) + 0.6;

		// infeed hopper
		piece(line, 'hopper', boxGeo(1.8, 1.4, 1.8), COLORS.steel, at(line.hopperX, 0.7, 0));
		piece(line, 'hopper-top', cylGeo(1.25, 0.8, 0.7, 4), COLORS.cap, at(line.hopperX, 1.75, 0));

		// belt: the built span, then a ghost of the rest
		const beltStart = line.hopperX + 0.9;
		const beltLen = +(builtEnd - beltStart).toFixed(2);
		piece(line, `frame-${beltLen}`, boxGeo(beltLen, 0.86, 0.9), COLORS.steel, at(beltStart + beltLen / 2, 0.43, 0));
		piece(line, `belt-${beltLen}`, boxGeo(beltLen, 0.08, 0.92), COLORS.dark, at(beltStart + beltLen / 2, 0.9, 0));
		if (!line.running) {
			const rest = -2.2 - builtEnd;
			if (rest > 0.2) ghostBox(line, rest, 0.94, 0.9, builtEnd + rest / 2, 0.47, 0);
		}

		const heights = stations.map((st) => buildStation(line, st));
		stations.forEach((st, s) =>
			stationTargets.push({
				project: line.project,
				line,
				station: s,
				kind: 'station',
				center: toWorld(line, st.x, heights[s] / 2, -0.4),
				size: new THREE.Vector3(st.len + 0.2, heights[s] + 0.2, 4)
			})
		);

		// stage labels above each station
		stations.forEach((st, s) => {
			const c = toWorld(line, st.x, 0, 0);
			const label = sign(drawStationLabel(st.label), 3.2, 0.6, c.x, heights[s] + 0.9, c.z - 1.75);
			if (!st.built) {
				label.material.transparent = true;
				label.material.opacity = 0.55;
			}
		});

		if (line.running) {
			// palletizer cell
			for (const [px, pz] of [[-4.4, -2], [-4.4, 2], [1.8, -2], [1.8, 2]])
				piece(line, 'cell-post', boxGeo(0.18, 3.4, 0.18), COLORS.tape, at(px, 1.7, pz));
			for (const pz of [-2, 2]) piece(line, 'cell-beam', boxGeo(6.4, 0.18, 0.18), COLORS.tape, at(-1.3, 3.4, pz));
			piece(line, 'cell-back', boxGeo(0.18, 0.18, 4.2), COLORS.tape, at(-4.4, 3.4, 0));
			piece(line, 'cell-pedestal', cylGeo(0.35, 0.45, 1.6, 12), COLORS.dark, at(-1.6, 0.8, -1.5));
			for (const pz of [-0.68, 0.68]) piece(line, 'stand-rail', boxGeo(1.5, 0.35, 0.12), COLORS.steel, at(0, 0.175, pz));
		} else {
			// construction site: ghost palletizer, cones, hazard tape
			ghostBox(line, 6.2, 3.4, 4, -1.3, 1.7, 0);
			for (const [cx, cz] of [[-3.5, 2.6], [0.5, 2.6], [1.5, -2.2], [line.start + 1, 2.6]]) cone(line, cx, cz);
			const center = toWorld(line, line.start / 2 + 1, 0, 0);
			const tape = hazardMat(Math.round(line.length / 2));
			for (const dz of [-3, 3]) flat(line.length, 0.35, tape, center.x, line.z + dz, 0.013);
		}

		// line banner
		const mid = toWorld(line, line.start / 2, 0, 0);
		const signW = Math.min(10, Math.max(7, line.length * 0.35));
		sign(drawLineSign(line.project.code, line.project.title, !line.running), signW, signW / 8, mid.x, 6.1, line.z - 2.6);
		poles(mid.x - signW / 2 + 0.1, mid.x + signW / 2 - 0.1, 6.1, line.z - 2.62);

		hitTargets.push({
			project: line.project,
			center: toWorld(line, line.start / 2 + 1, 2.75, 0),
			size: new THREE.Vector3(line.length, 5.5, 5.4),
			kind: 'line',
			line
		});

		if (!line.running) continue;

		// ---- belt flow: raw stock until the last station, then the finished product ----
		const finalParts = productParts(recipe.product);
		const rawParts = productParts('raw');
		const [fsx, fsy] = PRODUCTS[recipe.product].size;
		const exits = [line.hopperX + 0.9, ...stations.map((s) => s.x + s.len / 2)];
		const entries = [...stations.map((s) => s.x - s.len / 2), -2.5];
		const segments = exits.map((from, s) => {
			const len = entries[s] - from;
			const last = s === exits.length - 1;
			return { from, len, last, n: Math.max(1, Math.round(len / (last ? Math.max(0.9, fsx + 0.4) : 1))) };
		});
		const rawCount = segments.filter((s) => !s.last).reduce((a, s) => a + s.n, 0);
		const finalCount = segments[segments.length - 1].n;
		const rawMeshes = rawParts.map((pt) => new THREE.InstancedMesh(pt.geo, mat(pt.color), Math.max(1, rawCount)));
		const finalMeshes = finalParts.map((pt) => new THREE.InstancedMesh(pt.geo, mat(pt.color), finalCount));

		const stack = stackLayout(recipe.product);
		const stackMeshes = finalParts.map((pt) => {
			const m = new THREE.InstancedMesh(pt.geo, mat(pt.color), stack.length);
			stack.forEach((pos, k) => m.setMatrixAt(k, tmp.multiplyMatrices(line.matrix, at(...pos)).multiply(pt.local)));
			m.count = 0;
			return m;
		});
		const pallet = new THREE.Mesh(boxGeo(1.4, 0.15, 1.4), mat(COLORS.wood));
		pallet.position.copy(toWorld(line, 0, PALLET_Y, 0));
		const arm = new THREE.Mesh(boxGeo(1.9, 0.22, 0.26), mat(COLORS.dark));
		arm.matrixAutoUpdate = false;
		for (const m of [...rawMeshes, ...finalMeshes]) m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
		// instances move or start empty, so a cached bounding sphere would be wrong
		for (const m of [...rawMeshes, ...finalMeshes, ...stackMeshes]) m.frustumCulled = false;
		scene.add(pallet, arm, ...rawMeshes, ...finalMeshes, ...stackMeshes);

		line.capacity = stack.length;
		line.count = Math.floor(Math.random() * stack.length * 0.8);
		line.interval = Math.max(1.4, 75 / stack.length);
		line.armSwing = Math.min(1.6, line.interval * 0.85);
		line.timer = Math.random() * line.interval;
		line.wrap = PRODUCTS[recipe.product].wrap;
		const offset = Math.random();

		flows.push({
			update(time) {
				let r = 0;
				for (const seg of segments) {
					const parts = seg.last ? finalParts : rawParts;
					const meshes = seg.last ? finalMeshes : rawMeshes;
					const h = seg.last ? fsy / 2 : 0.15;
					for (let n = 0; n < seg.n; n++) {
						const u = ((time * BELT_SPEED) / seg.len + n / seg.n + offset) % 1;
						tmp.multiplyMatrices(line.matrix, tmp2.makeTranslation(seg.from + u * seg.len, BELT_Y + h, 0));
						const idx = seg.last ? n : r++;
						parts.forEach((pt, i) => meshes[i].setMatrixAt(idx, tmp2.multiplyMatrices(tmp, pt.local)));
					}
				}
				for (const m of [...rawMeshes, ...finalMeshes]) m.instanceMatrix.needsUpdate = true;

				const busy = line.placing || (line.pallet && line.count < line.capacity && line.timer < line.armSwing);
				const phase = busy ? Math.min(1, line.timer / line.armSwing) : 0;
				const swing = phase < 0.5 ? ease(phase * 2) : ease((1 - phase) * 2);
				q.setFromAxisAngle(yAxis, ARM_CONVEYOR + (ARM_PALLET - ARM_CONVEYOR) * swing);
				arm.matrix.multiplyMatrices(line.matrix, tmp.compose(v.set(...ARM_PIVOT), q, one).multiply(ARM_OFFSET));

				pallet.visible = line.pallet;
				for (const m of stackMeshes) m.count = line.pallet ? line.count : 0;
			}
		});
	}

	// ---- Warehouse racks ----
	const bayZ = (bay) => W0 + bay * BAY + BAY / 2;
	const levelY = (level) => (level === 0 ? PALLET_Y : LEVELS[level] + 0.16 + 0.075);
	const slot = (side, level, bay, extra) => ({
		side,
		level,
		bay,
		pos: new THREE.Vector3(side * SLOT_X, levelY(level), bayZ(bay)),
		occupied: false,
		age: 0,
		reserved: -1,
		...extra
	});

	// ground level: drop-off bays for the AGVs, some already filled from earlier shifts
	const ground = [];
	for (const side of [-1, 1]) for (let bay = 0; bay < baysPerSide; bay++) ground.push(slot(side, 0, bay));
	const wraps = lines.filter((l) => l.running).map((l) => PRODUCTS[l.recipe.product].wrap);
	ground.forEach((s, i) => {
		if (wraps.length && i % 3 !== 2) Object.assign(s, { occupied: true, color: wraps[i % wraps.length], age: -i });
	});

	// upper levels: archived projects, one pallet per part
	const stored = groups.flatMap((g) =>
		g.recipe.stations.map((st, k) =>
			slot(g.side, g.level, g.bay + k, { group: g, segment: k, occupied: true, product: g.recipe.product })
		)
	);
	const slots = [...ground, ...stored];

	for (const side of [-1, 1]) {
		for (let b = 0; b <= baysPerSide; b++) {
			for (const x of [RACK_FACE, RACK_FACE + 1.6])
				addPiece('rack-upright', boxGeo(0.12, RACK_H, 0.12), COLORS.rack, at(side * x, RACK_H / 2, W0 + b * BAY));
		}
		for (let b = 0; b < baysPerSide; b++) {
			const z = bayZ(b);
			for (const y of LEVELS.slice(1)) {
				for (const x of [RACK_FACE, RACK_FACE + 1.6]) addPiece('rack-beam', boxGeo(0.1, 0.16, BAY), COLORS.tape, at(side * x, y, z));
				addPiece('rack-deck', boxGeo(1.5, 0.04, BAY - 0.15), COLORS.steel, at(side * SLOT_X, y + 0.1, z));
			}
			for (const dz of [-0.68, 0.68]) addPiece('stand-rail', boxGeo(1.5, 0.35, 0.12), COLORS.steel, at(side * SLOT_X, 0.175, z + dz));
		}
	}

	// wrapped loads (pallet + stretch-wrapped block), tinted by product
	const white = new THREE.Color('#ffffff');
	const wrapColor = (hex, mix = 0.35) => new THREE.Color(hex).lerp(white, mix);
	const wrapPallets = new THREE.InstancedMesh(boxGeo(1.4, 0.15, 1.4), mat(COLORS.wood), slots.length);
	const wrapBlocks = new THREE.InstancedMesh(
		boxGeo(1.32, 0.9, 1.32),
		new THREE.MeshToonMaterial({ color: '#ffffff', gradientMap, transparent: true, opacity: 0.92 }),
		slots.length
	);
	const hidden = new THREE.Matrix4().makeScale(0, 0, 0);
	function drawSlot(s) {
		const i = slots.indexOf(s);
		if (!s.occupied) {
			wrapPallets.setMatrixAt(i, hidden);
			wrapBlocks.setMatrixAt(i, hidden);
		} else {
			wrapPallets.setMatrixAt(i, tmp.makeTranslation(s.pos.x, s.pos.y, s.pos.z));
			wrapBlocks.setMatrixAt(i, tmp.makeTranslation(s.pos.x, s.pos.y + 0.525, s.pos.z));
			// alternate shades so a project's pallets read as separate parts
			const hex = s.color ?? PRODUCTS[s.product]?.wrap ?? '#d9d6ce';
			wrapBlocks.setColorAt(i, wrapColor(hex, s.segment % 2 ? 0.5 : 0.25));
		}
		wrapPallets.instanceMatrix.needsUpdate = true;
		wrapBlocks.instanceMatrix.needsUpdate = true;
		if (wrapBlocks.instanceColor) wrapBlocks.instanceColor.needsUpdate = true;
	}
	slots.forEach(drawSlot);
	wrapPallets.frustumCulled = wrapBlocks.frustumCulled = false;
	scene.add(wrapPallets, wrapBlocks);

	// each stored pallet: a sample of the product on top and its own hit target
	for (const s of stored) {
		const [, sy] = PRODUCTS[s.product].size;
		productParts(s.product).forEach((pt, i) =>
			addPiece(`sample-${s.product}-${i}`, pt.geo, pt.color, new THREE.Matrix4().multiplyMatrices(at(s.pos.x, s.pos.y + 0.975 + sy / 2, s.pos.z), pt.local))
		);
		stationTargets.push({
			project: s.group.project,
			group: s.group,
			station: s.segment,
			kind: 'station',
			pallet: s,
			center: new THREE.Vector3(s.pos.x, s.pos.y + 0.6, s.pos.z),
			size: new THREE.Vector3(1.7, 1.7, BAY - 0.2)
		});
	}

	// each project: one beam label across its run of pallets, and a hit target for the run
	for (const g of groups) {
		const n = g.recipe.stations.length;
		const z = W0 + (g.bay + n / 2) * BAY;
		const w = n * BAY - 0.25;
		sign(
			drawSlotLabel(g.project.code, g.project.title, Math.round((w / 0.5) * 128)),
			w,
			0.5,
			g.side * (RACK_FACE - 0.08),
			LEVELS[g.level] - 0.2,
			z,
			g.side < 0 ? Math.PI / 2 : -Math.PI / 2
		);
		hitTargets.push({
			project: g.project,
			center: new THREE.Vector3(g.side * SLOT_X, levelY(g.level) + 0.6, z),
			size: new THREE.Vector3(1.9, 1.9, n * BAY - 0.1),
			kind: 'group',
			group: g
		});
	}

	// flush the batched static pieces
	for (const { geo, color: c, mats } of instancedPieces.values()) {
		const mesh = new THREE.InstancedMesh(geo, mat(c), mats.length);
		mats.forEach((m, i) => mesh.setMatrixAt(i, m));
		mesh.instanceMatrix.needsUpdate = true;
		scene.add(mesh);
	}

	// ---- Hit boxes (raycast-only layer) + highlights ----
	const hitMesh = new THREE.InstancedMesh(boxGeo(1, 1, 1), new THREE.MeshBasicMaterial(), hitTargets.length);
	hitTargets.forEach((t, i) => hitMesh.setMatrixAt(i, tmp.compose(t.center, q.identity(), t.size)));
	hitMesh.instanceMatrix.needsUpdate = true;
	hitMesh.computeBoundingSphere();
	hitMesh.layers.set(1); // the camera renders layer 0 only
	scene.add(hitMesh);
	const byProject = new Map(hitTargets.map((t) => [t.project.index, t]));

	const stationHit = new THREE.InstancedMesh(boxGeo(1, 1, 1), new THREE.MeshBasicMaterial(), stationTargets.length);
	stationTargets.forEach((t, i) => stationHit.setMatrixAt(i, tmp.compose(t.center, q.identity(), t.size)));
	stationHit.instanceMatrix.needsUpdate = true;
	stationHit.computeBoundingSphere();
	stationHit.layers.set(1);
	scene.add(stationHit);
	const stationOf = (index, s) => stationTargets.find((t) => t.project.index === index && t.station === s);

	const makeHighlight = (opacity) => {
		const m = new THREE.Mesh(
			boxGeo(1, 1, 1),
			new THREE.MeshBasicMaterial({ color: COLORS.tape, transparent: true, opacity, depthWrite: false })
		);
		m.visible = false;
		scene.add(m);
		return m;
	};
	const hoverBox = makeHighlight(0.16);
	const selectBox = makeHighlight(0.3);
	// work history → the projects from that job light up
	const linkBoxes = [];
	function showLinks(indices) {
		indices.forEach((index, i) => {
			if (!linkBoxes[i]) linkBoxes[i] = makeHighlight(0.38);
			placeHighlight(linkBoxes[i], byProject.get(index) ?? null);
		});
		for (let i = indices.length; i < linkBoxes.length; i++) linkBoxes[i].visible = false;
	}
	function placeHighlight(box, target) {
		box.visible = !!target;
		if (!target) return;
		if (target.kind === 'line') {
			box.position.set(target.center.x, 0.03, target.center.z);
			box.scale.set(target.size.x, 0.04, target.size.z);
		} else {
			box.position.copy(target.center);
			box.scale.copy(target.size);
		}
	}

	// ---- AGVs ----
	const agvs = Array.from({ length: AGV_COUNT }, (_, a) => {
		const side = a % 2 === 0 ? -1 : 1;
		const k = Math.floor(a / 2);
		const group = new THREE.Group();
		const body = new THREE.Mesh(boxGeo(1.6, 0.24, 1), mat(COLORS.dark));
		body.position.y = 0.14;
		const deck = new THREE.Mesh(boxGeo(1.3, 0.06, 0.86), mat(COLORS.tape));
		deck.position.y = 0.3;
		const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), new THREE.MeshBasicMaterial({ color: '#3ddc84' }));
		beacon.position.set(0.6, 0.36, 0);
		const load = new THREE.Group();
		const loadPallet = new THREE.Mesh(boxGeo(1.4, 0.15, 1.4), mat(COLORS.wood));
		loadPallet.position.y = 0.1;
		const loadMat = new THREE.MeshToonMaterial({ color: '#ffffff', gradientMap, transparent: true, opacity: 0.92 });
		const loadBlock = new THREE.Mesh(boxGeo(1.32, 0.9, 1.32), loadMat);
		loadBlock.position.y = 0.625;
		load.add(loadPallet, loadBlock);
		load.position.y = 0.355;
		load.visible = false;
		group.add(body, deck, beacon, load);
		const park = new THREE.Vector3(side * (1.4 + k * 1.3), 0, W0 - 5 - k * 1.8);
		group.position.copy(park);
		group.rotation.y = Math.PI / 2;
		scene.add(group);
		return {
			group, deck, beacon, load, loadMat, side, park,
			lane: side * (1.2 + k * 1.2),
			path: [], state: 'idle', line: null, slot: null, wait: 0, onArrive: null, loadColor: null
		};
	});

	const P = (x, z) => new THREE.Vector3(x, 0, z);
	const go = (agv, points, onArrive) => {
		agv.path = points;
		agv.onArrive = onArrive;
	};

	function dispatch(agv) {
		let best = null;
		for (const line of lines) {
			if (!line.running || line.side !== agv.side || line.claimed >= 0 || line.count < line.capacity) continue;
			if (!best || Math.abs(line.z - agv.group.position.z) < Math.abs(best.z - agv.group.position.z)) best = line;
		}
		if (!best) return;
		best.claimed = agvs.indexOf(agv);
		agv.line = best;
		agv.state = 'toPick';
		go(agv, [P(agv.lane, agv.group.position.z), P(agv.lane, best.z), P(agv.side * PICK_X, best.z)], () => {
			agv.state = 'lifting';
			agv.wait = 0.8;
		});
	}

	// A free ground bay on this side; if none, the oldest delivery ships out to make room
	function claimGroundSlot(side) {
		const mine = ground.filter((s) => s.side === side && s.reserved < 0);
		const slot = mine.find((s) => !s.occupied) ?? mine.sort((a, b) => a.age - b.age)[0];
		if (slot?.occupied) {
			slot.occupied = false;
			drawSlot(slot);
		}
		return slot;
	}

	function stepAgv(agv, dt, time) {
		if (agv.state === 'idle') return dispatch(agv);
		if (agv.state === 'lifting' || agv.state === 'dropping') {
			agv.wait -= dt;
			const lifting = agv.state === 'lifting';
			agv.deck.position.y = 0.3 + (lifting ? 1 - agv.wait / 0.8 : agv.wait / 0.8) * 0.12;
			if (agv.wait > 0) return;
			if (lifting) {
				const line = agv.line;
				line.pallet = false;
				line.count = 0;
				line.timer = 0;
				line.placing = false;
				agv.loadColor = line.wrap;
				agv.loadMat.color.copy(wrapColor(line.wrap));
				agv.load.visible = true;
				const slot = claimGroundSlot(agv.side);
				slot.reserved = agvs.indexOf(agv);
				agv.slot = slot;
				agv.state = 'toStore';
				go(agv, [P(agv.lane, line.z), P(agv.lane, slot.pos.z), P(slot.pos.x, slot.pos.z)], () => {
					agv.state = 'dropping';
					agv.wait = 0.8;
				});
			} else {
				const slot = agv.slot;
				Object.assign(slot, { occupied: true, color: agv.loadColor, age: time, reserved: -1 });
				drawSlot(slot);
				agv.load.visible = false;
				agv.slot = null;
				agv.state = 'returning';
				go(agv, [P(agv.lane, slot.pos.z), P(agv.lane, agv.park.z), agv.park.clone()], () => (agv.state = 'idle'));
			}
			return;
		}

		// driving
		const target = agv.path[0];
		if (!target) return agv.onArrive?.();
		const pos = agv.group.position;
		const to = v.subVectors(target, pos);
		const dist = to.length();
		if (dist > 0.05) {
			let dyaw = Math.atan2(-to.z, to.x) - agv.group.rotation.y;
			dyaw = Math.atan2(Math.sin(dyaw), Math.cos(dyaw));
			agv.group.rotation.y += dyaw * Math.min(1, dt * 10);
			if (Math.abs(dyaw) > 0.6) return; // turn in place before driving
		}
		const step = AGV_SPEED * dt;
		if (dist <= step) {
			pos.copy(target);
			agv.path.shift();
			// clear of the cell: a fresh empty pallet drops onto the stand
			if (agv.state === 'toStore' && agv.line && agv.path.length === 2) {
				agv.line.pallet = true;
				agv.line.claimed = -1;
				agv.line = null;
			}
			if (!agv.path.length) agv.onArrive?.();
		} else {
			pos.addScaledVector(to, step / dist);
		}
	}

	function stepLines(dt) {
		for (const line of lines) {
			if (!line.running || !line.pallet || line.count >= line.capacity) continue;
			line.timer += dt;
			if (line.timer >= line.interval) {
				line.timer -= line.interval;
				line.placing = true;
			}
			// the item lands when the arm reaches the pallet, halfway through its swing
			if (line.placing && line.timer >= line.armSwing / 2) {
				line.placing = false;
				line.count++;
			}
		}
	}

	// ---- Theme ----
	function setTheme() {
		const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#ecebe6';
		const dark = new THREE.Color(bg).getHSL({}).l < 0.3;
		scene.background = new THREE.Color(bg);
		scene.fog.color.set(bg);
		wallMat.color.set(dark ? '#232528' : '#d8d5cc');
		const g = floorCanvas.getContext('2d');
		g.fillStyle = dark ? '#1b1d20' : '#dedbd3';
		g.fillRect(0, 0, 128, 128);
		g.strokeStyle = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)';
		g.lineWidth = 2;
		g.strokeRect(0, 0, 128, 128);
		floorTex.needsUpdate = true;
	}
	setTheme();

	// ---- Resize / view insets ----
	// HUD panels cover parts of the canvas. The frustum is widened by the covered
	// amount and cropped, so camera targets land in the open area. The full
	// frustum's FOV is scaled so the visible canvas keeps the base FOV.
	const BASE_TAN = Math.tan(THREE.MathUtils.degToRad(25));
	let insets = { left: 0, right: 0, bottom: 0 };
	function openTan() {
		const { clientWidth: w, clientHeight: h } = container;
		if (!h) return { tanH: BASE_TAN, tanV: BASE_TAN };
		return {
			tanH: (BASE_TAN * Math.max(80, w - insets.left - insets.right)) / h,
			tanV: (BASE_TAN * Math.max(80, h - insets.bottom)) / h
		};
	}
	function resize() {
		const { clientWidth: w, clientHeight: h } = container;
		if (!w || !h) return;
		renderer.setSize(w, h, false);
		const { left, right, bottom } = insets;
		const fullW = w + left + right;
		const fullH = h + bottom;
		camera.aspect = fullW / fullH;
		camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan((BASE_TAN * fullH) / h));
		if (left || right || bottom) camera.setViewOffset(fullW, fullH, right, bottom, w, h);
		else camera.clearViewOffset();
		camera.updateProjectionMatrix();
	}
	const ro = new ResizeObserver(resize);
	ro.observe(container);
	resize();

	// ---- Camera views ----
	let fly = null;
	function flyTo({ position, target }, duration = 1.3) {
		if (reducedMotion) {
			camera.position.copy(position);
			controls.target.copy(target);
			fly = null;
			return;
		}
		fly = { fromPos: camera.position.clone(), fromTarget: controls.target.clone(), toPos: position, toTarget: target, t: 0, duration };
	}
	controls.addEventListener('start', () => (fly = null));

	function fitDistance(w, h) {
		const { tanH, tanV } = openTan();
		return Math.max(w / 2 / tanH, h / 2 / tanV);
	}
	const portrait = () => openTan().tanH < openTan().tanV;
	const view = (target, dir, dist) => ({ position: target.clone().addScaledVector(dir.normalize(), dist), target });

	const views = {
		home() {
			const narrow = portrait();
			return view(new THREE.Vector3(narrow ? -7 : 0.5, WALL_H * 0.4, WALL_Z + 4), new THREE.Vector3(0, 0.3, 1), fitDistance(narrow ? 28 : 60, WALL_H + 2));
		},
		wall() {
			const narrow = portrait();
			const target = new THREE.Vector3(narrow ? -7 : 0.3, BOARD_Y, WALL_Z);
			return { position: new THREE.Vector3(target.x, BOARD_Y + 0.4, WALL_Z + fitDistance(narrow ? 27 : 44, 13.5) * 1.04), target };
		},
		timeline() {
			const target = new THREE.Vector3((TL_X0 - ORG_W + TL_X1) / 2, RAIL_Y / 2 + 0.5, WALL_Z);
			return { position: new THREE.Vector3(target.x, RAIL_Y / 2 + 1, WALL_Z + fitDistance(TL_X1 - TL_X0 + ORG_W + 2, RAIL_Y + 1.5)), target };
		},
		experience(t) {
			const target = t.center.clone();
			return { position: new THREE.Vector3(target.x, target.y + 0.8, WALL_Z + fitDistance(Math.max(t.size.x, 6) + 8, 5)), target };
		},
		warehouse() {
			// from the entrance, looking down the aisle between the racks
			return view(new THREE.Vector3(0, 3, W0 + 10), new THREE.Vector3(0, 0.45, -1), fitDistance(20, 12));
		},
		lines() {
			return view(new THREE.Vector3(0, 1, lastRowZ / 2), new THREE.Vector3(0, 0.85, 0.6), fitDistance(maxOuter * 1.6, lastRowZ + 12));
		},
		target(t) {
			if (t.kind === 'station' && t.pallet) {
				return view(t.center.clone(), new THREE.Vector3(-t.pallet.side, 0.3, 0.4), fitDistance(6, 4.5));
			}
			if (t.kind === 'station') {
				const target = t.center.clone().setY(1.3);
				return view(target, new THREE.Vector3(-t.line.side * 0.35, 0.5, 0.85), fitDistance(t.size.x + 8, 7));
			}
			if (t.kind === 'line') {
				const target = new THREE.Vector3(t.center.x, 1.2, t.center.z);
				return view(target, new THREE.Vector3(-t.line.side * 0.25, 0.6, 0.8), fitDistance(t.size.x + 2, 9) * 0.95);
			}
			// a project's run of pallets: look across the aisle at it
			return view(t.center.clone(), new THREE.Vector3(-t.group.side, 0.35, 0.45), fitDistance(t.size.z + 4, 5));
		}
	};

	// keep the view over the floor: clamp the target and carry the camera along
	const bounds = { minX: -maxOuter - 2, maxX: maxOuter + 2, minZ: WALL_Z + 1, maxZ: W1 + 6 };
	const clampDelta = new THREE.Vector3();
	function clampTarget() {
		const t = controls.target;
		clampDelta.set(
			THREE.MathUtils.clamp(t.x, bounds.minX, bounds.maxX) - t.x,
			THREE.MathUtils.clamp(t.y, 0, WALL_H) - t.y,
			THREE.MathUtils.clamp(t.z, bounds.minZ, bounds.maxZ) - t.z
		);
		if (clampDelta.lengthSq()) {
			t.add(clampDelta);
			camera.position.add(clampDelta);
		}
		if (camera.position.z < WALL_Z + 1) camera.position.z = WALL_Z + 1;
	}

	// ---- Picking ----
	const raycaster = new THREE.Raycaster();
	raycaster.layers.enable(1);
	const pointer = new THREE.Vector2();
	let hovered = '';
	let selected = '';
	const keyOf = (project, station) => (project < 0 ? '' : `${project}:${station}`);
	const targetOf = (project, station) => (station >= 0 ? stationOf(project, station) : byProject.get(project));

	function pick(clientX, clientY) {
		const rect = renderer.domElement.getBoundingClientRect();
		pointer.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
		raycaster.setFromCamera(pointer, camera);
		const card = raycaster.intersectObjects(expMeshes, false)[0];
		if (card) return { project: -1, station: -1, experience: expMeshes.indexOf(card.object), wall: false };
		const hit = raycaster.intersectObjects([hitMesh, ...boards], false)[0];
		// stations sit inside their line's box: a station wins if it's nearer, or inside the line that was hit
		const st = raycaster.intersectObject(stationHit, false)[0];
		if (st) {
			const t = stationTargets[st.instanceId];
			const h = hit?.object === hitMesh ? hitTargets[hit.instanceId] : null;
			const owner = (x) => x?.line ?? x?.group;
			if (!hit || st.distance < hit.distance || (h && owner(h) === owner(t)))
				return { project: t.project.index, station: t.station, wall: false };
		}
		if (!hit) return { project: -1, station: -1, wall: false };
		return hit.object === hitMesh
			? { project: hitTargets[hit.instanceId].project.index, station: -1, wall: false }
			: { project: -1, station: -1, wall: true };
	}

	let downAt = null;
	const el = renderer.domElement;
	const onPointerDown = (e) => (downAt = [e.clientX, e.clientY]);
	const onPointerMove = (e) => {
		if (e.pointerType !== 'mouse' || e.buttons) return;
		const { project, station, experience: exp = -1 } = pick(e.clientX, e.clientY);
		const key = exp >= 0 ? `e${exp}` : keyOf(project, station);
		if (key !== hovered) {
			hovered = key;
			const target = exp >= 0 ? expTargets[exp] : project >= 0 ? targetOf(project, station) : null;
			placeHighlight(hoverBox, key === selected ? null : target);
			el.style.cursor = target ? 'pointer' : '';
		}
		onHover?.(project, e.clientX, e.clientY, station, exp);
	};
	const onPointerLeave = () => {
		hovered = '';
		placeHighlight(hoverBox, null);
		onHover?.(-1);
	};
	const onPointerUp = (e) => {
		if (!downAt) return;
		const moved = Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]);
		downAt = null;
		if (moved > 6) return;
		const { project, station, wall, experience: exp = -1 } = pick(e.clientX, e.clientY);
		if (exp >= 0) onSelectExperience?.(exp);
		else if (project >= 0) onSelect?.(project, station);
		else if (wall) flyTo(views.wall());
	};
	el.addEventListener('pointerdown', onPointerDown);
	el.addEventListener('pointermove', onPointerMove);
	el.addEventListener('pointerleave', onPointerLeave);
	el.addEventListener('pointerup', onPointerUp);

	// ---- Keyboard: WASD / arrows move, Q/E rotate, Shift is faster ----
	const keys = new Set();
	const MOVE_KEYS = new Set(['w', 'a', 's', 'd', 'q', 'e', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright']);
	const typing = (e) => e.target.closest?.('input, textarea, select, [contenteditable]');
	const onKeyDown = (e) => {
		const k = e.key.toLowerCase();
		if (e.metaKey || e.ctrlKey || e.altKey || typing(e) || !MOVE_KEYS.has(k)) return;
		// arrows only steer the floor while it fills the view; otherwise let the page scroll
		if (k.startsWith('arrow')) {
			const r = container.getBoundingClientRect();
			if (r.top > innerHeight * 0.4 || r.bottom < innerHeight * 0.6) return;
			e.preventDefault();
		}
		keys.add(k);
		fly = null;
	};
	const onKeyUp = (e) => keys.delete(e.key.toLowerCase());
	const clearKeys = () => keys.clear();
	addEventListener('keydown', onKeyDown);
	addEventListener('keyup', onKeyUp);
	addEventListener('blur', clearKeys);

	const forward = new THREE.Vector3();
	const right = new THREE.Vector3();
	const offset = new THREE.Vector3();
	function stepKeys(dt, fast) {
		if (!keys.size) return;
		const has = (...k) => k.some((x) => keys.has(x));
		const dist = camera.position.distanceTo(controls.target);
		const speed = Math.max(8, dist * 0.9) * (fast ? 2.2 : 1) * dt;
		camera.getWorldDirection(forward).setY(0).normalize();
		right.crossVectors(forward, yAxis).normalize();
		const move = new THREE.Vector3();
		if (has('w', 'arrowup')) move.add(forward);
		if (has('s', 'arrowdown')) move.sub(forward);
		if (has('d', 'arrowright')) move.add(right);
		if (has('a', 'arrowleft')) move.sub(right);
		if (move.lengthSq()) {
			move.normalize().multiplyScalar(speed);
			camera.position.add(move);
			controls.target.add(move);
		}
		const turn = (has('q') ? 1 : 0) - (has('e') ? 1 : 0);
		if (turn) {
			offset.subVectors(camera.position, controls.target).applyAxisAngle(yAxis, turn * 1.6 * dt);
			camera.position.copy(controls.target).add(offset);
		}
	}
	let shift = false;
	const onShift = (e) => (shift = e.shiftKey);
	addEventListener('keydown', onShift);
	addEventListener('keyup', onShift);

	// Where the view is along the hall, for the AGV in the top bar
	const hallStart = WALL_Z;
	const hallEnd = W1 + 6;
	const along = (z) => THREE.MathUtils.clamp((z - hallStart) / (hallEnd - hallStart), 0, 1);
	const zoneAt = (z) => (z < WALL_Z + 12 ? 'Wall' : z < W0 - 4 ? 'Lines' : 'Warehouse');
	let lastProgress = -1;
	function reportMove() {
		const z = controls.target.z;
		const progress = along(z);
		if (Math.abs(progress - lastProgress) < 0.002) return;
		lastProgress = progress;
		onMove?.({ progress, zone: zoneAt(z) });
	}
	const stops = [
		{ label: 'Wall', at: along(WALL_Z + 6), view: 'home' },
		{ label: 'Lines', at: along(lastRowZ / 2), view: 'lines' },
		{ label: 'Warehouse', at: along((W0 + W1) / 2), view: 'warehouse' }
	];

	// ---- Loop ----
	let visible = true;
	const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
	io.observe(container);

	const start = views.home();
	camera.position.copy(start.position);
	controls.target.copy(start.target);
	for (const f of flows) f.update(0);

	const clock = new THREE.Clock();
	let simTime = 0;
	let raf = 0;
	function frame() {
		raf = requestAnimationFrame(frame);
		const dt = Math.min(clock.getDelta(), 0.1);
		if (!visible) return;

		if (!reducedMotion) {
			simTime += dt;
			stepLines(dt);
			for (const agv of agvs) {
				stepAgv(agv, dt, simTime);
				agv.beacon.visible = agv.state === 'idle' || Math.floor(simTime * 3) % 2 === 0;
			}
			for (const f of flows) f.update(simTime);
			for (const a of animated) a.update(simTime);
		}

		stepKeys(dt, shift);
		if (fly) {
			fly.t = Math.min(1, fly.t + dt / fly.duration);
			const k = ease(fly.t);
			camera.position.lerpVectors(fly.fromPos, fly.toPos, k);
			controls.target.lerpVectors(fly.fromTarget, fly.toTarget, k);
			if (fly.t >= 1) fly = null;
		}
		controls.update();
		clampTarget();
		reportMove();
		renderer.render(scene, camera);
	}
	frame();

	return {
		select(index, station = -1) {
			showLinks([]);
			selected = keyOf(index, station);
			const target = index >= 0 ? targetOf(index, station) : null;
			placeHighlight(selectBox, target);
			if (selected === hovered) placeHighlight(hoverBox, null);
			if (target) flyTo(views.target(target));
		},
		selectExperience(i, linked = []) {
			const t = expTargets[i];
			selected = t ? `e${i}` : '';
			placeHighlight(selectBox, t ?? null);
			placeHighlight(hoverBox, null);
			showLinks(linked);
			if (t) flyTo(views.experience(t));
		},
		timeline: () => flyTo(views.timeline()),
		home: () => flyTo(views.home()),
		lines: () => flyTo(views.lines()),
		wall: () => flyTo(views.wall()),
		warehouse: () => flyTo(views.warehouse()),
		stops,
		setTheme,
		setInsets(next) {
			insets = { left: 0, right: 0, bottom: 0, ...next };
			resize();
		},
		debug: () => ({
			agvs: agvs.map((a) => `${a.state} ${a.group.position.x.toFixed(1)},${a.group.position.z.toFixed(1)}`),
			lines: lines.filter((l) => l.running).map((l) => `${l.project.code} ${l.count}/${l.capacity}`),
			delivered: ground.filter((s) => s.occupied).length
		}),
		destroy() {
			cancelAnimationFrame(raf);
			ro.disconnect();
			io.disconnect();
			el.removeEventListener('pointerdown', onPointerDown);
			el.removeEventListener('pointermove', onPointerMove);
			el.removeEventListener('pointerleave', onPointerLeave);
			el.removeEventListener('pointerup', onPointerUp);
			removeEventListener('keydown', onKeyDown);
			removeEventListener('keyup', onKeyUp);
			removeEventListener('blur', clearKeys);
			removeEventListener('keydown', onShift);
			removeEventListener('keyup', onShift);
			controls.dispose();
			scene.traverse((o) => {
				o.geometry?.dispose();
				const m = o.material;
				if (m) for (const mm of Array.isArray(m) ? m : [m]) (mm.map?.dispose(), mm.dispose());
			});
			gradientMap.dispose();
			renderer.dispose();
			el.remove();
		}
	};
}
