/**
 * The factory floor. Every project is a production line:
 *
 *   unwind → converter → cartoner → casepacker → palletizer → (AGV pickup)
 *
 * Lines sit on both sides of a central AGV aisle, running from the outer wall
 * inward. Machines are InstancedMeshes (one draw call per part across all
 * lines), so the floor stays cheap even with ~50 lines.
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { drawAboutBoard, drawToolingBoard, drawLineSign, loadFonts } from './signage.js';

// ---- Layout (world units ≈ meters) ----
const OUTER = 36; // |x| where a line starts (unwind end)
const ROW = 8; // z spacing between rows of lines
const AISLE = 5; // aisle half-width
const WALL_Z = -20;
const DOCK_Z = -12;
const PALLET_X = 27.8; // local x of the pallet pickup spot
const CASES_PER_PALLET = 8;
const BELT_Y = 0.98;
const AGV_COUNT = 10;
const AGV_SPEED = 10;
const ARM_SWING = 1.6; // seconds per pick-and-place

// Local x ranges of the conveyor segments between machines
const SEGMENTS = [
	{ from: 8, to: 11, count: 3, kind: 'product' }, // converter → cartoner
	{ from: 15, to: 17.5, count: 2, kind: 'carton' }, // cartoner → casepacker
	{ from: 21.5, to: 25.4, count: 3, kind: 'case' } // casepacker → palletizer
];
const BELT_SPEED = 0.7;

const COLORS = {
	converter: '#3b7dd8',
	cartoner: '#2fa36b',
	casepacker: '#e07b39',
	steel: '#8a9099',
	dark: '#2b2d31',
	cap: '#3a3d42',
	tape: '#f2b705',
	paper: '#f4f1ea',
	product: '#ffffff',
	carton: '#e9c98f',
	kraft: '#b98549',
	wood: '#c8a165',
	glass: '#1f2a36'
};

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function toonGradient() {
	const data = new Uint8Array([90, 170, 255]);
	const tex = new THREE.DataTexture(data, 3, 1, THREE.RedFormat);
	tex.minFilter = tex.magFilter = THREE.NearestFilter;
	tex.needsUpdate = true;
	return tex;
}

export async function createFactory(container, { projects, about, onSelect, onHover }) {
	const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
	const N = projects.length;
	const rows = Math.ceil(N / 2);
	const lastZ = (rows - 1) * ROW;

	// ---- Renderer / scene / camera ----
	const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
	renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
	renderer.outputColorSpace = THREE.SRGBColorSpace;
	container.appendChild(renderer.domElement);

	const scene = new THREE.Scene();
	scene.fog = new THREE.Fog('#ecebe6', 90, 220);
	const camera = new THREE.PerspectiveCamera(50, 1, 0.5, 400);

	const controls = new OrbitControls(camera, renderer.domElement);
	controls.enableDamping = true;
	controls.dampingFactor = 0.08;
	controls.maxPolarAngle = Math.PI * 0.47;
	controls.minDistance = 5;
	controls.maxDistance = 140;
	controls.screenSpacePanning = false;

	scene.add(new THREE.HemisphereLight('#ffffff', '#8d8a80', 1.6));
	const sun = new THREE.DirectionalLight('#ffffff', 1.4);
	sun.position.set(30, 60, 40);
	scene.add(sun);

	const gradientMap = toonGradient();
	const materials = new Map();
	const mat = (color, extra = {}) => {
		const key = color + JSON.stringify(extra);
		if (!materials.has(key)) materials.set(key, new THREE.MeshToonMaterial({ color, gradientMap, ...extra }));
		return materials.get(key);
	};

	// ---- Floor, aisle tape, dock zone, back wall ----
	const floorCanvas = document.createElement('canvas');
	floorCanvas.width = floorCanvas.height = 128;
	const floorTex = new THREE.CanvasTexture(floorCanvas);
	floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
	floorTex.colorSpace = THREE.SRGBColorSpace;
	const floorW = OUTER * 2 + 20;
	const floorD = lastZ - WALL_Z + 40;
	floorTex.repeat.set(floorW / 4, floorD / 4);
	const floor = new THREE.Mesh(
		new THREE.PlaneGeometry(floorW, floorD),
		new THREE.MeshLambertMaterial({ map: floorTex })
	);
	floor.rotation.x = -Math.PI / 2;
	floor.position.set(0, 0, WALL_Z + floorD / 2);
	scene.add(floor);

	const tapeMat = new THREE.MeshBasicMaterial({ color: COLORS.tape });
	for (const x of [-AISLE, AISLE]) {
		const tape = new THREE.Mesh(new THREE.PlaneGeometry(0.25, lastZ - DOCK_Z + 10), tapeMat);
		tape.rotation.x = -Math.PI / 2;
		tape.position.set(x, 0.01, (DOCK_Z + lastZ + 10) / 2);
		scene.add(tape);
	}

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
	const hazardTex = new THREE.CanvasTexture(hazardCanvas);
	hazardTex.wrapS = THREE.RepeatWrapping;
	hazardTex.colorSpace = THREE.SRGBColorSpace;
	hazardTex.repeat.set(6, 1);
	const dockEdge = new THREE.Mesh(
		new THREE.PlaneGeometry(24, 0.6),
		new THREE.MeshBasicMaterial({ map: hazardTex })
	);
	dockEdge.rotation.x = -Math.PI / 2;
	dockEdge.position.set(0, 0.012, DOCK_Z + 3.2);
	scene.add(dockEdge);

	const wallMat = new THREE.MeshLambertMaterial({ color: '#d8d5cc' });
	const wall = new THREE.Mesh(new THREE.BoxGeometry(floorW, 18, 0.6), wallMat);
	wall.position.set(0, 9, WALL_Z - 0.3);
	scene.add(wall);

	// ---- About boards on the wall ----
	await loadFonts();
	const boards = [];
	const addBoard = (canvasEl, w, h, x, y) => {
		const tex = new THREE.CanvasTexture(canvasEl);
		tex.colorSpace = THREE.SRGBColorSpace;
		tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
		const board = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex }));
		board.position.set(x, y, WALL_Z + 0.02);
		scene.add(board);
		boards.push(board);
	};
	addBoard(await drawAboutBoard(about), 26, 13, -7, 8);
	addBoard(drawToolingBoard(about, N), 13.6, 12.75, 14, 7.9);

	// ---- Per-line transforms ----
	const lineSide = (i) => (i % 2 === 0 ? -1 : 1);
	const lineZ = (i) => Math.floor(i / 2) * ROW;
	const lineMatrices = projects.map((_, i) => {
		const m = new THREE.Matrix4().makeTranslation(lineSide(i) * OUTER, 0, lineZ(i));
		if (lineSide(i) > 0) m.multiply(new THREE.Matrix4().makeRotationY(Math.PI));
		return m;
	});
	const toWorld = (i, x, y = 0, z = 0) => new THREE.Vector3(x, y, z).applyMatrix4(lineMatrices[i]);
	const lineCenter = (i) => toWorld(i, 15, 1.5, 0);

	// ---- Static machine parts (instanced across all lines) ----
	const tmp = new THREE.Matrix4();
	const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
	const at = (x, y, z) => new THREE.Matrix4().makeTranslation(x, y, z);

	const staticParts = [
		// unwind stand + converter
		{ geo: box(0.25, 2.2, 0.25), color: COLORS.steel, locals: [at(1, 1.1, -1.4), at(1, 1.1, 1.4)] },
		{ geo: box(5.5, 2.8, 3), color: COLORS.converter, locals: [at(5.25, 1.4, 0)] },
		{ geo: box(5.6, 0.12, 3.1), color: COLORS.cap, locals: [at(5.25, 2.84, 0)] },
		{ geo: box(5.62, 0.14, 3.12), color: COLORS.tape, locals: [at(5.25, 0.2, 0)] },
		{ geo: box(2.6, 1, 0.04), color: COLORS.glass, locals: [at(5.25, 1.7, 1.52)] },
		// conveyor frame + belt
		{ geo: box(18, 0.88, 0.9), color: COLORS.steel, locals: [at(17, 0.44, 0)] },
		{ geo: box(18, 0.08, 0.92), color: COLORS.dark, locals: [at(17, 0.92, 0)] },
		// cartoner
		{ geo: box(4, 2.4, 2.6), color: COLORS.cartoner, locals: [at(13, 1.2, 0)] },
		{ geo: box(4.1, 0.12, 2.7), color: COLORS.cap, locals: [at(13, 2.44, 0)] },
		{ geo: box(4.12, 0.14, 2.62), color: COLORS.tape, locals: [at(13, 0.2, 0)] },
		{ geo: box(2.2, 0.9, 0.04), color: COLORS.glass, locals: [at(13, 1.5, 1.32)] },
		// casepacker
		{ geo: box(4, 2.8, 2.8), color: COLORS.casepacker, locals: [at(19.5, 1.4, 0)] },
		{ geo: box(4.1, 0.12, 2.9), color: COLORS.cap, locals: [at(19.5, 2.84, 0)] },
		{ geo: box(4.12, 0.14, 2.82), color: COLORS.tape, locals: [at(19.5, 0.2, 0)] },
		{ geo: box(2.2, 1, 0.04), color: COLORS.glass, locals: [at(19.5, 1.7, 1.42)] },
		// palletizer cell: posts, top beams, robot pedestal, P&D stand rails
		{
			geo: box(0.18, 3.4, 0.18),
			color: COLORS.tape,
			locals: [at(23.4, 1.7, -2), at(23.4, 1.7, 2), at(29.6, 1.7, -2), at(29.6, 1.7, 2)]
		},
		{ geo: box(6.4, 0.18, 0.18), color: COLORS.tape, locals: [at(26.5, 3.4, -2), at(26.5, 3.4, 2)] },
		{ geo: box(0.18, 0.18, 4.2), color: COLORS.tape, locals: [at(23.4, 3.4, 0)] },
		{ geo: new THREE.CylinderGeometry(0.35, 0.45, 1.6, 12), color: COLORS.dark, locals: [at(26.2, 0.8, -1.5)] },
		{ geo: box(1.5, 0.35, 0.12), color: COLORS.steel, locals: [at(PALLET_X, 0.175, -0.68), at(PALLET_X, 0.175, 0.68)] }
	];

	const instanced = [];
	for (const part of staticParts) {
		const mesh = new THREE.InstancedMesh(part.geo, mat(part.color), N * part.locals.length);
		let k = 0;
		for (let i = 0; i < N; i++) {
			for (const local of part.locals) mesh.setMatrixAt(k++, tmp.multiplyMatrices(lineMatrices[i], local));
		}
		mesh.instanceMatrix.needsUpdate = true;
		scene.add(mesh);
		instanced.push(mesh);
	}

	// ---- Line banners ----
	const signGeo = new THREE.PlaneGeometry(8, 1);
	const signPoleGeo = new THREE.CylinderGeometry(0.05, 0.05, 5.6, 6);
	const signPoles = new THREE.InstancedMesh(signPoleGeo, mat(COLORS.dark), N * 2);
	const signs = projects.map((p, i) => {
		const tex = new THREE.CanvasTexture(drawLineSign(p.code, p.title));
		tex.colorSpace = THREE.SRGBColorSpace;
		tex.anisotropy = 4;
		const sign = new THREE.Mesh(signGeo, new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }));
		const c = toWorld(i, 15.5, 0, 0);
		sign.position.set(c.x, 5.1, c.z - 2.4);
		scene.add(sign);
		signPoles.setMatrixAt(i * 2, at(c.x - 3.9, 2.8, c.z - 2.4));
		signPoles.setMatrixAt(i * 2 + 1, at(c.x + 3.9, 2.8, c.z - 2.4));
		return sign;
	});
	signPoles.instanceMatrix.needsUpdate = true;
	scene.add(signPoles);

	// ---- Animated instanced parts ----
	const hidden = new THREE.Matrix4().makeScale(0, 0, 0);
	const rolls = new THREE.InstancedMesh(
		new THREE.CylinderGeometry(0.85, 0.85, 2.4, 20).rotateX(Math.PI / 2),
		mat(COLORS.paper),
		N
	);
	const arms = new THREE.InstancedMesh(box(1.9, 0.22, 0.26), mat(COLORS.dark), N);
	const flow = {
		product: new THREE.InstancedMesh(box(0.3, 0.3, 0.3), mat(COLORS.product), N * SEGMENTS[0].count),
		carton: new THREE.InstancedMesh(box(0.5, 0.36, 0.4), mat(COLORS.carton), N * SEGMENTS[1].count),
		case: new THREE.InstancedMesh(box(0.62, 0.45, 0.6), mat(COLORS.kraft), N * SEGMENTS[2].count)
	};
	const pallets = new THREE.InstancedMesh(box(1.4, 0.15, 1.4), mat(COLORS.wood), N);
	const stacks = new THREE.InstancedMesh(box(0.62, 0.45, 0.62), mat(COLORS.kraft), N * CASES_PER_PALLET);
	for (const m of [rolls, arms, pallets, stacks, ...Object.values(flow)]) {
		m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
		scene.add(m);
	}

	const stackOffsets = [];
	for (let layer = 0; layer < 2; layer++)
		for (const dx of [-0.33, 0.33]) for (const dz of [-0.33, 0.33]) stackOffsets.push([dx, 0.3 + layer * 0.46, dz]);

	// ---- Hit boxes + highlight ----
	const hitBoxes = new THREE.InstancedMesh(
		box(31, 5.5, 5),
		new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
		N
	);
	for (let i = 0; i < N; i++) hitBoxes.setMatrixAt(i, tmp.multiplyMatrices(lineMatrices[i], at(15, 2.75, 0)));
	hitBoxes.instanceMatrix.needsUpdate = true;
	hitBoxes.layers.set(1); // raycast-only: the camera renders layer 0
	scene.add(hitBoxes);

	const highlightGeo = new THREE.PlaneGeometry(31, 5.4).rotateX(-Math.PI / 2);
	const hoverPad = new THREE.Mesh(
		highlightGeo,
		new THREE.MeshBasicMaterial({ color: COLORS.tape, transparent: true, opacity: 0.22, depthWrite: false })
	);
	const selectPad = new THREE.Mesh(
		highlightGeo,
		new THREE.MeshBasicMaterial({ color: COLORS.tape, transparent: true, opacity: 0.42, depthWrite: false })
	);
	hoverPad.visible = selectPad.visible = false;
	scene.add(hoverPad, selectPad);
	const placePad = (pad, i) => {
		pad.visible = i >= 0;
		if (i < 0) return;
		const c = toWorld(i, 15, 0.02, 0);
		pad.position.set(c.x, 0.02, c.z);
	};

	// ---- Line production state ----
	const lines = projects.map((_, i) => ({
		count: Math.floor(Math.random() * CASES_PER_PALLET),
		timer: Math.random() * 10,
		interval: 9 + (i % 5) * 1.5,
		pallet: true, // an empty/partial pallet sits on the stand
		placing: false,
		claimed: -1
	}));

	// ---- AGVs ----
	const agvGeo = {
		body: box(1.6, 0.24, 1),
		deck: box(1.3, 0.06, 0.86),
		beacon: new THREE.SphereGeometry(0.1, 8, 6)
	};
	const loadedCaseGeo = box(0.62, 0.45, 0.62);
	const agvs = Array.from({ length: AGV_COUNT }, (_, a) => {
		const side = a % 2 === 0 ? -1 : 1;
		const group = new THREE.Group();
		const body = new THREE.Mesh(agvGeo.body, mat(COLORS.dark));
		body.position.y = 0.14;
		const deck = new THREE.Mesh(agvGeo.deck, mat(COLORS.tape));
		deck.position.y = 0.3;
		const beacon = new THREE.Mesh(agvGeo.beacon, new THREE.MeshBasicMaterial({ color: '#3ddc84' }));
		beacon.position.set(0.6, 0.36, 0);
		const load = new THREE.Group();
		const pallet = new THREE.Mesh(pallets.geometry, mat(COLORS.wood));
		pallet.position.y = 0.1;
		load.add(pallet);
		for (const [dx, dy, dz] of stackOffsets) {
			const c = new THREE.Mesh(loadedCaseGeo, mat(COLORS.kraft));
			c.position.set(dx, 0.1 + dy, dz);
			load.add(c);
		}
		load.position.y = 0.355;
		load.visible = false;
		group.add(body, deck, beacon, load);
		const lane = side * (1.2 + (Math.floor(a / 2) % 4) * 1.1);
		const dock = new THREE.Vector3(side * (1.6 + Math.floor(a / 2) * 2.1), 0, DOCK_Z);
		group.position.copy(dock);
		group.rotation.y = side < 0 ? 0 : Math.PI;
		scene.add(group);
		return { group, deck, beacon, load, side, lane, dock, path: [], state: 'idle', line: -1, wait: 0, onArrive: null };
	});

	const go = (agv, points, onArrive) => {
		agv.path = points;
		agv.onArrive = onArrive;
	};

	function dispatch(agv) {
		let best = -1;
		let bestDist = Infinity;
		for (let i = 0; i < N; i++) {
			const l = lines[i];
			if (lineSide(i) !== agv.side || l.claimed >= 0 || l.count < CASES_PER_PALLET) continue;
			const d = Math.abs(lineZ(i) - agv.group.position.z);
			if (d < bestDist) {
				bestDist = d;
				best = i;
			}
		}
		if (best < 0) return;
		const z = lineZ(best);
		const pick = toWorld(best, PALLET_X, 0, 0);
		lines[best].claimed = agvs.indexOf(agv);
		agv.line = best;
		agv.state = 'toPick';
		const p = agv.group.position;
		go(agv, [new THREE.Vector3(agv.lane, 0, p.z), new THREE.Vector3(agv.lane, 0, z), new THREE.Vector3(pick.x, 0, z)], () => {
			agv.state = 'lifting';
			agv.wait = 0.8;
		});
	}

	function stepAgv(agv, dt) {
		if (agv.state === 'idle') return dispatch(agv);
		if (agv.state === 'lifting' || agv.state === 'dropping') {
			agv.wait -= dt;
			const lifting = agv.state === 'lifting';
			agv.deck.position.y = 0.3 + (lifting ? 1 - agv.wait / 0.8 : agv.wait / 0.8) * 0.12;
			if (agv.wait > 0) return;
			if (lifting) {
				const line = lines[agv.line];
				line.pallet = false;
				line.count = 0;
				line.timer = 0;
				agv.load.visible = true;
				agv.state = 'toDock';
				const z = lineZ(agv.line);
				go(
					agv,
					[
						new THREE.Vector3(agv.lane, 0, z),
						new THREE.Vector3(agv.lane, 0, DOCK_Z + 4),
						agv.dock.clone()
					],
					() => {
						agv.state = 'dropping';
						agv.wait = 0.8;
					}
				);
			} else {
				agv.load.visible = false;
				agv.state = 'idle';
			}
			return;
		}

		// driving
		const target = agv.path[0];
		if (!target) return agv.onArrive?.();
		const pos = agv.group.position;
		const to = new THREE.Vector3().subVectors(target, pos);
		const dist = to.length();
		const step = AGV_SPEED * dt;
		const wantYaw = Math.atan2(-to.z, to.x);
		let dyaw = wantYaw - agv.group.rotation.y;
		dyaw = Math.atan2(Math.sin(dyaw), Math.cos(dyaw));
		agv.group.rotation.y += dyaw * Math.min(1, dt * 10);
		if (Math.abs(dyaw) > 0.6 && dist > 0.2) return; // turn in place before driving
		if (dist <= step) {
			pos.copy(target);
			agv.path.shift();
			// leaving the cell: a fresh empty pallet drops onto the stand
			if (agv.state === 'toDock' && agv.line >= 0 && agv.path.length === 2) {
				const line = lines[agv.line];
				line.pallet = true;
				line.claimed = -1;
				agv.line = -1;
			}
			if (!agv.path.length) agv.onArrive?.();
		} else {
			pos.addScaledVector(to, step / dist);
		}
	}

	// ---- Per-frame instance updates ----
	const m4 = new THREE.Matrix4();
	const q = new THREE.Quaternion();
	const yAxis = new THREE.Vector3(0, 1, 0);
	const zAxis = new THREE.Vector3(0, 0, 1);
	const one = new THREE.Vector3(1, 1, 1);
	const v = new THREE.Vector3();
	// palletizer arm swings between the conveyor end and the pallet
	const ARM_PIVOT = [26.2, 1.75, -1.5];
	const angleTo = (x, z) => Math.atan2(-(z - ARM_PIVOT[2]), x - ARM_PIVOT[0]);
	const ARM_CONVEYOR = angleTo(25.4, 0);
	const ARM_PALLET = angleTo(PALLET_X, 0);
	const ARM_OFFSET = at(0.95, 0, 0);

	function updateInstances(time) {
		for (let i = 0; i < N; i++) {
			const L = lineMatrices[i];
			const line = lines[i];
			const running = line.count < CASES_PER_PALLET && line.pallet;

			// unwind roll
			q.setFromAxisAngle(zAxis, -time * 1.5);
			m4.compose(v.set(1, 1.9, 0), q, one);
			rolls.setMatrixAt(i, tmp.multiplyMatrices(L, m4));

			// conveyor flow
			for (const seg of SEGMENTS) {
				const len = seg.to - seg.from;
				const mesh = flow[seg.kind];
				for (let n = 0; n < seg.count; n++) {
					const u = (time * BELT_SPEED / len + n / seg.count + i * 0.137) % 1;
					const h = seg.kind === 'case' ? 0.225 : seg.kind === 'carton' ? 0.18 : 0.15;
					m4.makeTranslation(seg.from + u * len, BELT_Y + h, 0);
					mesh.setMatrixAt(i * seg.count + n, tmp.multiplyMatrices(L, m4));
				}
			}

			// palletizer arm
			const phase = line.placing || (running && line.timer < ARM_SWING) ? Math.min(1, line.timer / ARM_SWING) : 0;
			const swing = phase < 0.5 ? ease(phase * 2) : ease((1 - phase) * 2);
			const angle = ARM_CONVEYOR + (ARM_PALLET - ARM_CONVEYOR) * swing;
			q.setFromAxisAngle(yAxis, angle);
			m4.compose(v.set(...ARM_PIVOT), q, one).multiply(ARM_OFFSET);
			arms.setMatrixAt(i, tmp.multiplyMatrices(L, m4));

			// pallet + stacked cases on the stand
			pallets.setMatrixAt(i, line.pallet ? tmp.multiplyMatrices(L, m4.makeTranslation(PALLET_X, 0.43, 0)) : hidden);
			for (let c = 0; c < CASES_PER_PALLET; c++) {
				const [dx, dy, dz] = stackOffsets[c];
				stacks.setMatrixAt(
					i * CASES_PER_PALLET + c,
					line.pallet && c < line.count
						? tmp.multiplyMatrices(L, m4.makeTranslation(PALLET_X + dx, 0.43 + dy, dz))
						: hidden
				);
			}
		}
		for (const m of [rolls, arms, pallets, stacks, ...Object.values(flow)]) m.instanceMatrix.needsUpdate = true;
	}

	function stepLines(dt) {
		for (const line of lines) {
			if (!line.pallet || line.count >= CASES_PER_PALLET) continue;
			line.timer += dt;
			if (line.timer >= line.interval) {
				line.timer -= line.interval;
				line.placing = true;
			}
			// the case lands when the arm reaches the pallet, halfway through its swing
			if (line.placing && line.timer >= ARM_SWING / 2) {
				line.placing = false;
				line.count++;
			}
		}
	}

	// ---- Camera views ----
	let fly = null;
	function flyTo(position, target, duration = 1.3) {
		if (reducedMotion || duration === 0) {
			camera.position.copy(position);
			controls.target.copy(target);
			fly = null;
			return;
		}
		fly = {
			fromPos: camera.position.clone(),
			fromTarget: controls.target.clone(),
			toPos: position,
			toTarget: target,
			t: 0,
			duration
		};
	}
	controls.addEventListener('start', () => (fly = null));

	// Distance at which a w×h area fills the part of the canvas the HUD leaves open
	function fitDistance(w, h) {
		const { tanH, tanV } = openTan();
		return Math.max(w / 2 / tanH, h / 2 / tanV);
	}

	const portrait = () => openTan().tanH < openTan().tanV;

	// Overview: the wall boards with the first rows of lines in front
	function homeView() {
		const narrow = portrait();
		const target = new THREE.Vector3(narrow ? -7 : 0.5, 5, WALL_Z + 6);
		const dist = fitDistance(narrow ? 28 : 46, 16);
		const dir = new THREE.Vector3(0, 0.33, 1).normalize();
		return { position: target.clone().addScaledVector(dir, dist), target };
	}

	// Straight-on view for reading the boards
	function wallView() {
		const narrow = portrait();
		const target = new THREE.Vector3(narrow ? -7 : 0.3, 8, WALL_Z);
		const dist = fitDistance(narrow ? 27 : 44, 14) * 1.04;
		return { position: new THREE.Vector3(target.x, 8.6, WALL_Z + dist), target };
	}

	function lineView(i) {
		const c = lineCenter(i);
		const side = lineSide(i);
		const target = new THREE.Vector3(c.x, 1.2, c.z);
		const dist = fitDistance(30, 9) * 0.95;
		const dir = new THREE.Vector3(-side * 0.25, 0.6, 0.8).normalize();
		return { position: target.clone().addScaledVector(dir, dist), target };
	}

	// keep the camera over the floor
	const bounds = { minX: -OUTER - 4, maxX: OUTER + 4, minZ: WALL_Z + 1, maxZ: lastZ + 12 };
	function clampTarget() {
		const t = controls.target;
		t.x = THREE.MathUtils.clamp(t.x, bounds.minX, bounds.maxX);
		t.z = THREE.MathUtils.clamp(t.z, bounds.minZ, bounds.maxZ);
		t.y = THREE.MathUtils.clamp(t.y, 0, 10);
		if (camera.position.z < WALL_Z + 1) camera.position.z = WALL_Z + 1;
	}

	// ---- Picking ----
	const raycaster = new THREE.Raycaster();
	raycaster.layers.enable(1);
	const pointer = new THREE.Vector2();
	let hovered = -1;
	let selected = -1;

	function pick(clientX, clientY) {
		const rect = renderer.domElement.getBoundingClientRect();
		pointer.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
		raycaster.setFromCamera(pointer, camera);
		const hits = raycaster.intersectObjects([hitBoxes, ...boards], false);
		if (!hits.length) return { line: -1, wall: false };
		const hit = hits[0];
		return hit.object === hitBoxes ? { line: hit.instanceId, wall: false } : { line: -1, wall: true };
	}

	let downAt = null;
	const el = renderer.domElement;
	const onPointerDown = (e) => (downAt = [e.clientX, e.clientY]);
	const onPointerMove = (e) => {
		if (e.pointerType !== 'mouse') return;
		const { line } = pick(e.clientX, e.clientY);
		if (line !== hovered) {
			hovered = line;
			placePad(hoverPad, line === selected ? -1 : line);
			el.style.cursor = line >= 0 ? 'pointer' : '';
		}
		onHover?.(line, e.clientX, e.clientY);
	};
	const onPointerLeave = () => {
		hovered = -1;
		placePad(hoverPad, -1);
		onHover?.(-1);
	};
	const onPointerUp = (e) => {
		if (!downAt) return;
		const moved = Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]);
		downAt = null;
		if (moved > 6) return;
		const { line, wall } = pick(e.clientX, e.clientY);
		if (line >= 0) onSelect?.(line);
		else if (wall) api.wall();
	};
	el.addEventListener('pointerdown', onPointerDown);
	el.addEventListener('pointermove', onPointerMove);
	el.addEventListener('pointerleave', onPointerLeave);
	el.addEventListener('pointerup', onPointerUp);

	// ---- Theme ----
	function setTheme() {
		const css = getComputedStyle(document.documentElement);
		const get = (name, fallback) => css.getPropertyValue(name).trim() || fallback;
		const bg = get('--bg', '#ecebe6');
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

	// ---- Resize / view insets / visibility / loop ----
	// HUD panels cover parts of the canvas. Widen the virtual frustum by the
	// covered amount and crop it, so the camera target lands in the open area.
	// The full frustum's FOV is scaled up so the visible canvas keeps the base FOV.
	const BASE_TAN = Math.tan(THREE.MathUtils.degToRad(25));
	let insets = { left: 0, right: 0, bottom: 0 };
	// tan of the half-angles spanned by the area not covered by HUD panels
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

	let visible = true;
	const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
	io.observe(container);

	const home = homeView();
	camera.position.copy(home.position);
	controls.target.copy(home.target);
	updateInstances(0);

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
				stepAgv(agv, dt);
				agv.beacon.visible = agv.state === 'idle' || Math.floor(simTime * 3) % 2 === 0;
			}
			updateInstances(simTime);
		}

		if (fly) {
			fly.t = Math.min(1, fly.t + dt / fly.duration);
			const k = ease(fly.t);
			camera.position.lerpVectors(fly.fromPos, fly.toPos, k);
			controls.target.lerpVectors(fly.fromTarget, fly.toTarget, k);
			if (fly.t >= 1) fly = null;
		}
		controls.update();
		clampTarget();
		renderer.render(scene, camera);
	}
	frame();

	const api = {
		select(i) {
			selected = i;
			placePad(selectPad, i);
			if (i === hovered) placePad(hoverPad, -1);
			if (i >= 0) {
				const view = lineView(i);
				flyTo(view.position, view.target);
			}
		},
		home() {
			const view = homeView();
			flyTo(view.position, view.target);
		},
		wall() {
			const view = wallView();
			flyTo(view.position, view.target);
		},
		setTheme,
		debug: () => ({
			agvs: agvs.map((a) => ({ state: a.state, line: a.line, x: +a.group.position.x.toFixed(1), z: +a.group.position.z.toFixed(1), path: a.path.length })),
			ready: lines.filter((l) => l.count >= CASES_PER_PALLET).length
		}),
		setInsets(next) {
			insets = { left: 0, right: 0, bottom: 0, ...next };
			resize();
		},
		destroy() {
			cancelAnimationFrame(raf);
			ro.disconnect();
			io.disconnect();
			el.removeEventListener('pointerdown', onPointerDown);
			el.removeEventListener('pointermove', onPointerMove);
			el.removeEventListener('pointerleave', onPointerLeave);
			el.removeEventListener('pointerup', onPointerUp);
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
	return api;
}
