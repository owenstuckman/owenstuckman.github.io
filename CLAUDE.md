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
```

## Architecture

**Framework:** SvelteKit with static adapter for GitHub Pages deployment

**Pages:** `/` (about), `/projects` (current and past projects), and `/blog` (password protected, see `docs/blog.md`). There is no header or footer. `Dock.svelte` is the minimal nav: an AGV parks under the active station, plus the light/default/dark `ThemeSwitch`.

**Factory (about page):** `src/lib/factory/scene.js` builds a three.js factory floor (lazy-loaded from `Factory.svelte`). The about info is drawn onto the back wall (`signage.js`, content in `src/lib/about.js`). Every project in `projects.json` becomes a production line: unwind → converter → cartoner → casepacker → palletizer, with AGVs carrying full pallets to the dock. Machine parts are InstancedMeshes shared across all lines. The HUD tells the scene which parts of the canvas it covers (`setInsets`) so camera views frame the open area.

**Projects page:** list view (default, searchable) or grid view (infinite scroll). One `ProjectDialog`; `/projects#<slug>` opens a project directly. Slugs and line codes come from `src/lib/projects.js`.

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

## Configuration

- `svelte.config.js` - SvelteKit config with mdsvex and rehype plugins (slug, autolink-headings)
- `vite.config.js` - Vite build configuration
- Navigation items configured in `src/lib/config.js`
