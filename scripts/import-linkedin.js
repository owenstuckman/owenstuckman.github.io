/**
 * Import work history from a LinkedIn data export.
 *
 *   npm run import:linkedin -- <Positions.csv | export folder>
 *
 * Get the export at LinkedIn → Settings → Data privacy → Get a copy of your
 * data (make sure "Positions" is included).
 *
 *   Profile.csv   → src/jsons/profile.json (headline)
 *   Positions.csv → src/jsons/experience.json
 *
 * Which projects light up for each job comes from
 * src/jsons/experience-links.json, so re-importing never loses those links.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const OUT = path.join(root, 'src/jsons/experience.json');
const LINKS = path.join(root, 'src/jsons/experience-links.json');
const PROJECTS = path.join(root, 'src/jsons/projects.json');
const PROFILE = path.join(root, 'src/jsons/profile.json');

function fail(msg) {
	console.error(`\n✖ ${msg}\n`);
	process.exit(1);
}

// ---- find the CSVs ----
const arg = process.argv[2];
if (!arg) fail('Pass the unzipped export folder (or a Positions.csv / Profile.csv).');
const input = path.resolve(arg);
if (!fs.existsSync(input)) fail(`Not found: ${input}`);
if (input.toLowerCase().endsWith('.zip') && !fs.statSync(input).isDirectory()) fail('Unzip the export first, then pass the folder.');
// "Positions.csv", or a browser-renamed copy like "Positions (1).csv"
const matches = (file, stem) => {
	const f = file.toLowerCase();
	return f.startsWith(stem) && f.endsWith('.csv');
};
const find = (stem) => {
	if (!fs.statSync(input).isDirectory()) return matches(path.basename(input), stem) ? input : null;
	const hit = fs.readdirSync(input).find((f) => matches(f, stem));
	return hit ? path.join(input, hit) : null;
};
const profilePath = find('profile');
const csvPath = find('positions');
if (!profilePath && !csvPath) fail(`No Profile.csv or Positions.csv in ${input}.`);

// ---- CSV (quoted fields, embedded commas and newlines) ----
function parseCsv(text) {
	const rows = [];
	let row = [];
	let field = '';
	let quoted = false;
	text = text.replace(/^﻿/, '');
	for (let i = 0; i < text.length; i++) {
		const c = text[i];
		if (quoted) {
			if (c === '"' && text[i + 1] === '"') (field += '"'), i++;
			else if (c === '"') quoted = false;
			else field += c;
		} else if (c === '"') quoted = true;
		else if (c === ',') row.push(field), (field = '');
		else if (c === '\n' || c === '\r') {
			if (c === '\r' && text[i + 1] === '\n') i++;
			row.push(field);
			if (row.some((f) => f !== '')) rows.push(row);
			(row = []), (field = '');
		} else field += c;
	}
	row.push(field);
	if (row.some((f) => f !== '')) rows.push(row);
	const [header, ...body] = rows;
	return body.map((r) => Object.fromEntries(header.map((h, i) => [h.trim(), (r[i] ?? '').trim()])));
}

const MONTHS = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
// "Jun 2024" | "2024" | "06/2024" → "2024-06"
function toYm(s) {
	if (!s) return null;
	let m = s.match(/^([A-Za-z]{3})[a-z]*\.? (\d{4})$/);
	if (m && MONTHS[m[1].toLowerCase()]) return `${m[2]}-${String(MONTHS[m[1].toLowerCase()]).padStart(2, '0')}`;
	m = s.match(/^(\d{1,2})\/(\d{4})$/);
	if (m) return `${m[2]}-${m[1].padStart(2, '0')}`;
	m = s.match(/^(\d{4})$/);
	if (m) return `${m[1]}-01`;
	console.warn(`  ! couldn't read the date "${s}"`);
	return null;
}

// Description → a summary paragraph plus bullet lines (-, •, *, –)
function splitDescription(text) {
	const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
	const bullets = [];
	const summary = [];
	for (const l of lines) {
		const b = l.match(/^[-•*–·]\s*(.+)$/);
		if (b) bullets.push(b[1]);
		else summary.push(l);
	}
	return { summary: summary.join(' '), bullets };
}

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const months = (ym) => {
	const [y, m] = ym.split('-').map(Number);
	return y * 12 + m;
};

// ---- profile ----
if (profilePath) {
	const [p] = parseCsv(fs.readFileSync(profilePath, 'utf8'));
	// only what the site shows: this repo is public, so contact details and location stay out
	const profile = { headline: p?.['Headline'] ?? '', importedOn: new Date().toISOString().slice(0, 10) };
	fs.writeFileSync(PROFILE, JSON.stringify(profile, null, 2) + '\n');
	console.log(`\n✔ Profile → src/jsons/profile.json\n  Headline: ${profile.headline}`);
}

if (!csvPath) {
	console.log(
		'\n  No Positions.csv, so work history was left as is.\n  Request the export with "Positions" selected to import jobs.\n'
	);
	process.exit(0);
}

// ---- positions ----
const positions = parseCsv(fs.readFileSync(csvPath, 'utf8'));
if (!positions.length) fail('Positions.csv has no rows.');
const links = fs.existsSync(LINKS) ? JSON.parse(fs.readFileSync(LINKS, 'utf8')).links ?? [] : [];
const slugs = new Set(
	JSON.parse(fs.readFileSync(PROJECTS, 'utf8')).projects.map((p) =>
		p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
	)
);

const used = new Set();
const experience = positions.map((p) => {
	const org = p['Company Name'];
	const start = toYm(p['Started On']);
	const end = p['Finished On'] ? toYm(p['Finished On']) : 'present';
	const { summary, bullets } = splitDescription(p['Description'] ?? '');

	// link: same org, closest start date within 6 months (or a link with no start)
	let best = null;
	for (const [i, l] of links.entries()) {
		const a = norm(l.org);
		const b = norm(org);
		if (!(a === b || a.includes(b) || b.includes(a))) continue;
		const d = l.start && start ? Math.abs(months(l.start) - months(start)) : l.start ? Infinity : 0;
		if (d <= 6 && (!best || d < best.d)) best = { i, d };
	}
	if (best) used.add(best.i);
	const projects = best ? links[best.i].projects.filter((s) => slugs.has(s) || console.warn(`  ! unknown project slug "${s}"`)) : [];

	return {
		org,
		role: p['Title'] || null,
		start,
		end,
		...(p['Location'] ? { location: p['Location'] } : {}),
		summary,
		bullets,
		projects
	};
}).filter((e) => e.start);

fs.writeFileSync(
	OUT,
	JSON.stringify(
		{
			draft: false,
			note: `Imported from LinkedIn (${path.basename(csvPath)}) by scripts/import-linkedin.js on ${new Date().toISOString().slice(0, 10)}. Edit project links in experience-links.json, then re-import.`,
			experience
		},
		null,
		2
	) + '\n'
);

console.log(`\n✔ Imported ${experience.length} positions → src/jsons/experience.json\n`);
for (const e of experience)
	console.log(`  ${e.start} – ${e.end.padEnd(7)}  ${e.org} · ${e.role ?? '—'}  (${e.projects.length} linked projects)`);
const unlinked = experience.filter((e) => !e.projects.length);
if (unlinked.length)
	console.log(`\n  No projects linked for: ${unlinked.map((e) => e.org).join(', ')}\n  Add them in src/jsons/experience-links.json and re-run.`);
const stale = links.filter((_, i) => !used.has(i));
if (stale.length) console.log(`\n  Links that matched no position: ${stale.map((l) => `${l.org} (${l.start ?? 'any'})`).join(', ')}`);
console.log('');
