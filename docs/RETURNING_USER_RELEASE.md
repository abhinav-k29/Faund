# Wilsee returning-user release

25 October 2026. The existing React/Vite application was refined in place. Hosting follows the user's updated choice of Netlify. Production is published at **https://wilsee.netlify.app** in the user’s Netlify account. Final deployment: `6adcfaa88c21039cd23efa6d`, state `ready`.

## Product changes

- `/` opens the populated Home immediately. Old welcome, consent and setup routes return there. No account, tutorial, automatic permission request or invented consent is created.
- Every new browser starts with the existing level 7, 640 Explorer XP, 180 spendable Growth XP, 24 entries, six companions, eight sites and two completed tasks. All original character growth values remain unchanged.
- Tasks remains prominent on Home. The discovery action now appears above the living world, within the first phone screen.
- Wilsee's user-facing copy is cleaned up. Research details and downloads still explain fictional records and unverified identification accurately.
- The user-supplied glossy sprout PNG replaces the header mark and browser/PWA icons. Its existing transparency is preserved. The colour experiment was withdrawn at the user’s request; the original bright green and purple artwork is restored. See [logo asset notes](BRAND_ASSET.md). Maskable/Apple icons use the app's cream background.
- The existing design system, six procedural models, three growth stages, habitats, interactions and illustrated fallback are retained.

## State and privacy

The original `nature-discovery-v1` key remains. Migration preserves earned XP, wallets, observations, tasks, companion state and consent history. Only recognized built-in fictional records are converted to explicitly illustrative research entries; visitor records are excluded from the public research selector. Consent is never fabricated. Valid empty journals stay empty after an explicit clear; starter content is restored only through the confirmed Profile action.

Storage errors offer useful recovery: disabled storage supports a temporary session, malformed data is preserved with saving paused, and a quota failure does not advance photo recording. Profile offers private JSON download, restore and clear controls.

New public-build discoveries are private, manually identified and unverified. Research sharing is unavailable in that build. The original mandatory agreement, per-record submission permission, receipts and withdrawal remain available through the separate `research` build mode for local development. No actual research service is connected.

The researcher workspace retains project/task creation and editing, publication into Tasks, linked observations, site monitoring, repeat-visit protocols, uncertainty, review notes/status, date/species/category/method filters, charts and CSV downloads. Its public dataset contains only 23 fictional learning entries. Export provenance explicitly says they are not verified occurrences or research submissions. Exact coordinates are excluded, sensitive localities are restricted, and sensitive photos/free text are withheld from researcher details.

Community Worlds still accepts only character IDs, stages and biomes. It cannot access observation images, coordinates, dates or research records. Camera/location requests remain explicit. Photos are resized and re-encoded to strip source EXIF.

## Architecture and asset audit

React 19, Vite 8, TypeScript, React Router, Motion, Three.js/React Three Fiber, Leaflet and vite-plugin-pwa remain in place. No backend, new API integration or application runtime dependency was introduced. Lazy map, discovery, research and 3D routes remain split.

Before the new logo assets, public assets totaled approximately 1.15 MB across 23 files. The largest photo was 219 KB. No remote model files are required: models are procedural. The lazy 3D chunk is about 960 KB minified / 256 KB gzip; it is preserved because the characters are central to the product. Vite's chunk-size warning is informational. No critical build/runtime errors were observed in completed local suites.

Production PWA settings use `/` for id/start/scope. The app shell, fonts, images, offline map and lazy renderer are precached. Updates wait for explicit user action. No first-visit install popup is used. The Netlify deploy uploads `dist` only, with no source archives, dependencies, screenshots, `.git`, credentials or local journals.

## Completed local checks

| Check                              | Result                                                                                                                                                                                                                                                           |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Production TypeScript + Vite build | Pass                                                                                                                                                                                                                                                             |
| Domain tests                       | 18 passed, including unchanged mandatory-consent/permission rules and new starter/migration checks                                                                                                                                                               |
| Original scientific journey        | Pass: consent/decline, captures, cards, uncertainty, ecosystem, CSV, task edits/rewards, repeat sites, withdrawal, layouts                                                                                                                                       |
| Camera/privacy quality             | Pass: denied camera, local photo processing, explicit location, stale-camera cleanup, cross-tab state, sensitive withholding                                                                                                                                     |
| Research permissions suite         | Pass: private capture, idempotent saves, informed receipts, withdrawal, independent deletion                                                                                                                                                                     |
| Worlds/research upgrade suite      | Pass: all six actual WebGL models, evolution, feed, drag/reset/fallback, biomes, Community isolation, project/task publication, filters, monitoring and export                                                                                                   |
| Public release suite               | Pass locally: fresh/returning visitors, 16 direct routes, old route redirects, clean copy, private upload, duplicate clicks, fictional-only CSV, Community isolation, feed/reward persistence, migration, clear/restore, corrupt/blocked storage and offline map |
| Public tools/accessibility         | Pass locally: task builder/publication, repeat-site monitoring, species/review filters; zero violations across nine Axe audits                                                                                                                                   |
| PWA production check               | Pass, including updated icons, offline shell/photo/map and precached renderer                                                                                                                                                                                    |
| Formatting                         | Pass, including the final logo changes                                                                                                                                                                                                                           |

The first public screenshot set covers Home, discovery, collection, species, character, Tasks, map and profile at **390x844, 375x667, 768x1024 and 1440x900**. Four visual contact sheets and representative full-page images were reviewed. The final live set includes the restored original logo and final Home spacing. The live screenshot gallery is `artifacts/live-release/index.html`.

## Live deployment verification

- Netlify site `wilsee`, project ID `aabe0aa9-b9bc-47a2-906f-7ad4ced3d748`, published on 25 October 2026. No paid plan upgrade or domain purchase was made.
- The final public release suite passed against the HTTPS production URL, including clean browser state, populated root, old route redirects, Back/Forward, private captures, one-time saves/rewards, migration, storage recovery and offline map.
- Fourteen unauthenticated HTTP requests verified root/deep routes, manifest, service worker, logo and platform icons directly at the server. This verifies hosting rewrites independently of the browser service worker.
- Chromium parsed the live app manifest with no errors. Its Content-Type is `application/manifest+json`; start URL is `/` and display is standalone. The service worker uses no-cache headers.
- Live public project/task publication, species/review filters, repeat-site monitoring and nine Axe audits passed with zero violations.
- A separate browser check across nine routes found zero console errors and zero runtime errors. The full journey also reported no failed same-origin requests.
- Netlify's optional provider badge initially intercepted the mobile navigation. It was disabled through the supported per-project setting; the final browser check found no badge overlay. No app-level hiding workaround or paid upgrade was used.
- Header, browser icons, manifest and social image use fingerprinted copies of the original artwork under `/brand/wilsee-original/`, with real alpha transparency. The muted preview is removed from public output and its former URL redirects to the original. Original PNG and ICO icons are precached for offline use.
- The final restored-logo verification matched all five live PNG files byte-for-byte to the original exports, recaptured all 32 screens and found no overflow or runtime errors. Evidence: `artifacts/live-release/restored-logo-check.json`.
- Reports: `artifacts/live-release/report.json`, `hosting-checks.json` and `artifacts/returning-user/accessibility.json`. See [deployment/startup guidance](DEPLOYMENT.md) for repeating the checks or publishing changes.

## Remaining limits

Identification is manual; no AI classification or real expert review runs. There is no backend, account sync, real community publishing or external research submission. Starting observations and Community gardens are fictional. Storage is local and unencrypted, and its capacity is finite. Offline use needs an initial online visit. Automated browser checks use desktop Chromium; physical iPhone Safari, actual device cameras, assistive technology and Home Screen installation still need device testing.

See [deployment instructions](DEPLOYMENT.md), [startup instructions](../README.md) and the actual screenshot/report artifacts under `artifacts/returning-user/` and `artifacts/live-release/`. The checkpoint `checkpoints/before-returning-user.zip` preserves the pre-change source without dependencies or credentials.

## Browser icon cache correction

The original artwork now has content-fingerprinted header, favicon, Apple and manifest icon URLs under `/brand/wilsee-original/`. The 32 px favicon is preloaded in the HTML head, and a native ICO is supplied. The muted preview is archived outside public output; its previous URL redirects to the original. The offline PWA check verifies every browser/manifest icon decodes from cache and that the retired logo is absent. Live verification is recorded in `artifacts/live-release/favicon-fix-check.json`. Existing Chrome tabs may need one hard refresh or the app’s Update action to load the new metadata; no journal data needs clearing.
