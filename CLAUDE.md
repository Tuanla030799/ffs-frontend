# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

`AGENTS.md` is the source of truth for repo rules (working agreement, API contract, UI, SEO,
commits, verification). It is imported below; this file only adds commands and the cross-file
architecture that `AGENTS.md` does not spell out. Update `AGENTS.md`, not this file, when a rule
changes.

@AGENTS.md

## Commands

- `npm run dev`: dev server on `http://localhost:3000` (usually already running, reuse it).
- `npm run lint` / `npm run lint:fix`; one file: `npx eslint src/path/File.vue`.
- `npm run typecheck`: `nuxt typecheck` (vue-tsc) over the whole project; it cannot be scoped to
  one file.
- `npm run format:check` / `npm run format`; one file: `npx prettier --check <file>`.
- `npm run build` + `npm run preview`: Node build (Docker target).
- `npm run build:cf` + `npm run preview:cf`: Cloudflare Workers build, run locally on workerd
  with variables from `.dev.vars`.
- There is no test suite or test runner. Verification is lint, typecheck, builds, plus manual
  checks with Playwright/`curl` against the dev server as described in `AGENTS.md`.

## Architecture: how a request flows

- **Route → page → module.** A file in `src/nuxt-pages/` sets meta/SEO and renders a component
  from `src/pages/`, which calls `src/modules/<domain>/api.ts` (objects like `productApi`).
  `src/services/` only holds admin auth and file upload; new domain calls go in a module.
- **`httpClient` (`src/lib/http/httpClient.ts`).** The request interceptor is registered with
  `synchronous: true` and resolves `baseURL`/`timeout` on every request, not at import time:
  - `src/config/env.ts` reads runtime config, then `process.env`, then the build-time
    `__BUILD_PUBLIC_ENV__` injected by `vite.define` in `nuxt.config.ts`. That last fallback
    keeps Workers from falling back to `/api`, which has no proxy there.
  - During SSR a relative base (`/api`) is made absolute with `useRequestURL().origin`.
  - Query params go through `buildSearchParams` (`src/lib/http/queryParams.ts`).
  - All errors are normalized to `ApiError` (`src/types/http.ts`) with `status` and backend
    `code`.
- **Client-only state.** The Pinia store (token, loading counters) is touched only when
  `import.meta.client`: on the server the response interceptor runs outside setup, and
  `useAppStore()` could pick up another request's Pinia. `src/nuxt-plugins/app.client.ts`
  hydrates theme, access token and admin profile from `localStorage`.
- **Admin auth.**
  - The `admin` middleware runs only on the client and only checks that an access token
    exists.
  - A 401 triggers a single-flight refresh (one shared promise), then the original request is
    retried once.
  - If the refresh fails, the session is cleared and the user is sent to `admin-login` with a
    `redirect` query.
  - Login, refresh and logout URLs never trigger a refresh.
- **Cart.** `useCart` keeps cart and coupon in `localStorage` (`ffs-cart`, `ffs-cart-coupon`).
  Instances stay in sync through the `ffs-cart-updated` window event and the `storage` event, so
  writes must go through the composable.

## Architecture: caching layers

Public HTML can be cached in three places; keep them consistent when adding public routes:

1. `routeRules` in `nuxt.config.ts` send `Cache-Control` headers on public detail routes.
2. Node builds only: Nitro `swr: 300`. It is off on Workers because Nitro's cache there is
   per-isolate memory.
3. Workers only: `server/plugins/edge-cache.ts` stores rendered HTML in `caches.default` for
   5 minutes.
   - It only caches GET requests whose path matches `CACHEABLE_PATHS` and has no query string.
     New public sections must be added there.
   - The cache key includes the build ID, so a deploy never serves HTML that points at deleted
     chunks.
   - It skips the response when `event.context.skipEdgeCache` is set.
     `src/nuxt-plugins/edge-cache-guard.server.ts` sets that automatically when any
     `useAsyncData` errored. Pages set it themselves on partial failures they swallow (for
     example with `Promise.allSettled`).
   - It only works on the custom domain, not on `*.workers.dev`.

Nothing is prerendered: `/about` and `/faq` render their admin-managed content (BE `site_pages`
and `faqs`) on each request like other public pages.
