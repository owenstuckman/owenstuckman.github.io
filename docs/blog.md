# Blog

## How to add a post

Drop a `.md` file into `src/lib/posts/`. That's it — it will automatically appear on `/blog` and be routable at `/blog/<filename-without-extension>`.

### Frontmatter

Every post should start with a YAML frontmatter block:

```md
---
title: My Post Title
date: 2026-02-24
---

Your content here...
```

| Field   | Required | Description |
|---------|----------|-------------|
| `title` | Yes      | Displayed as the page `<h1>` and in the blog index list |
| `date`  | Yes      | Used to sort posts (newest first). Format: `YYYY-MM-DD` |

If `title` is omitted, the filename is used as a fallback. If `date` is omitted, the post won't sort correctly.

### Naming and URLs

The filename becomes the URL slug:

| File | URL |
|------|-----|
| `src/lib/posts/my-first-post.md` | `/blog/my-first-post` |
| `src/lib/posts/homelab-update.md` | `/blog/homelab-update` |

Use lowercase and hyphens — no spaces.

### Writing content

Posts are processed by [mdsvex](https://mdsvex.pelte.dev/), so you can use:

- Standard markdown (headings, bold, lists, links, images, tables, code blocks)
- Syntax-highlighted fenced code blocks with a language tag:
  ````md
  ```python
  def hello():
      print("world")
  ```
  ````
- Svelte components imported in a `<script>` block at the top of the file

### Example post

`src/lib/posts/homelab-v2.md`:

```md
---
title: HomeLab v2
date: 2026-03-01
---

Added a second node and set up a basic Tailscale mesh...

## What changed

- Migrated n8n to a dedicated container
- Set up automatic backups to Backblaze B2
```

This will appear at `/blog/homelab-v2`.

## How the blog works (internals)

- **Index page** (`src/routes/blog/+page.svelte`): uses `import.meta.glob` to scan all `.md` files in `src/lib/posts/` at build time, reads their frontmatter, and renders a sorted list.
- **Post page** (`src/routes/blog/[slug]/+page.ts` + `+page.svelte`): loads the matching `.md` file by slug, renders it as a Svelte component (mdsvex compiles each `.md` to a component), and displays the frontmatter title/date above the content.
- The site is fully static — posts are prerendered at build time by `entries()` in `+page.ts`.
