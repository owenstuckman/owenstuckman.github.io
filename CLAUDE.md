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

**Content System:** mdsvex preprocessor allows markdown files (`.md`) to be used as Svelte components/pages. Both `.svelte` and `.md` extensions are valid page routes.

**Key directories:**
- `src/routes/` - Page routes (markdown pages: `+page.md`)
- `src/lib/components/` - Reusable Svelte components
- `src/jsons/` - Project data (`current_projects.json`, `projects.json`)
- `src/lib/config.js` - Site metadata and navigation configuration
- `static/css/` - CSS stylesheets (vars, layout, typography)
- `old-site/` - Archived previous version (Vercel/Tailwind setup, not active)

**Data flow:** Project information is stored in JSON files and rendered by `ProjectCard.svelte` (past projects with modal view) and `CurrentCard.svelte` (current projects).

**Deployment:** Pushes to `main` trigger GitHub Actions workflow that builds and deploys to GitHub Pages.

## Configuration

- `svelte.config.js` - SvelteKit config with mdsvex and rehype plugins (slug, autolink-headings)
- `vite.config.js` - Vite build configuration
- Navigation items configured in `src/lib/config.js`
