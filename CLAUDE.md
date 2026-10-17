# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio website built with SvelteKit and mdsvex (markdown + Svelte). Deployed to GitHub Pages as a static site.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Build static site to build/
npm run preview  # Preview production build
npm run lint     # Check formatting and linting
npm run format   # Auto-format code with Prettier
npm run import:linkedin -- <export folder or Positions.csv>   # Rebuild experience.json from a LinkedIn data export
```

## Architecture

**Framework:** SvelteKit with static adapter for GitHub Pages deployment

**Pages:** `/` (about), `/projects` (current and past projects), and `/blog` (password protected, see `docs/blog.md`). There is no header or footer. `Dock.svelte` is the minimal nav: an AGV parks under the active station, plus the light/default/dark `ThemeSwitch`.

**Factory (about page):** `src/lib/factory/scene.js` builds a three.js factory floor (lazy-loaded from `Factory.svelte`). The about info is drawn onto the back wall (`signage.js`, content in `src/lib/about.js`). Each project's `status` in `projects.json` places it: `running` → a working production line, `construction` → a half-built line (current projects), anything else → a labeled pallet in the warehouse racks. Each project's `phases` in `projects.json` become its stations (on a line) or pallets (in the warehouse); `recipes.js` only picks the machine type/color per phase and the output product, and products are defined in `products.js`. Work history lives in `src/jsons/experience.json`, generated from a LinkedIn export by `scripts/import-linkedin.js` (project links per job come from `src/jsons/experience-links.json`, matched by company + start date) and is drawn as a timeline rail on the wall; selecting a job lights up its projects. AGVs carry full pallets from the lines to the warehouse. Controls are `MapControls`: drag pans, right-drag rotates. The HUD tells the scene which parts of the canvas it covers (`setInsets`) so camera views frame the open area.

**Projects page:** card grid (default, infinite scroll, grayscale until hover) or list view, both searchable. "On the line now" lists `construction` projects. One `ProjectDialog`; `/projects#<slug>` opens a project directly. Slugs and line codes come from `src/lib/projects.js`.

**Content System:** mdsvex preprocessor allows markdown files (`.md`) to be used as Svelte components/pages. Blog posts live in `src/lib/posts/*.md` and are encrypted at build time, so the build needs `BLOG_PASSWORD` set.

**Key directories:**
- `src/routes/` - Page routes
- `src/lib/components/` - Reusable Svelte components
- `src/jsons/` - Project data (`current_projects.json`, `projects.json`)
- `src/lib/config.js` - Site metadata and navigation configuration
- `src/app.css` - Global styles and theme tokens. The `data-theme` attribute on `<html>` overrides `prefers-color-scheme`
- `src/lib/actions/` - `lazyImage` (fade images in over a skeleton) and `infiniteScroll` (IntersectionObserver sentinel)
- `old-site/` - Archived previous version (Vercel/Tailwind setup, not active)

**Data flow:** Project information is stored in JSON files and rendered by `ProjectCard.svelte` (past projects, `<dialog>` modal) and `CurrentCard.svelte` (current projects).

**Deployment:** Pushes to `main` trigger GitHub Actions workflow that builds and deploys to GitHub Pages. The build needs the `BLOG_PASSWORD` repo secret.

**LinkedIn updates:** uploading `Positions.csv` to `linkedin/` triggers `.github/workflows/import-linkedin.yml`, which rewrites `experience.json`, deletes the CSV, commits, and the deploy workflow runs after it (via `workflow_run`, since bot commits don't trigger pushes). Only Positions is imported because the repo is public. See `linkedin/README.md`. LinkedIn's API has no legal way for a US member to read their own positions (Member Data Portability is EEA/Switzerland only).

## Configuration

- `svelte.config.js` - SvelteKit config with mdsvex and rehype plugins (slug, autolink-headings)
- `vite.config.js` - Vite build configuration
- Navigation items configured in `src/lib/config.js`
