# AGENTS.md

Guidance for AI coding agents (and humans) working in this repository.

## What this is

`ad-rotator` is a lightweight, **dependency-free** browser library (published to npm)
that rotates advertisement images inside a container element. It ships as ESM + UMD
bundles with TypeScript types. Source is ~360 LOC of TypeScript.

- Entry point: [src/ad-rotator.ts](src/ad-rotator.ts) — public `init()` and `stickyEl()`.
- Helpers: [src/helpers.ts](src/helpers.ts) — `NOOP`, `delay`.
- Types: [src/types.d.ts](src/types.d.ts) — public interfaces (`AdUnit`, `AdConfig`, `StickyConfig`, `AdRotatorInstance`).
- Styles: [src/style.less](src/style.less) — animation + sticky classes, imported by the bundle.
- Unit tests: [src/ad-rotator.spec.js](src/ad-rotator.spec.js) (Jest + jsdom).
- E2E tests: [cypress/](cypress/) (Cypress, ESM + UMD + accessibility).

## Tech stack

- **Language:** TypeScript (`strict: true`), targeting ES2020.
- **Build:** Vite 7 (library mode → `dist/rotator.es.js`, `dist/rotator.umd.js`).
- **Package manager:** pnpm (lockfile is v9 — use pnpm 9+).
- **Tests:** Jest 30 + jsdom (unit), Cypress (e2e, incl. `cypress-axe` for a11y).
- **Lint/format:** ESLint 9 (flat config) + Prettier.
- **Runtime support:** Node 20.19+ for the toolchain; the library itself runs in the browser.

## Common commands

```bash
make install        # pnpm i
pnpm dev            # Vite dev server (opens demo/index.umd.html)
make watch          # build in watch mode
make lint           # eslint --fix ./src
make test-unit      # jest src --verbose
make test-e2e       # cypress run (headless, chrome)
make prod           # lint + production build + copy .d.ts
make deploy-docs    # rsync docs/ -> static server (mirror, --delete)
```

### Deploy docs

`make deploy-docs` mirrors the local `docs/` directory to the static server with
`rsync -avz --delete` (source `docs/`, target `nikslab:/srv/static/ad-rotator-docs/`).
Override paths inline, e.g. `make deploy-docs DOCS_REMOTE=host:/path/`. The
`--delete` flag makes the remote an exact mirror — files removed locally are also
removed remotely, and changed files overwrite the older copies.

## Conventions

- **No runtime dependencies.** Keep the library dependency-free; do not add npm deps to ship in `dist/`.
- **No breaking changes** to the public API (`init`, `stickyEl`, config keys) without a major version bump and changelog note.
- **DOM safety:** all user-supplied URLs must pass through `sanitizeUrl`; links get `rel="noopener nofollow noreferrer"`. Prefer `setAttribute`/`textContent` over `innerHTML`.
- **SSR-awareness:** avoid touching `window`/`document` at module top-level; access them lazily inside `init`/`start`.
- **Style:** single quotes, semicolons, 2-space indent, 120-col width (Prettier enforces). Run `make lint` before committing.
- **Tests:** add/keep unit tests for behavior changes; e2e for integration paths. Tests currently couple to internal timing — prefer fake timers for new tests.

## Before you commit

1. `make lint` is clean.
2. `make test-unit` passes.
3. If you touched rotation/integration behavior, run `make test-e2e`.
4. Update [README.md](README.md) / types when the public API or config changes.

## Active improvement plan

A prioritized hardening, performance, and code-review plan lives in
[plans/hardening-plan.md](plans/hardening-plan.md). Consult it before starting
non-trivial work and keep it up to date as items land.

## Git / PR norms

- Default working branch is `develop`; PRs target `master`.
- Conventional-style commit prefixes are used (`feat:`, `fix:`, `chore:`, `test:`, `perf:`).
- Don't commit `dist/` changes in feature PRs unless releasing.
