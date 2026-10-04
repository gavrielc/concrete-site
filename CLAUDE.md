# Content (Sanity CMS)

Clients, team members, media coverage (results) and open positions are managed in **Sanity**, not in this repo.

- Studio (where the team edits content): https://concrete-media.sanity.studio/
- Sanity project ID `o458gxs0`, dataset `production`
- Studio source code: `studio/` (schemas in `studio/schemaTypes/`)

To add or change a client, team member, coverage item or open position, edit it in the Studio. Do not add content to the code.

## How the site gets the content

`src/lib/cms.mjs` is a Vite plugin that queries Sanity once per build and exposes the data as virtual modules:

| Module | Used by |
|---|---|
| `virtual:cms/clients` | `src/components/Clients.jsx` |
| `virtual:cms/team` | `src/pages/team.astro` |
| `virtual:cms/results` | `src/components/results/index.jsx` (Coverage page) |
| `virtual:cms/homepage-results` | `src/pages/index.astro` (4 newest coverage items with "Show on homepage") |
| `virtual:cms/positions` | `src/pages/join-us.astro` (open positions with "Show on website" on) |

Publishing in Sanity triggers a Netlify rebuild (Sanity webhook → Netlify build hook). In local dev, restart the dev server to pick up new content.

## Coverage content model

- **Type**: Article or Podcast episode. Articles reference a **Publication** (name + logo, uploaded once and reused).
- **Categories**: `highlights`, `AI & ML`, `saas`, `dev`, `security`, `podcasts` (plus `fintech`, `medtech`, `hr`, `deeptech`). The Coverage page shows the Highlights and Podcasts tabs.
- Items are sorted newest first by date. Podcasts are listed after articles.

## Studio development

```
cd studio
npm install
npm run dev      # local Studio at http://localhost:3333
npm run deploy   # publish Studio changes to concrete-media.sanity.studio
```

`studio/migration/` holds the one-time import of the content that used to be hard-coded in this repo (the original files are in git history before the Sanity migration).

## Local preview

`astro.config.mjs` pins the dev server to **port 4321** with `strictPort: true` (Astro will not silently move to 4322/4323).

From the project root, prefer **yarn** (this repo has `yarn.lock`):

- **`yarn dev`** — frees ports 4321–4323, then starts Astro (default; use this for Cursor/browser preview)
- **`yarn dev:clean`** — same as `yarn dev`
- **`yarn dev:local`** — `astro dev` only (no port cleanup; use if you manage ports yourself)

In Cursor/VS Code: **Terminal → Run Task → Start Dev Server** (`.vscode/tasks.json`), or run the **Development server (port 4321)** launch config.

Open **http://localhost:4321** and keep the terminal running. `ERR_CONNECTION_REFUSED` means nothing is listening on 4321 (server stopped or never started). Start `yarn dev` again.

Production build preview (after `build`): `yarn preview:local` or `npm run preview:local`.
