# Hoang Nhat Duy Le: portfolio

Live: https://hoangle.online/

A static site built with [Astro](https://astro.build): a dark sidebar, light section banners, and content kept in plain JSON files.

## Edit the content

Everything on the page comes from `src/content/*.json`. Change a file, save, and the page updates.

| File | What it controls |
| --- | --- |
| `profile.json` | Name, headline, availability line, links, and the typed stats (`years`, `customers`) |
| `experience.json` | Roles, newest first. Logos come from `src/assets/logos/` |
| `projects.json` | Projects. The first entry is shown first; `featured: true` marks AEGIS |
| `research.json` | Papers. **Titles are intentionally not allowed** (see below) |
| `skills.json` | The three tiers (Daily, Working knowledge, Earlier career); each skill may name a brand `icon` from `src/lib/icons.ts` |
| `education.json` | Schools, exactly three bullets each |
| `testimonials.json` | Feedback quotes |

Content is validated at build time by the schemas in `src/lib/schemas.ts`. A typo in a date or a missing image fails the build with a clear message instead of shipping a broken page.

Two stats are **derived**, not typed: "Industry employers" counts `experience.json` entries with `kind: "industry"`, and "Papers under review" counts `research.json`. They cannot drift from the lists.

### Papers under review

`research.json` is `.strict()`: adding a `title` or `authors` key fails validation on purpose. Add the real title only after your advisor and co-authors confirm in writing, and loosen the schema in the same change.

### Images

Put images in `src/assets/` and refer to them by file name (for example `"image": "aegis.svg"`). Astro converts them to optimized WebP at build time. Diagrams use `"imageFit": "contain"` with an `imageBg` color; photos use the default `cover`.

## Run it

```bash
npm install
npm run dev        # http://localhost:4321/
npm run build      # production build into dist/
npm run preview    # serve the production build
```

Requires Node 22.12 or newer (`.nvmrc` pins 24).

## Test it

```bash
npm test                      # unit tests (Vitest): content rules, stats, validation helpers
npx vitest run --coverage     # same, with the 80% coverage gate on src/lib
npx astro check               # TypeScript and Astro type check
npx playwright install chromium   # once
npm run test:e2e              # end-to-end (Playwright) against the production build
```

The e2e suite covers navigation, tabs, the contact dialog (including the spam honeypot), the AI widget, accessibility (axe), reduced motion, and horizontal overflow from 320px to 1920px, on desktop and mobile Chromium. It builds the site first, so run `npm run build` yourself if a preview server is already running.

## Deploy

Pushing to `master` runs `.github/workflows/deploy.yml`, which builds the site and publishes it to GitHub Pages.

One-time setup: in the repository, go to **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.

The site is served from the custom domain `hoangle.online` (`site` in `astro.config.mjs`, `public/CNAME`). DNS lives at Namecheap: four `A` records and one `CNAME` for `www` pointing at GitHub Pages. In **Settings → Pages**, set the custom domain and tick **Enforce HTTPS**.

## Other things to know

- **Contact form:** posts to Formspree. A hidden `_gotcha` field is a spam honeypot, and bots that fill it get a fake success while nothing is sent.
- **AI assistant:** the floating "Ask my AI" panel loads the separately hosted assistant in an iframe and warms it up on first interaction, because the host sleeps when idle.
- **Security headers:** GitHub Pages can't set headers, so a Content-Security-Policy ships as a `<meta>` tag from `src/layouts/Base.astro`. If you add a third-party script or embed, add its origin there.
- **Social preview image:** regenerate `public/og.png` with `node scripts/generate-og.mjs` after changing the headline or portrait.
- **Design tokens** (colors, type, spacing, motion) live in `src/styles/tokens.css`. UC red is an accent only; the dark neutral carries the large surfaces.
