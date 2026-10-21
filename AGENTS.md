# Repository instructions

## Scope and working agreement

- This repo is the frontend of The Pocket Shoes, a shoe e-commerce site (storefront + admin).
  The backend is a separate service (Heroku) and is not in this repo: do not change API
  contracts here. When the backend misbehaves, add a narrow, commented FE-side workaround and
  report the backend issue to the user.
- Reply to the user in Vietnamese. Code comments and storefront copy are Vietnamese too.
- Keep changes minimal and focused on the request. Keep product decisions the owner already
  made. Example: sizes are not sold separately, so the product page shows only the size guide
  and does not get a size picker.
- Ask before changing product behavior, copy direction, licensing (for example TinyMCE
  `license_key`), dependencies or lockfiles. Do not upgrade or add packages unless asked.
- `package-lock.json` is the source of truth (CI and Docker run `npm ci`). `yarn.lock` also
  exists and may have local changes from the user: do not touch or stage it.
- `.env` usually points `NUXT_PUBLIC_API_BASE_URL` at the production backend. While testing,
  never create, update or delete real data (orders, admin CRUD, coupons) unless the user
  explicitly asks; read-only checks only.
- The user often runs `npm run dev` on port 3000. Reuse that server; do not start a second dev
  server in the same directory (it shares `.nuxt/` and Nuxt refuses to start). To run a
  production build while it is running, build in an isolated copy of the repo.
- Before finishing, run `npm run lint` and `npm run typecheck`. For SSR, server or config
  changes also run `npm run build`, plus `npm run build:cf` for Cloudflare-specific code. Report
  results, including checks that could not be run.

## Stack and workspace boundaries

- Nuxt 4 with SSR, Vue 3.5 Composition API (`<script setup lang="ts">`), TypeScript, Pinia,
  Tailwind CSS v4 (`@tailwindcss/vite`), Axios, DOMPurify, TinyMCE 7 (admin editor) and
  Swiper 12. Node 22.
- Two deploy targets; keep both working:
  - Cloudflare Workers (production): `npm run build:cf`, `wrangler.jsonc`,
    `server/plugins/edge-cache.ts`. There is no `/api` proxy, so the API base must be a full
    HTTPS URL. Details are in `docs/cloudflare-workers.md`.
  - Docker/Node behind Nginx (backup): `Dockerfile`, `docker-compose.yml`,
    `deploy/docker/nginx.conf`. Nginx proxies `/api` and `/files` to the backend.
  - Cloudflare-only behavior is gated by `isCloudflareBuild` in `nuxt.config.ts` or by
    `event.context.cloudflare` on the server.
- Local `node_modules` may not match `package-lock.json`: it has been installed with yarn
  (Nuxt 4.6.x locally vs 4.4.5 locked). With Nuxt 4.6.x, `npm run build:cf` fails while
  prerendering `/about` (HTTP 500) even on old commits, so do not treat that as a regression and
  do not upgrade Nuxt until it is investigated. To reproduce CI on macOS:
  - create a git worktree and run `npx npm@10 ci` there (npm 12 rejects the lockfile);
  - the lockfile was generated on Linux, so add the missing native binaries with
    `npm i --no-save lightningcss-darwin-arm64@<v> @tailwindcss/oxide-darwin-arm64@<v> @rollup/rollup-darwin-arm64@<v>`,
    using the versions of `lightningcss`, `@tailwindcss/oxide` and `rollup` in that worktree.
- All env vars are public `NUXT_PUBLIC_*` values (see `.env.example`); never put secrets in them.
  App code reads them through `src/config/env.ts` (`env.apiBaseUrl`, `env.fileBaseUrl`, ...),
  not `process.env`.
- Rendering: public pages are SSR. `/admin/**`, `/checkout` and `/order-success` are
  `ssr: false` (`routeRules` in `nuxt.config.ts`). Public detail routes send cache headers and,
  on Node builds, use `swr: 300`.
- Generated or local-only paths: `.nuxt/`, `.output/`, `.wrangler/`, `.data/`, `node_modules/`,
  `.playwright-mcp/`, `.env`, `.dev.vars`. Do not edit or commit them.
- Known backend issues, and the FE workaround for each, are tracked in `docs/backend-issues.md`.
  When the backend fixes one, remove the matching workaround and update that file.
- Backend API contract (verified against the real API):
  - Responses are `{ success, message, data }`. Lists return
    `data = { items, page, limit, total, totalPages }`: unwrap with `unwrapList`
    (`src/modules/shared/types.ts`), even for endpoints that sound like arrays such as
    `/landing-banners`.
  - `limit` is capped at 100; larger values return 400. Page through results to load "all".
  - Missing detail records (product, blog, collection by slug) return 400 with a
    "... not found" message. Treat them as 404 with `isNotFoundError`
    (`src/composables/useNotFoundStatus.ts`).
  - Product list items expose `minPrice`, `minSalePrice`, `totalStock` and `primaryImageUrl`
    (no `price`/`salePrice`). Product detail exposes `skus[].price`, `salePrice` (null when not
    on sale) and `stock`. The list endpoint has no sort parameter.
  - The current catalog has one SKU per product with size `DEFAULT`.
  - Backend file paths go through `resolveFileUrl` (`src/lib/fileUrl.ts`). FE public assets
    such as `/thepocketshoes-og.jpg` must not be resolved against the backend origin.

## Repository structure

Nuxt `srcDir` is `src/` and several Nuxt directories are renamed (`dir` in `nuxt.config.ts`):

- `src/nuxt-pages/`: file-based routes. Thin wrappers that set `definePageMeta` (layout, name,
  middleware) and default SEO, then render a component from `src/pages/`.
- `src/pages/public/`, `src/pages/admin/`, `src/pages/system/`: the real page components.
  Admin CRUD pages share `src/pages/admin/CrudShell.vue`.
- `src/nuxt-layouts/` (`public`, `admin`, `default`), `src/nuxt-middleware/` (`admin`,
  `guest-admin`), `src/nuxt-plugins/`.
- `src/components/ui/`: `Ui*` design-system primitives, exported from `index.ts`.
  `src/components/common/` holds shared composites; `storefront/`, `home/` and `admin/` hold
  area-specific components.
- `src/modules/<domain>/`: `api.ts` (calls through `httpClient`), `types.ts`, plus optional
  `hooks.ts`/`helpers.ts`. Domains: `auth`, `catalog/*`, `content/*`, `customer`, `file`,
  `promotion/coupon`, `sales/order`, `shared` (master data, list helpers).
- `src/lib/`: `http/httpClient.ts` (Axios, auth header, token refresh, loading counters),
  `sanitizeHtml.ts`, `richText.ts`, `fileUrl.ts`, `seo.ts`, `dateTime.ts`, `slug.ts`.
- `src/composables/`, `src/stores/app.ts` (auth session, theme, loading counters),
  `src/config/` (`env.ts`, `brand.ts`, `adminNav.ts`), `src/services/`, `src/types/`,
  `src/style.css` (Tailwind import and `--ui-*` design tokens).
- `server/`: Nitro plugins and routes (`plugins/edge-cache.ts`, `routes/robots.txt.ts`,
  `routes/sitemap.xml.ts`).
- `.github/workflows/`: CI (lint, typecheck, Node build, Docker build), CI Cloudflare
  (`build:cf` + `wrangler deploy --dry-run`) and manual deploy workflows.
- The import alias `@/` maps to `src/`.

## UI implementation

- Build with the existing `Ui*` components and the `--ui-*` CSS variables (themes switch via
  `data-theme` on `<html>`). Storefront style is black/white with heavy headings; admin uses the
  slate palette.
- `cn()` only joins class strings (no tailwind-merge), so do not try to override conflicting
  Tailwind classes through `class`; add a prop or variant instead. `UiInput`, `UiTextarea` and
  `UiSelect` drop border, rounded, padding, background and text classes passed via `class`.
- SSR data loading:
  - Fetch public content with `useAsyncData` in setup, not in `onMounted`.
  - Start every API call synchronously inside the handler (`Promise.all`/`Promise.allSettled`,
    no `await` before a call). The Axios request interceptor runs synchronously and needs the
    Nuxt context to resolve the request URL and runtime config.
  - Listing pages use `lazy: true` and derive what they show with `computed` from the
    asyncData result plus local reloads. Do not copy asyncData into refs with watchers: watchers
    do not run during SSR.
  - On partial failures use `Promise.allSettled` and set `event.context.skipEdgeCache = true` so
    incomplete HTML is not cached at the edge.
- Not-found states: call `useNotFoundStatus(data, error)`, render an `<h1>` with a link back, and
  set `robots: 'noindex, follow'`.
- SEO for public pages (helpers in `src/lib/seo.ts`):
  - Set `title` and `description` with `useSeoMeta`. Build descriptions with
    `metaDescription`/`htmlToPlainText` so every page gets a unique one, even when the backend
    field is empty.
  - Add a canonical link. Listings use `listingCanonicalUrl`, which drops filter and sort
    parameters and keeps only `page`.
  - Emit structured data with `jsonLdScript` (it escapes `<`); never inline `JSON.stringify` into
    a script tag.
  - Each page has exactly one `<h1>`: `SafeHtmlContent` demotes `<h1>` inside rich content.
  - New public content types must also be added to `server/routes/sitemap.xml.ts`.
- Rich HTML from the backend renders only through `SafeHtmlContent` / `sanitizeHtml`. The server
  path is a custom tokenizer: keep its allowlist in sync with the DOMPurify config in the same
  file. Never `v-html` raw backend content.
- Images: use `StorefrontImage` (fallback image, file URL resolution, recovery when an image
  fails before hydration). Always set `alt`. Use `loading="eager"` and `fetchpriority="high"`
  only for the LCP image.
- Overlays: use `UiModal`/`UiDrawer`, which get Esc to close, focus trap, scroll lock and focus
  return from `useDialog`. Any `<Teleport to="body">` must sit inside `<ClientOnly>` (Nuxt
  cannot hydrate it). Custom dialogs should also use `useDialog`.
- Feedback: use `useToast().push(message, variant, title)`. Global loading is automatic: a thin
  progress bar, plus an input-blocking overlay only for admin mutations. Give action buttons
  their own `loading`/`disabled` state.
- Use `NuxtLink` for links (it handles prefetch and external URLs).
- Accessibility:
  - Icon-only buttons need an `aria-label`.
  - Toggles expose `aria-pressed`/`aria-expanded`; current links use `aria-current`.
  - Everything must work by keyboard with a visible `focus-visible` ring.
  - Hide native inputs with `sr-only`, never `hidden`.
- Copy and formatting: storefront text is Vietnamese (the English brand tagline is
  intentional). Use `money()` for prices and `productGenderLabel()` for gender values.
- Responsive: check at 390px and 1440px with no horizontal overflow. Swiper sliders render
  during SSR, so mimic `slidesPerView`/`spaceBetween` with CSS before initialization (see
  `src/components/home/*Swiper.vue`) to avoid layout shift.
- Formatting follows Prettier (no semicolons, single quotes, `printWidth` 100, Tailwind class
  sorting), 2-space indentation and LF line endings. Comments explain non-obvious reasons and
  are written in Vietnamese, matching the existing code.

## Commits

- Commit only when explicitly requested by the user.
- Allowed commit types: add, fix, update, remove, refactor, agent, feat, chore, docs.
- Use the format: `<type>: <description>`.
- Do not include a scope such as `feat(ui):`.
- Write concise, specific descriptions of the actual change.
- Do not use vague messages such as `update`, `fix stuff`, `changes`, or `WIP`.
- Do not mention AI, Codex, Claude, ChatGPT, Antigravity, or automated generation in commit messages.
- Do not add `Co-authored-by` or similar AI attribution unless explicitly requested.
- Keep each commit focused on one logical change.
- Inspect the staged diff before committing; do not stage unrelated changes or secrets.
- Run relevant checks before committing and report failures or unavailable checks.
- Do not amend, force-push, or rewrite history unless explicitly requested.

## Tool usage

- Use Playwright, when available, to verify UI changes against the local development server
  (`http://localhost:3000`). If the Playwright MCP tools are not loaded, drive `playwright-core`
  with the system Chrome (`channel: 'chrome'`) from a script instead.
- Check relevant responsive states (390px and 1440px), keyboard interactions, console errors
  and hydration warnings, failed asset or API requests, and broken images.
- For SSR changes, also check the raw HTML and HTTP status codes with `curl`. Nitro's SWR cache
  (`swr: 300` on public listing and detail routes) can serve a stale response for up to 5
  minutes, so use fresh URLs or a cache-busting query parameter when verifying.
- When auditing HTML (counting `<h1>`, reading JSON-LD), parse it with a script; line-based
  `grep` miscounts minified output.
- Admin pages require login. The user provides credentials per session: never write them to
  files or memory, log out when done, and delete Playwright artifacts (`.playwright-mcp/`) that
  may contain them.
- If a tool is unavailable, use an appropriate fallback and state which verification could not
  be completed.
