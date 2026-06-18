# ad-rotator — Hardening, Performance & Code-Review Plan

> Date: 2026-06-18
> Scope: `src/` library code, build/test tooling, CI. Demo/docs assets out of scope except where they ship to users.
> Version reviewed: `5.8.1` (branch `develop`)

This is a small, dependency-free browser library (~360 LOC of source) that rotates
advertisement images inside a container element. Because it is published to npm and
loaded into third-party pages, correctness, bundle size, and the safety of the DOM it
generates matter more than for an internal app.

The plan is grouped by theme. Each item has a **severity** (🔴 high / 🟠 medium / 🟢 low),
the **file/location**, the **problem**, and the **proposed fix**. Items are ordered so
that the safest, highest-value changes come first. Nothing here changes the public API
unless explicitly called out under "API considerations".

---

## 0. Quick triage — do these first

| # | Severity | Item | Why first | Status |
|---|----------|------|-----------|--------|
| 1 | 🔴 | CI Node version (18) vs. toolchain (Vite 7 / Jest 30 need Node 20+) | CI is silently building on an unsupported runtime; releases may differ from CI | ✅ done |
| 2 | 🔴 | CI pins `pnpm` v8 but `pnpm-lock.yaml` is `lockfileVersion: 9.0` | `--frozen-lockfile` installs can fail or silently regenerate | ✅ done |
| 3 | 🔴 | Deprecated GitHub Actions (`codeql-action@v1`, `checkout@v2/v3`, `setup-node@v3`) | CodeQL v1/v2 are end-of-life; runs will start failing | ✅ done |
| 4 | 🟠 | `make prod` runs `eslint --fix` inside CI build | CI should never mutate source; masks lint failures | ✅ done |
| 5 | 🟠 | Event listeners / observers not fully torn down (`destroy()` relies on node-clone hack) | Memory leaks on SPA re-mounts | ✅ done (§4.2) |

---

## 1. Security hardening

### 1.1 🟠 Broaden URL sanitization beyond `javascript:`/`vbscript:` — ✅ done
- **Location:** [src/ad-rotator.ts:27-33](src/ad-rotator.ts#L27-L33) (`sanitizeUrl`), used at [src/ad-rotator.ts:161](src/ad-rotator.ts#L161).
- **Problem:** `sanitizeUrl` blocks only `javascript:` and `vbscript:`. A `data:text/html,...` URL set as an anchor `href` is a navigation/XSS vector, and `file:` / other exotic schemes pass through. The image `src` ([src/ad-rotator.ts:171](src/ad-rotator.ts#L171)) is not sanitized at all.
- **Fix:** Switch to a scheme **allow-list** rather than a deny-list. Permit `http:`, `https:`, `mailto:`, protocol-relative (`//`), relative paths, and hash/anchor links for `href`; permit `http:`/`https:`/`data:image/` for `img.src`. Reject everything else (return `''`). Keep the existing case-insensitive trimming. Add unit tests for `data:text/html`, `file:`, and protocol-relative URLs.

### 1.2 🟢 Guard `className`/`classList.add` against malformed config classes — ✅ done
- **Location:** [src/ad-rotator.ts:163,173](src/ad-rotator.ts#L163), and `linkClass`/`imgClass`.
- **Problem:** `classList.add(conf.linkClass)` throws `DOMException` if the class string contains spaces or is empty. Untrusted/typo'd config crashes the whole rotation.
- **Fix:** Split on whitespace and add tokens individually, filtering empties; or validate at `init`. Wrap in a tiny `addClasses(el, str)` helper.

### 1.3 🟢 Document the adblock-detection network request — ✅ done
- **Location:** [src/ad-rotator.ts:42-62](src/ad-rotator.ts#L42-L62).
- **Problem:** `detectBlock` base64-obfuscates a request to `pagead2.googlesyndication.com`. This is intentional (adblock bait), but it is undocumented and a privacy/CSP consideration for consumers.
- **Fix:** Add a clear code comment explaining the bait, and document in the README that `fallbackMode` issues a `no-cors` HEAD request to a Google ad endpoint so integrators can adjust their CSP / privacy disclosures.

### 1.4 🟢 SSR / non-DOM safety — ✅ done
- **Location:** [src/ad-rotator.ts:10](src/ad-rotator.ts#L10) — `window?.screen.availWidth`.
- **Problem:** `window?.screen.availWidth` only guards `window` being nullish at the `window?` step; if `window` is `undefined` the optional chain short-circuits, but the constant is still evaluated **at module import time**, which throws / misbehaves under SSR (Next.js, etc.) and breaks tree-shaking guarantees. `window.atob` / `document` are likewise touched eagerly.
- **Fix:** Defer all `window`/`document`/`screen` access until `init()`/`start()` runs (lazy). Compute `device` inside `init` behind a `typeof window !== 'undefined'` guard. This also fixes item 2.1 below.

---

## 2. Correctness / bug fixes

### 2.1 🟠 `device` is computed once at import and never updates — ✅ done
- **Location:** [src/ad-rotator.ts:10](src/ad-rotator.ts#L10).
- **Problem:** Device class is frozen at module load. Rotating a tablet/phone, resizing, or responsive testing never re-evaluates `desktop`/`mobile`, so `target` filtering and `sticky.noMobile` use a stale value. Also un-testable (jsdom reports `availWidth=0`).
- **Fix:** Compute lazily in `init` (see 1.4) and/or expose a matchMedia-based check re-evaluated on `start()`. Optionally listen to `resize`/`orientationchange` if dynamic re-targeting is desired (document the trade-off).

### 2.2 🟠 `unitsClone` drifts out of sync with `add()` / `remove()` — ✅ done
- **Location:** [src/ad-rotator.ts:332-344](src/ad-rotator.ts#L332-L344) plus the clone created at [:231](src/ad-rotator.ts#L231).
- **Problem:** `add()` pushes into `units` but not `unitsClone`, and does **not** re-sort by weight; `remove()` filters `units` but leaves stale references in `unitsClone`. The next rotation can therefore show a removed ad, or never show a newly added one until the clone naturally resets.
- **Fix:** Centralize mutations through a helper that updates `units`, re-sorts by weight, and rebuilds `unitsClone` consistently. Add unit tests asserting an added ad appears and a removed ad disappears within one cycle.

### 2.3 🟠 Potential infinite loop in random de-dup — ✅ done
- **Location:** [src/ad-rotator.ts:143-146](src/ad-rotator.ts#L143-L146).
- **Problem:** `while (unitsClone.length > 1 && prevItem.img === unitsClone[index].img)` loops forever if every remaining clone entry shares the same `img` (e.g. duplicate ads with different URLs).
- **Fix:** Cap retries (e.g. break after N attempts) or pre-check whether a non-matching candidate exists. Add a test with duplicate `img` values.

### 2.4 🟠 `init()` does work before validating, and throws on bad input — ✅ done
- **Location:** [src/ad-rotator.ts:205-231](src/ad-rotator.ts#L205-L231).
- **Problem:** When `units` is invalid the code sets `hasErr = true` but then unconditionally calls `units.sort(...)` and `[...units]`. The "not an array" test only passes because it *throws* (caught by the test), which is inconsistent with the "fail silently + console.error" contract used elsewhere.
- **Fix:** `return` an inert instance immediately after logging the error (all methods become no-ops via `hasErr`), guarding the `.sort`/spread so they only run on validated input. Make behavior uniformly "log and no-op", never throw.

### 2.5 🟢 `detectBlock` race + implicit return — ✅ done
- **Location:** [src/ad-rotator.ts:35-65](src/ad-rotator.ts#L35-L65).
- **Problem:** Two concurrent `start()` calls can both run the probe before `hasBlk` is set (double bait DOM + fetch). The success path falls through to `hasBlk = false` and returns `undefined` rather than the boolean, which is fragile.
- **Fix:** Memoize the in-flight promise (`let probe: Promise<boolean>`), return it on re-entry, and return the boolean explicitly on all paths.

### 2.6 🟢 Async interval can overlap
- **Location:** [src/ad-rotator.ts:314-321](src/ad-rotator.ts#L314-L321).
- **Problem:** `setInterval(async () => { await rotateImage(...) })` does not prevent a new tick from firing while a slow image load is still awaiting, which can stack rotations.
- **Fix:** Use a re-armed `setTimeout` chain (schedule the next rotation only after the current one resolves), which also removes the brittle `* 1e3 - 900` arithmetic (see 3.1).

---

## 3. Performance

### 3.1 🟠 Replace the hard-coded `delay(900)` "preload" with real image preloading
- **Location:** [src/ad-rotator.ts:185](src/ad-rotator.ts#L185) and the coupled `rotationTime * 1e3 - 900` math at [:320](src/ad-rotator.ts#L320).
- **Problem:** The library blocks every rotation on a fixed 900 ms `setTimeout` "to allow time to preload images". This is both too long (fast networks) and too short (slow networks → flash of empty/old ad), and the magic `-900` is duplicated knowledge that couples timing to the delay constant.
- **Fix:** Preload the next image via `new Image()` / `img.decode()` and swap only once it is decoded, then schedule the next tick (setTimeout chain from 2.6). Removes arbitrary latency and the coupled arithmetic. Keep a small fallback timeout so a never-loading image can't stall rotation.

### 3.2 🟢 Cache `getDefaultConfig` and avoid per-call object churn — ✅ done
- **Location:** [src/ad-rotator.ts:19-25](src/ad-rotator.ts#L19-L25).
- **Note:** `getDefaultConfig` is a misleading name for a plain object. Rename to `DEFAULT_CONFIG` and `Object.freeze` it to prevent accidental mutation of shared defaults across instances.

### 3.3 🟢 Build/bundle hygiene
- **Location:** [vite.config.js](vite.config.js).
- **Items:** Re-enable the commented-out `vite-plugin-dts` so types are emitted by the build instead of the separate `copyfiles` step (`copy-typescript-definitions`); confirm `sourcemap: 'hidden'` is intended; verify tree-shaking with `sideEffects: false` is honored given the `import './style.less'` side-effecting import (mark the CSS import in `sideEffects` if needed). Add a bundle-size budget check (e.g. `size-limit`) to CI to prevent regressions.

---

## 4. Code quality / redundancy

### 4.1 🟠 Reduce `as unknown as Record<string, unknown>` casts
- **Location:** [src/ad-rotator.ts:254-257](src/ad-rotator.ts#L254-L257).
- **Problem:** `conf.sticky` is typed `StickyConfig` but accessed via triple casts to read `constructor`/`noMobile`. This defeats the type system and is hard to read.
- **Fix:** Add a proper type guard (`isPlainObject`) and narrow `conf.sticky` once. `stickyEl` already accepts `StickyConfig`, so pass it directly without casting.

### 4.2 🟢 Replace the `destroy()` clone-the-node hack with explicit listener removal — ✅ done
- **Location:** [src/ad-rotator.ts:239-271](src/ad-rotator.ts#L239-L271).
- **Problem:** `mouseenter`/`mouseleave` are added as anonymous functions and "removed" by cloning the element and swapping it in the DOM. This loses any external listeners/state on the node and is surprising. `IntersectionObserver` is `unobserve`d but never `disconnect`ed.
- **Fix:** Store named handler references; `removeEventListener` them in `destroy()`; call `obs.disconnect()`. Drop the clone hack (keeps the user's element identity stable, which also simplifies the test that re-queries the DOM).

### 4.3 🟢 Naming & dead code — ✅ done
- `getDefaultConfig` → `DEFAULT_CONFIG` (4.2 above).
- The commented-out `console.log(' **** End of rotation cycle **** ')` at [:197](src/ad-rotator.ts#L197) — remove.
- `ret` is a loosely-typed shared variable ([:225](src/ad-rotator.ts#L225)); type it as the return of `rotateImage`.

### 4.4 🟢 Test-suite robustness (timing)
- **Location:** [src/ad-rotator.spec.js](src/ad-rotator.spec.js) — many `await wait(1000)` calls tied to the 900 ms internal delay.
- **Problem:** Tests are wall-clock-coupled to the magic 900 ms; once 3.1 lands they'll be flaky/slow.
- **Fix:** Use Jest fake timers (`jest.useFakeTimers`) and mock image load/decode so tests are deterministic and fast. Add the missing-coverage cases noted in §2.

---

## 5. Tooling & CI

### 5.1 🔴 Fix the Node version matrix — ✅ done
- **Location:** [.github/workflows/ci.yml](.github/workflows/ci.yml) — `node-version: [18.x]`.
- **Problem:** Vite 7 requires Node `20.19+` / `22.12+`; Jest 30 likewise drops Node 18. CI is on an unsupported runtime.
- **Fix:** Move matrix to `[20.x, 22.x]`. Add an `engines` field to `package.json` (`"node": ">=20.19"`).

### 5.2 🔴 Align pnpm version with the lockfile — ✅ done
- **Location:** CI uses `pnpm/action-setup@v2` with `version: 8`; lockfile is `lockfileVersion: 9.0`.
- **Fix:** Add `"packageManager": "pnpm@9.x.x"` to `package.json` and let `action-setup` read it (drop the hard-pinned `version: 8`). Use `--frozen-lockfile` in CI installs.
- **Resolved as:** pinned `pnpm@10.28.1` (not 9.x). The repo's `pnpm-workspace.yaml` already uses the pnpm-10 convention (top-level `ignoredBuiltDependencies`), which pnpm 9 rejects with "packages field missing or empty". Lockfile 9.0 is shared by pnpm 9 and 10.

### 5.3 🔴 Modernize / de-deprecate Actions — ✅ done
- **Location:** [.github/workflows/ci.yml](.github/workflows/ci.yml), [.github/workflows/codeql-analysis.yml](.github/workflows/codeql-analysis.yml).
- **Fix:** `actions/checkout@v4`, `actions/setup-node@v4`, `pnpm/action-setup@v4`, `actions/cache@v4`, and `github/codeql-action/*@v3`. Add `permissions:` blocks (least privilege) to `ci.yml`. The CodeQL workflow's `init`/`autobuild`/`analyze` must all move to `@v3`.

### 5.4 🟠 Don't mutate source in CI — ✅ done
- **Location:** [Makefile](Makefile) `prod:` target runs `make lint` which is `eslint --fix`.
- **Problem:** CI's build step auto-fixes and would commit-drift / hide failures.
- **Fix:** Split lint into `lint` (`--fix`, local) and `lint:check` (no fix, used by CI and a pre-commit gate). CI runs `lint:check` + `prod` separately.

### 5.5 🟠 Cache correctness — ✅ done
- **Location:** `ci.yml` — `actions/cache` uses a static key `nmodules` with no lockfile hash.
- **Fix:** Key the cache on `hashFiles('**/pnpm-lock.yaml')`; rely on `setup-node`'s built-in pnpm cache instead of a hand-rolled `node_modules` cache (which is fragile across the build/test jobs).

### 5.6 🟢 Add Dependabot / scheduled dependency review and a `test:coverage` gate
- Enable Dependabot for `npm` + `github-actions`. Add a coverage threshold to the Jest config and surface it in CI.

---

## 6. Documentation

- `README.md`: document `fallbackMode`'s network probe (1.3), the new URL allow-list behavior (1.1), and supported Node versions.
- `SECURITY.md`: confirm the reporting channel and add the URL-sanitization policy.
- Add the generated `AGENTS.md` (and `CLAUDE.md` → points to it) as the contributor/agent entry point.

---

## 7. Suggested execution order (PR slicing)

1. **PR 1 — CI/tooling (no source changes):** §5.1–5.5, §0 items 1-4. Lowest risk, unblocks reliable CI.
2. **PR 2 — Safe correctness fixes:** §2.4, §2.5, §2.2, §4.2, §4.3. Behavior-preserving, well-tested.
3. **PR 3 — Security hardening:** §1.1, §1.2, §1.4/§2.1. New tests for each.
4. **PR 4 — Performance:** §3.1, §2.6, §3.2 (real preloading + setTimeout chain), with fake-timer test refactor §4.4.
5. **PR 5 — Polish:** §4.1, §3.3, §6 docs, Dependabot/coverage §5.6.

### API considerations
None of the above requires a breaking change. The public surface (`init`, `stickyEl`,
config keys) stays the same. If §3.1 changes observable rotation timing, treat it as a
**minor** bump and note it in the changelog. Stricter URL sanitization (§1.1) could
reject URLs that previously rendered — call it out in release notes.
