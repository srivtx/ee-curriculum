# Deployment Guide

This is a standard Next.js 16 app. It deploys to any Node-capable host with zero environment variables (all progress is browser-local via localStorage; no backend or database required).

**Estimated time to deploy:** 5 minutes on Vercel (recommended).

---

## Table of Contents
- [Option 1: Vercel (recommended)](#option-1-vercel-recommended)
- [Option 2: Netlify](#option-2-netlify)
- [Option 3: Cloudflare Pages](#option-3-cloudflare-pages)
- [Option 4: Self-hosted (Docker)](#option-4-self-hosted-docker)
- [Option 5: Static export (GitHub Pages / S3 / any static host)](#option-5-static-export-github-pages--s3--any-static-host)
- [Post-deploy checklist](#post-deploy-checklist)
- [Environment variables](#environment-variables)
- [Custom domain](#custom-domain)
- [Updating the PDF](#updating-the-pdf)
- [Troubleshooting](#troubleshooting)

---

## Option 1: Vercel (recommended)

Vercel is the company behind Next.js — deployment is one click and the free tier covers this project comfortably.

### Steps

1. **Push to GitHub.** This repo should already be at `github.com/srivtx/ee-curriculum`. If not, see the README.

2. **Import to Vercel.**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Sign in with GitHub
   - Click **Import** next to `srivtx/ee-curriculum`
   - Vercel auto-detects Next.js — accept the defaults

3. **Configure (optional).**
   - **Framework Preset:** Next.js (auto-detected)
   - **Build Command:** `next build` (auto-detected; do NOT use `bun run build` — it has post-build steps for standalone mode that aren't needed on Vercel)
   - **Output Directory:** leave empty (Vercel handles this)
   - **Install Command:** `bun install` (or `npm install` if you don't have bun in your PATH)
   - **Node.js Version:** 20.x (or newer)

4. **Click Deploy.** Build takes ~90 seconds. You'll get a `*.vercel.app` URL.

5. **(Optional) Custom domain.** See [Custom domain](#custom-domain) below.

### Why Vercel wins for this project
- Zero config — Next.js is first-class
- Edge network — Pyodide (10 MB) loads fast globally via CDN
- Free tier covers ~100 GB bandwidth/month (Pyodide is the main consumer)
- Automatic HTTPS
- Preview deployments on every PR

---

## Option 2: Netlify

### Steps

1. Push to GitHub (same as above).

2. Go to [app.netlify.com/start](https://app.netlify.com/start) and sign in with GitHub.

3. Select `srivtx/ee-curriculum`.

4. Configure:
   - **Base directory:** (leave empty)
   - **Build command:** `next build` (Netlify auto-detects Next.js via the `@netlify/plugin-nextjs` plugin)
   - **Publish directory:** (leave empty — the plugin handles it)
   - **Plugin:** `@netlify/plugin-nextjs` (auto-installed)

5. Click **Deploy site**.

### Notes
- Netlify's Next.js plugin is good but slightly behind Vercel in feature support. For this project (no ISR, no edge functions, no image optimization), it works perfectly.
- Free tier: 100 GB bandwidth/month, 300 build minutes/month.

---

## Option 3: Cloudflare Pages

Cloudflare Pages supports Next.js via the `@cloudflare/next-on-pages` adapter. This project uses only static features (no server actions, no edge runtime), so it converts cleanly.

### Steps

1. Push to GitHub.

2. Go to [pages.cloudflare.com](https://pages.cloudflare.com) and sign in.

3. **Create a project → Connect to Git → Select `srivtx/ee-curriculum`.**

4. Configure:
   - **Framework preset:** Next.js
   - **Build command:** `npx @cloudflare/next-on-pages`
   - **Build output directory:** `.vercel/output/static`
   - **Environment variables:** add `NEXT_VERSION = latest` (optional)

5. Click **Save and Deploy**.

### Notes
- Cloudflare's free tier is generous (unlimited bandwidth, unlimited requests).
- Pyodide loads from jsDelivr CDN, so it doesn't count against your Cloudflare quotas.
- Some Next.js features (notably Image Optimization with the default loader) don't work on Cloudflare — this project doesn't use them, so it's fine.

---

## Option 4: Self-hosted (Docker)

For air-gapped deployments, internal company training, or full control.

### Dockerfile

Create this at the repo root:

```dockerfile
# ── Build stage ──────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Install bun
RUN npm install -g bun

# Copy lockfile + package.json first for layer caching
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# Copy the rest and build
COPY . .
RUN bun run build

# ── Runtime stage ────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy standalone server + static + public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
```

> **Note:** The `bun run build` script in `package.json` already copies `.next/static` and `public/` into `.next/standalone/` for you, so the standalone output works out of the box. Verify by inspecting `.next/standalone/` after a local build.

### Build & run

```bash
# Build the image
docker build -t ee-curriculum .

# Run on port 3000
docker run -p 3000:3000 ee-curriculum

# Open http://localhost:3000
```

### Deploy to a VPS

```bash
# On the VPS
docker pull ghcr.io/srivtx/ee-curriculum:latest   # (after setting up GHCR)
docker run -d --restart unless-stopped \
  -p 80:3000 \
  --name ee-curriculum \
  ghcr.io/srivtx/ee-curriculum:latest

# Add a reverse proxy (Caddy / nginx) for HTTPS — see below
```

### Caddy reverse proxy (recommended for HTTPS)

```caddyfile
ee-curriculum.example.com {
    reverse_proxy localhost:3000
}
```

Caddy auto-provisions Let's Encrypt certs. Run `caddy run` and you're done.

---

## Option 5: Static export (GitHub Pages / S3 / any static host)

If you don't need server-side features, you can export the site as fully static files. This works for GitHub Pages, AWS S3 + CloudFront, nginx, or any static file host.

### Step 1: Configure Next.js for static export

Edit `next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  // basePath: '/ee-curriculum',  // uncomment for GitHub Pages project sites
};

export default nextConfig;
```

### Step 2: Build

```bash
bun run build
# Output goes to ./out/
```

### Step 3: Deploy

**GitHub Pages** (using `gh-pages` CLI):
```bash
bun add -d gh-pages
bunx gh-pages -d out
```

**AWS S3**:
```bash
aws s3 sync out/ s3://your-bucket-name/ --delete
```

**Any static host:** just upload the contents of `out/`.

### Caveats of static export
- All routes are pre-rendered. This project only uses `/` so it's fine.
- The Pyodide playground still works (it's pure client-side).
- The PDF download still works (it's a static file in `public/download/`).
- No server-side image optimization (we don't use any images that need it).

---

## Post-deploy checklist

After deploying, verify:

- [ ] **Homepage loads** — visit the deploy URL, see the curriculum hero with 11 phase cards
- [ ] **Dark mode toggle works** — top right button
- [ ] **Curriculum browser expands** — click Phase 0 → see 4 modules → click a module → see lessons
- [ ] **Lesson drawer opens** — click any lesson → right-side panel slides in with summary, takeaways, CS BRIDGE callout
- [ ] **Python playground works** — open a lesson with the "playground" badge (e.g., Phase 0 Module 1 Lesson 4 — Complex analysis), wait ~30 s for Pyodide to load, click **Run**, see output
- [ ] **Projects view works** — click "Projects" in nav, see all 52 projects, filter by difficulty
- [ ] **Checkpoints view works** — click "Checkpoints", pick a phase, see flashcards, click "Got it" / "Need review"
- [ ] **Dashboard works** — click "Dashboard", see KPIs and per-phase progress bars, log 5 hours to a phase, refresh page — value should persist
- [ ] **PDF download works** — click "Download full PDF curriculum" in footer, file downloads, opens in PDF viewer
- [ ] **Mobile responsive** — open on phone, layout collapses to single column, nav becomes hamburger or scrolls horizontally
- [ ] **Sticky footer** — on a short page (Dashboard), footer sticks to bottom of viewport; on a long page (Curriculum), footer pushes down naturally

---

## Environment variables

**None required.** This project has no backend, no database, no API keys. All state is browser-local via localStorage.

If you want to add analytics (e.g., Vercel Analytics, Plausible, Umami), set the relevant env var per your analytics provider's docs — but it's optional.

---

## Custom domain

### On Vercel
1. Open the project dashboard
2. **Settings → Domains**
3. Add your domain (e.g., `ee-curriculum.yourdomain.com`)
4. Add the CNAME record Vercel shows you to your DNS provider
5. Wait ~5 minutes for DNS propagation
6. HTTPS is auto-provisioned

### On Netlify / Cloudflare
Similar flow: **Domain settings → Add custom domain → Configure DNS → Wait for HTTPS**.

### On self-hosted
Use Caddy (above) — it auto-provisions Let's Encrypt certs.

---

## Updating the PDF

The PDF ships pre-built at `public/download/EE_Curriculum_for_Computer_Scientists.pdf`. After editing curriculum content (in `scripts/ee_curriculum_part*.py`), regenerate:

```bash
# One-time setup
pip install reportlab pypdf pypdfium2
npx playwright install chromium

# Regenerate
python3 scripts/ee_curriculum_build.py

# Copy to public for serving
cp download/EE_Curriculum_for_Computer_Scientists.pdf public/download/

# Commit & push
git add download/ public/download/ scripts/
git commit -m "regenerate PDF with [your changes]"
git push
```

The deployment platform's build will pick up the new PDF automatically on the next push.

---

## Troubleshooting

### "Pyodide is loading..." forever

- **First load takes 20–30 seconds** (10 MB download from jsDelivr CDN). Subsequent loads in the same session are instant.
- If it never loads: check the browser console. Common cause: corporate firewall blocking `cdn.jsdelivr.net`. Solution: host Pyodide yourself by downloading from [github.com/pyodide/pyodide/releases](https://github.com/pyodide/pyodide/releases) and serving from `public/pyodide/`, then update the load URL in `src/components/curriculum/PythonPlayground.tsx`.

### Build fails on Vercel with "out of memory"

- This is rare for this project (no heavy build steps). If it happens, add `memory: 4096` to your `vercel.json` or contact Vercel support.

### PDF download link 404s

- Verify `public/download/EE_Curriculum_for_Computer_Scientists.pdf` exists in the repo. If not, see [Updating the PDF](#updating-the-pdf).

### Dark mode doesn't persist on refresh

- Check that `next-themes` is wrapping the app in `src/app/layout.tsx`. It should be (`<ThemeProvider>`). If not, the theme toggle is purely cosmetic.

### localStorage is wiped when I clear browser data

- This is by design — progress is browser-local. There is no account system. If you want server-side progress tracking, that's a future feature (see `research/EE_INTERACTIVE_FEATURES_RECOMMENDATION.md`).

### "Module not found: @radix-ui/..."

- Run `bun install` (or `npm install`). The `node_modules/` directory is gitignored.

### Build warning: "next/image requires domains configuration"

- We don't use `next/image` with remote URLs in this project. If you add it, configure `images.domains` in `next.config.ts`.

---

## Need help?

Open an issue at [github.com/srivtx/ee-curriculum/issues](https://github.com/srivtx/ee-curriculum/issues). Include:
- The platform you're deploying to (Vercel / Netlify / Cloudflare / Docker / static)
- The exact error message
- The output of `node --version` and `bun --version` (or `npm --version`)
- Whether the issue is on first deploy or after a change

---

*Last updated: 2026-09-10 · v2.0*
