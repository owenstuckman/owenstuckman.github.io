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

## Password protection

The blog is locked behind a password. Because the site is static, the lock is real encryption rather than a hidden page: at build time every post (and the post list) is rendered to HTML and encrypted with AES-256-GCM, using a key derived from the password with PBKDF2. Only ciphertext ships to the browser, and visitors decrypt it client-side after entering the password. The password is remembered for the browser session.

- The password comes from the `BLOG_PASSWORD` environment variable. In CI it is the `BLOG_PASSWORD` repository secret (Settings → Secrets and variables → Actions).
- `npm run build` **fails** if `BLOG_PASSWORD` is unset, so the blog is never published unprotected.
- `npm run dev` without it falls back to the password `dev`.
- To change the password, update the secret and redeploy.
- Lock screen text lives in `blogLockMessage` in `src/lib/config.js`.

Because posts are rendered to static HTML before encryption, Svelte components inside a post render but aren't interactive.

## How the blog works (internals)

- **`src/lib/server/posts.js`**: globs `src/lib/posts/*.md`, renders each post with `svelte/server`, and encrypts the results (`lockIndex`, `lockPost`).
- **`src/lib/vault.js`**: Web Crypto encrypt and decrypt, shared by the build (Node) and the browser.
- **Index page** (`src/routes/blog/+page.server.js` + `+page.svelte`): ships the encrypted post list.
- **Post page** (`src/routes/blog/[slug]/+page.server.js` + `+page.svelte`): ships one encrypted post. `entries()` prerenders every slug.
- **`src/lib/components/BlogLock.svelte`**: password prompt. Decrypts the payload and renders it.
