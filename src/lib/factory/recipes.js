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
 * `detail` is shown when someone clicks the station.
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
			{
				kind: 'press',
				label: 'Scrape · Selenium',
				color: C.slate,
				detail:
					'Articles are pulled from Wikipedia, Grokipedia, Britannica, Citizendium, and New World Encyclopedia by a Selenium scraper that runs as its own Dockerized service, keeping the main app lightweight.'
			},
			{
				kind: 'tank',
				label: 'Supabase',
				color: C.green,
				detail: 'Articles, matchups, votes, and ratings are stored in Supabase Postgres.'
			},
			{
				kind: 'arch',
				label: 'Blind vote',
				color: C.purple,
				detail:
					'Visitors compare two articles on the same topic side by side without knowing which encyclopedia wrote which, then pick the better one.'
			},
			{
				kind: 'screen',
				label: 'Glicko-2 rank',
				color: C.blue,
				detail:
					'Each vote updates a Glicko-2 rating (the system used for chess rankings), producing a real-time leaderboard of which sources people actually prefer.'
			},
			{
				kind: 'robot',
				label: 'Blend · Grok',
				color: C.orange,
				detail: "The Knowledge Blender uses xAI's Grok to synthesize the best parts of several sources into a single article."
			}
		]
	},
	'hokie-cart-check-out': {
		product: 'cart',
		stations: [
			{
				kind: 'arch',
				label: 'Badge scan',
				color: C.orange,
				detail:
					"Staff scan a student's Hokie Passport with any keyboard-wedge barcode scanner. The ledger decides what the scan means: return a cart, pick from a short list, or open a prefilled check-out form."
			},
			{
				kind: 'machine',
				label: 'Cart pick',
				color: C.red,
				detail: "Carts are picked from a live list of only what's actually available; returning students get their details prefilled."
			},
			{
				kind: 'tank',
				label: 'Ledger',
				color: C.slate,
				detail:
					'Every action lands in an append-only Postgres ledger that exports to CSV. Development runs on embedded PGlite; production deploys to Vercel.'
			}
		]
	},
	orbit: {
		product: 'coin',
		stations: [
			{
				kind: 'machine',
				label: 'Task intake',
				color: C.blue,
				detail:
					'Work enters on a Kanban board with urgency multipliers, with separate views for sales, project managers, QC reviewers, employees, and contractors.'
			},
			{
				kind: 'screen',
				label: 'QC model',
				color: C.purple,
				detail:
					'OrbitQCML predicts first-pass QC approval from GitHub PR data with a Random Forest classifier served from a FastAPI endpoint.'
			},
			{
				kind: 'oven',
				label: 'Monte Carlo',
				color: C.orange,
				detail:
					'Orbit-MonteCarlo simulations tune the confidence-scaling and geometric-decay parameters behind the QC payout system.'
			},
			{
				kind: 'press',
				label: 'Payout',
				color: C.teal,
				detail:
					'Pay mixes base salary with task-based compensation, splits rewards with Shapley values, and generates contracts with e-signatures. The idea: capability × motivation = performance.'
			}
		]
	},
	'archimedes-snipe-bot': {
		product: 'frame',
		stations: [
			{
				kind: 'arch',
				label: 'Snipe',
				color: C.red,
				detail:
					"Members snap photos of each other without being noticed and post them in a target channel, a semester-long team-building game."
			},
			{
				kind: 'screen',
				label: 'Discord.js',
				color: C.purple,
				detail:
					'The bot tallies snipes and serves a leaderboard and the rules. Totals are recalculated and cached on each restart, so it works without a database or 100% uptime.'
			}
		]
	},
	'homelab-v1': {
		product: 'container',
		stations: [
			{
				kind: 'oven',
				label: 'Ubuntu server',
				color: C.orange,
				detail:
					'An old laptop converted into an Ubuntu server with SSH and basic hardening, used for remote development in VS Code and as spare compute for training models.'
			},
			{
				kind: 'tank',
				label: 'Supabase',
				color: C.green,
				detail: 'A self-hosted Supabase instance, with Webmin keeping an eye on server status.'
			},
			{
				kind: 'robot',
				label: 'n8n flows',
				color: C.red,
				detail: 'A self-hosted n8n instance for automations, alongside containers and experiments like xRDP dev setups.'
			}
		]
	},
	'archimedes-website': {
		product: 'page',
		stations: [
			{
				kind: 'press',
				label: 'Svelte build',
				color: C.orange,
				detail: 'Rebuilt the Archimedes Society site from Squarespace into a fully custom Svelte + TypeScript site.'
			},
			{
				kind: 'machine',
				label: 'Email.js',
				color: C.teal,
				detail: 'EmailJS restores Squarespace features like the contact form, for outreach to sponsors and partners.'
			},
			{
				kind: 'arch',
				label: 'Vercel deploy',
				color: C.slate,
				detail: 'Deploys run through Vercel, and new features keep shipping.'
			}
		]
	},
	luma: {
		product: 'folder',
		stations: [
			{
				kind: 'machine',
				label: 'Apply',
				color: C.orange,
				detail: 'Applicants apply through a fully custom ATS built for the Archimedes Society at Virginia Tech.'
			},
			{
				kind: 'arch',
				label: 'Screen',
				color: C.blue,
				detail: 'Recruiters review applicants with the usual ATS tools, designed around cyclic recruiting rather than rolling hiring.'
			},
			{
				kind: 'screen',
				label: 'Schedule',
				color: C.green,
				detail: 'A scheduling algorithm pairs recruiters with applicants for interviews, the main pain point LUMA was built to solve.'
			},
			{
				kind: 'press',
				label: 'Decide',
				color: C.purple,
				detail: 'Each recruiting cycle closes out with decisions, ready for the next cycle.'
			}
		]
	},
	'portfolio-website-revamp': {
		product: 'card',
		stations: [
			{
				kind: 'press',
				label: 'mdsvex',
				color: C.orange,
				detail: 'Content is written in Markdown and compiled into Svelte components with mdsvex.'
			},
			{
				kind: 'machine',
				label: 'SvelteKit',
				color: C.red,
				detail: 'SvelteKit renders the site with a responsive layout and dark/light themes (the floor you are standing on).'
			},
			{
				kind: 'arch',
				label: 'Pages deploy',
				color: C.slate,
				detail: 'Prerendered to static files and deployed to GitHub Pages on every push to main.'
			}
		]
	},
	workbenched: {
		product: 'folder',
		built: 2,
		stations: [
			{
				kind: 'tank',
				label: 'ActivityWatch',
				color: C.blue,
				detail: 'Activity is captured passively by ActivityWatch: windows, apps, and artifacts.'
			},
			{
				kind: 'screen',
				label: 'Infer project',
				color: C.purple,
				detail:
					'Each window and artifact is attributed to a project by rules, then previously seen artifacts, then LLM inference, with a confidence score; anything uncertain lands in a filing queue.'
			},
			{
				kind: 'machine',
				label: 'Work log',
				color: C.green,
				detail: 'Time, artifacts, tasks, and blockers are kept per project in an embedded Postgres, and the work log writes itself.'
			},
			{
				kind: 'robot',
				label: 'Focus',
				color: C.orange,
				detail: 'A HUD overlay sets the current project or task on demand and shows what to focus on now.'
			}
		]
	},
	'luma-v2': {
		product: 'folder',
		built: 3,
		stations: [
			{
				kind: 'machine',
				label: 'Form builder',
				color: C.orange,
				detail: 'A dynamic form builder lets each organization design its own application questionnaire.'
			},
			{
				kind: 'arch',
				label: 'Triage',
				color: C.blue,
				detail: 'A recruiter dashboard with filtering and bulk updates.'
			},
			{
				kind: 'screen',
				label: 'Schedule-X',
				color: C.green,
				detail: 'Calendar-based interview scheduling with Schedule-X. The original deployment scheduled 250+ interviews for 400+ applicants.'
			},
			{
				kind: 'robot',
				label: 'Multi-tenant',
				color: C.purple,
				detail: 'Refactoring into a multi-tenant platform with role-based access (Owner, Admin, Recruiter, Viewer) so any org can self-deploy.'
			},
			{
				kind: 'tank',
				label: 'Supabase',
				color: C.teal,
				detail: 'Supabase Postgres under every tenant; released under the MIT license.'
			}
		]
	}
};

const KIND_LENGTH = { machine: 3.6, tank: 3.2, press: 3, arch: 2.2, robot: 2.8, oven: 5.2, screen: 3 };
const FALLBACK_KINDS = ['machine', 'press', 'tank', 'screen', 'arch', 'robot'];
const FALLBACK_COLORS = Object.values(C);

// A project's parts, from its skills: at least two, at most five
function parts(project) {
	const skills = (project.skills ?? []).slice(0, 5);
	while (skills.length < 2) skills.push(skills.length ? 'Write-up' : 'Build');
	return skills;
}

/** The line layout for a project. Projects without a recipe get stations from their skills. */
export function recipeFor(project) {
	const r = RECIPES[project.slug] ?? {
		product: productFor(project),
		built: 1,
		stations: parts(project).map((skill, i) => ({
			kind: FALLBACK_KINDS[(project.index + i) % FALLBACK_KINDS.length],
			label: skill,
			color: FALLBACK_COLORS[(project.index + i) % FALLBACK_COLORS.length],
			detail:
				project.status === 'archived'
					? `The ${skill} side of ${project.title}, packed and shelved.`
					: `A stage built with ${skill}.`
		}))
	};
	return {
		product: r.product,
		built: project.status === 'construction' ? (r.built ?? 1) : r.stations.length,
		stations: r.stations.map((s, i) => ({
			...s,
			len: KIND_LENGTH[s.kind] ?? 3,
			built: project.status !== 'construction' || i < (r.built ?? 1)
		}))
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
