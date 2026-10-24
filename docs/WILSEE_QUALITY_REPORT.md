# Wilsee product and engineering review

23 October 2026 · existing local prototype · Windows / Chromium

Wilsee retains the existing React/TypeScript/Vite application, routes, local records, five-item navigation, research tasks and ivory/forest/lime/coral/lavender aesthetic. This pass improves that prototype; it does not replace it with a new application or a production backend.

## Evidence and recovery

- Before-change source/assets archive: [before-wilsee-overhaul.zip](../checkpoints/before-wilsee-overhaul.zip). It excludes dependencies, caches, environment files and browser data.
- Initial inventory, baseline tests and prioritised critique: [WILSEE_AUDIT.md](WILSEE_AUDIT.md).
- Four visual passes: [before](../artifacts/visual-audit/before), [iteration 1](../artifacts/visual-audit/iteration-1), [iteration 2](../artifacts/visual-audit/iteration-2), [final](../artifacts/visual-audit/final).
- Linked side-by-side screenshots: [comparison.html](../artifacts/visual-audit/comparison.html); exportable [contact sheet](../artifacts/visual-audit/comparison.png).
- Machine-readable results: [domain tests](../tests/domain.spec.ts), [accessibility](../artifacts/quality/accessibility.json), [stress](../artifacts/stress/results.json), [production measurements](../artifacts/performance/results.json).

## Product changes

| Area                 | Result                                                                                                                                                                                                                                                                                                                                  |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Branding and UI      | Wilsee name in the app, browser title, package, manifest and current documentation. Existing theme, photography and layout system retained. Larger readable body/metadata text, improved contrast, 44–48 px primary targets and consistent surfaces.                                                                                    |
| Navigation and Home  | Home / Map / Scan / Collection / Explore remain. One prominent mission shortcut near the greeting shows real progress and active/completed counts. Tasks, Field Guide, Sites and the ecosystem alias remain accessible.                                                                                                                 |
| Discovery            | Polished bee entry and scripted analysis retained. Real uploaded photos stay attached. Empty, corrupt, SVG, wrong-type and oversized inputs receive actionable messages. Processing resizes to 1200 px, re-encodes JPEG and removes source EXIF. Latest upload wins; cancelled/stale camera requests stop their tracks.                 |
| Capture              | Shared scientific validation; exact field-event deduplication; synchronous save lock remains latched through successful navigation. Invalid saves can be corrected and retried. No duplicate record, unique companion or XP grant on repeated save.                                                                                     |
| Cards and Collection | Two-sided real-species/fictional-companion cards, clear flip state and announcement, keyboard button, refreshed SVG portraits and consistent stages. The chosen side survives refresh through its URL. Relevant populated categories replace empty category chips.                                                                      |
| Companions           | Six distinct anatomical models and matching SVGs; species-specific personalities and meaningful three-stage changes. Owned companions, growth and active selection stay consistent across Collection, cards, viewer, Profile and worlds.                                                                                                |
| Biomes               | Same Meadow, Woodland and Misty Grove system. Larger, closer companions, grounded roots/feet and improved lighting. Personal worlds use actual owned species and current stages; browsing another world grants no ownership.                                                                                                            |
| Tasks                | Research questions, safety, effort, notes, category, site and project requirements remain functional. Repeat progress counts distinct instants at one named site. Eligible rewards grant once; completed task history survives later deletion.                                                                                          |
| Map                  | Record-derived pins, filters, chronological list, task focus and repeat visits retained. Long lists load incrementally while all eligible pins remain on the map. Failed street tiles preserve the labelled local schematic. Sensitive locations produce no observation pin.                                                            |
| Research             | Existing project/task builder, linked observations, species/date/method/review/uncertainty filters, repeat-site monitoring and full/example CSV preserved. Every researcher view uses one eligibility rule, including counts, detail, projects and exports. Tables start with 50 rows; exports include the complete filtered dataset.   |
| Consent and privacy  | Mandatory adult participation agreement remains, versioned to 1.1. New captures default private. Separate unchecked informed research permission creates a local receipt; withdrawal removes research visibility while retaining the journal and progress. Local data can be deleted from the agreement screen without accepting again. |
| Data continuity      | Storage key remains `nature-discovery-v1`. Valid IDs, observations, consents, XP and completed tasks migrate without reseeding duplication. Previously shared v1.0 records get labelled legacy receipts. Unknown/partial legacy metadata is labelled rather than fabricated.                                                            |
| Recovery             | Corrupt saved JSON is preserved, saving pauses, and a private recovery download plus explicit reset is offered. Route failures offer reload/Home. Scene/context failure offers honest illustrated fallback and retry.                                                                                                                   |
| Performance          | Discovery split into lazy scanner, recording, cards and observation modules. 3D remains lazy. Finite shared model geometry/materials; leaked bee-band buffers fixed. Balanced, Lightweight and Illustrated modes, persistent pause, live reduced-motion changes and offscreen/background suspension.                                    |
| Accessibility        | Named native dialogs, Escape dismissal and trigger-focus restoration; first keyboard stop is Skip to content; visible focus, semantic toggles, labels, live status, reduced motion and keyboard camera controls. Contrast corrected using rendered Axe results.                                                                         |

## Character overhaul

All new companion geometry and SVGs are original, code-authored procedural assets. There are no downloaded GLBs, remote textures or AI-generated raster characters. Existing bundled photographs and fonts retain their credits. Detailed structure and resource ownership are documented in [CHARACTER_ART.md](CHARACTER_ART.md).

| Companion   | Anatomy and silhouette                                                                                                  | Evolution                                                               |
| ----------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Pipwing     | Pear-shaped lorikeet body, blue crown, conforming rainbow bib, hooked bill, layered green wings, fan tail and bird toes | Longer flight/tail feathers, fuller crest and restrained mature accents |
| Bramblewisp | Compact fairywren body, fine bill, blue cheek mask and distinct long upright tail                                       | Increasing tail length, feather fan and cheek detail                    |
| Wattlet     | Curved botanical stem/root collar, asymmetric phyllodes, veined leaves, branching golden flower heads                   | Budding spray becomes branching flowering structure with wider roots    |
| Bumbloom    | Separate head/thorax/tapered blue-banded abdomen, six bent legs, two antennae and two pairs of veined translucent wings | Larger wings, fuller thoracic ruff and fictional pollen bundles         |
| Chuckleroot | Broad kookaburra head, long heavy bill, dark eye stripe, stout body, layered folded wings and barred tail               | Longer primary feathers, fuller barred tail and wider crest             |
| Mistleaf    | Irregular tapered trunk, radial branching roots, drooping lanceolate leaves and seed capsules                           | Shoot becomes branching sapling and wider mature canopy                 |

Plants have no human arms, hands, legs or feet. Their root collars remain grounded while supporting roots alternate with small recovering curls; canopies sway around stem junctions. This is a slow shuffle in place, not a human walk or a simulated travelling root system. Birds retain foot contact while making restrained head, tail and wing movements. The bee hovers and strokes its wings. Reduced motion holds a stable pose and keeps camera interaction available.

Curved sectional surfaces, tapered tubes, raised leaf midribs and conforming feather patches improve form. Matte feather/fuzz, waxier leaves, rough bark and translucent wings use a bounded palette. Warm key, cool fill and hemisphere illumination support the established aesthetic. Balanced graphics uses a 768 px variance shadow map and DPR cap 1.5; Lightweight uses DPR 1 and disables dynamic shadows. Camera buttons, drag/pinch and reset share bounded orbit controls. Mature Mistleaf is framed root-to-canopy. Portrait yaw reveals animal bills, wings, tails and the bee abdomen.

These remain stylised procedural prototype assets. They are not specialist-authored skeletal rigs, photorealistic species models, physics-based locomotion or identification evidence. No fungus or mammal exists in the six-species catalogue, so this pass does not invent one to satisfy example character classes.

## Verification

All commands listed below were executed successfully. Run browser suites sequentially with `npm.cmd run dev` active; PWA/performance also need the production preview. Tests use isolated browser contexts and fictional records, not the user's ordinary browser journal. Final visual checks recorded 35 route/viewport samples with zero overflow and zero runtime page errors, alongside the model/biome/error-state captures.

| Command                            | Verified scope                                                                                                                                                                                               |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npm.cmd run build`                | Strict TypeScript and production bundle; PWA generated. Lazy 3D size warning remains.                                                                                                                        |
| `npm.cmd run typecheck`            | Strict TypeScript check                                                                                                                                                                                      |
| `npm.cmd run format:check`         | Prettier source/test/README consistency; no ESLint configuration was introduced                                                                                                                              |
| `npm.cmd run test:unit`            | 16 consent, validation, deduplication, task, reward, feeding, deletion, permission, CSV and migration cases                                                                                                  |
| `npm.cmd run test:journey`         | Original scientific discovery, recording, collection, tasks, review/CSV, withdrawal, persistence and reset                                                                                                   |
| `npm.cmd run test:quality`         | Camera denial/cleanup, uploaded photo processing, one-time location, sensitive data and cross-tab changes                                                                                                    |
| `npm.cmd run test:upgrades`        | Map, all six actual 3D models, stage previews, growth, worlds, Community, project/task publication and monitoring                                                                                            |
| `npm.cmd run test:population`      | Shared 24-record demo, six companions, task-to-map-to-bee chain, image retention and no duplicate seeding                                                                                                    |
| `npm.cmd run test:responsive`      | 17 routes at 360×800, 375×812, 390×844, 430×932, 768×1024, 1280×800 and 1440×900; no document overflow or runtime page errors                                                                                |
| `npm.cmd run test:map-lifecycle`   | Twelve repeated map-entry, zoom, Map/List and exit cycles                                                                                                                                                    |
| `npm.cmd run test:accessibility`   | 22 rendered route/dialog states; zero Axe WCAG-tagged violations, including 200% desktop zoom equivalent reflow                                                                                              |
| `npm.cmd run test:privacy`         | New private-by-default capture, rapid/exact-event duplicate saves, explicit receipt, withdrawal and local deletion without re-consent                                                                        |
| `npm.cmd run test:stress`          | 0/1/20/100/500 observations, bounded views/full exports, 31 rapid flips, ten dialog cycles, upload/camera failures, partial/corrupt data, missing photos/tiles, cross-tab withdrawal and actual 3D lifecycle |
| `npm.cmd run test:pwa`             | Production manifest/icons/service worker, cached engine, offline shell/photo/map                                                                                                                             |
| `npm.cmd run test:performance`     | Three cold production samples per route, local lab LCP/CLS/interaction samples and software-WebGL diagnostics                                                                                                |
| `npm.cmd run test:visual`          | Final five-size captures, six models at stages 1/3, three biomes and failure states                                                                                                                          |
| `node tests/visual-comparison.mjs` | Four-pass linked comparison and contact sheet                                                                                                                                                                |

The original tests were also run before implementation. During this pass testing exposed mobile research-filter overflow, missing modal focus restoration, contrast/name mismatches, bee-band resource growth, stale reduced-motion preference and a rapid-save navigation race. Those issues were corrected and their relevant checks rerun. Automated accessibility is evidence for tested states, not a WCAG certification or a substitute for assistive-technology testing.

## Stress and privacy results

Dataset stress uses the existing **six catalogue species**, with up to **500 fictional observations**; it does not claim 500 different species. Journal/map/research counts agree. Research and journal tables initially render at most 50 observations, with incremental loading; a 500-record filtered CSV contains all 500 records plus the header. Sensitive locality and exact coordinates stay out of exports. Map keeps all non-sensitive recorded pins, with bounded place/list rows.

Uploads tested: zero bytes, corrupt image bytes, non-image, SVG, >15 MB, repeated same file, a 6000×60 image reduced to 1200×12, and overlapping uploads. Refresh during analysis cancels the pending navigation without generating a record. Selected photo/task/site draft data survives within the tab. Unsaved form text is not a complete autosaved draft.

Research tests exercise a private saved record, disabled submission until informed confirmation, receipt creation, withdrawal and a second tab's updated counts/export. Scientific records, XP and companion progress remain intact on permission withdrawal. The public Community schema contains only curated fictional game fields. All research access remains a local selector demonstration, not server-enforced authorisation.

The actual model stress warmed all six characters at three stages, then made **60 additional model switches**. Resident renderer geometries stayed **96 → 96**, textures **4 → 4**. Post-GC JS heap was **41,985,644 → 43,117,644 bytes** (about +1.08 MiB). This bounded short-run result is not a proof of an indefinite leak-free session. Context loss/retry, six scene exit/re-entry cycles, camera controls, all five requested viewport resizes, graphics modes, pause persistence and offscreen suspension passed without runtime page errors. Subsequent environment profiling also batched repeated objects and improved the timing probe: final samples retain visible stalls rather than dropping intervals over 500 ms. Use the final production measurements below for timing; the earlier stress probe is not directly comparable.

## Visual review and measurements

The four passes were reviewed as rendered images. The initial pass exposed 7–10 px labels, duplicated task access and generic plant/bee forms. Iteration 1 established the anatomy but exposed a clipped mature canopy, intersecting bird bib edges and small world characters. Iteration 2 fixed those shapes and scanner framing; responsive and Axe checks then caught mobile research-filter overflow and residual low-contrast labels. Final review checked the larger text, active mission, six matching SVG/3D identities, full root-to-canopy framing, animal yaw, readable protocol/project screens and preserved habitat composition after batching. The final comparison links full-resolution originals, not generated mockups.

Subjective scores use the requested categories. **H** hierarchy, **C** consistency, **T** typography, **S** spacing, **Cl** content clarity, **F** functionality, **R** responsive quality, **A** accessibility, **I** interaction polish, **P** professionalism. These are review aids, not user research or certification. Accessibility scores reflect rendered Axe and keyboard checks; assistive-technology testing remains outstanding.

| Major screen                     | H   | C   | T   | S   | Cl  | F   | R   | A   | I   | P   |
| -------------------------------- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Welcome / consent                | 8.5 | 9   | 8.5 | 8   | 9   | 9   | 8.5 | 8   | 8.5 | 8.5 |
| Home                             | 9   | 9   | 8.5 | 8.5 | 9   | 9   | 8.5 | 8   | 8.5 | 8.5 |
| Scan / identification            | 8.5 | 9   | 8.5 | 8.5 | 9   | 8.5 | 8.5 | 8   | 8.5 | 8.5 |
| Record discovery                 | 8.5 | 9   | 8.5 | 8   | 9   | 9   | 8.5 | 8   | 8.5 | 8.5 |
| Species / companion cards        | 8.5 | 9   | 8.5 | 8   | 8.5 | 9   | 8.5 | 8   | 8.5 | 8.5 |
| Collection                       | 8.5 | 9   | 8.5 | 8.5 | 8.5 | 9   | 8.5 | 8   | 8.5 | 8.5 |
| Tasks / protocol                 | 9   | 9   | 8.5 | 8.5 | 9   | 9   | 8.5 | 8   | 8.5 | 8.5 |
| Discovery map / visits           | 8.5 | 9   | 8.5 | 8.5 | 9   | 9   | 8.5 | 8   | 8.5 | 8.5 |
| Character / My World             | 8.5 | 9   | 8.5 | 8.5 | 8.5 | 8.5 | 8.5 | 8   | 7   | 8   |
| Community gallery                | 8.5 | 9   | 8.5 | 8.5 | 9   | 8.5 | 8.5 | 8   | 8.5 | 8.5 |
| Research / projects / monitoring | 8.5 | 9   | 8.5 | 8   | 9   | 9   | 8   | 8   | 8.5 | 8.5 |
| Contributions / Profile          | 8.5 | 9   | 8.5 | 8.5 | 9   | 9   | 8.5 | 8   | 8.5 | 8.5 |

| Model       | Anatomy | Silhouette | Geometry | Materials | Animation | Expression | 3D presentation | Consistency |
| ----------- | ------- | ---------- | -------- | --------- | --------- | ---------- | --------------- | ----------- |
| Pipwing     | 8.5     | 8          | 8        | 8         | 7         | 8          | 8.5             | 8.5         |
| Bramblewisp | 8.5     | 8.5        | 8        | 8         | 7         | 8          | 8.5             | 8.5         |
| Wattlet     | 8.5     | 8.5        | 8.5      | 8         | 7         | 8          | 8.5             | 8.5         |
| Bumbloom    | 9       | 8.5        | 8.5      | 8         | 7         | 8.5        | 8.5             | 8.5         |
| Chuckleroot | 8       | 8.5        | 8        | 8         | 7         | 8          | 8.5             | 8.5         |
| Mistleaf    | 8.5     | 8.5        | 8.5      | 8         | 7         | 8.5        | 8.5             | 8.5         |

The 8/10 target is **not claimed for live 3D animation/interaction** in the available software renderer. Distinct anatomy and presentation improved substantially, but smooth animation on real device GPUs remains unverified. Default headless Chromium also reported SwiftShader when checked without a forced software flag. Further hardware profiling and specialist animation/mesh work are the remaining steps; scores are not raised artificially to conceal that limit. Illustrated and paused views provide reliable presentation alternatives.

The production build reports **317.41 KB main JS / 99.11 KB gzip**, versus **508.64 / 161.65 KB** at baseline (about 38% smaller main chunk). Shared chunks also load, so this is not a claim that total JavaScript shrank by 38%. The lazy 3D chunk is **959.56 / 256.29 KB**, versus **938.53 / 249.62 KB** before the overhaul. The larger art/diagnostic module adds about 6.7 KB gzip. The final PWA cache has 37 entries, about 2.8 MiB, including the renderer for offline use.

Repeated static environment objects now use shared instanced batches while preserving positions, colours and character ownership. Measured draw calls (including shadows) changed as follows:

| Scene       | Balanced before → after | Lightweight before → after | Balanced triangles before → after |
| ----------- | ----------------------- | -------------------------- | --------------------------------- |
| Meadow      | 494 → 268               | 253 → 140                  | 242,922 → 133,626                 |
| Woodland    | 426 → 282               | 214 → 142                  | 177,952 → 115,024                 |
| Misty Grove | 165 → 121               | 84 → 62                    | 55,992 → 42,744                   |

These resource reductions are meaningful; they do not prove a corresponding frame-rate gain. Earlier measurements are retained in [before-environment-batching.json](../artifacts/performance/before-environment-batching.json). Software frame samples vary substantially and include stalls. Final lab route/scene tables are recorded with the measurement results. No Lighthouse audit, field INP result, network-throttled device benchmark or Core Web Vitals certification is claimed.

Final production samples used Windows, an i5-1135G7 CPU, 16 GB RAM, Node 23.5.0 and desktop Chromium at 390×844 / DPR 1. Network was localhost, with no network/CPU throttling. Service workers were blocked for cold application samples; the separate PWA test verifies offline caching. Each route has three fresh-context samples. Route motion was reduced; 3D scene samples were animated. Median values:

| Route        | Heading ready, ms | Lab LCP, ms | CLS     | Encoded JS, KB |
| ------------ | ----------------- | ----------- | ------- | -------------- |
| Home         | 144               | 144         | 0.00108 | 121.0          |
| Scan         | 428               | 444         | 0.00006 | 126.2          |
| Collection   | 170               | 168         | 0.00069 | 121.0          |
| Tasks        | 124               | 120         | 0.00007 | 121.0          |
| Map          | 420               | 436         | 0       | 172.8          |
| Species card | 419               | 428         | 0.00003 | 167.3          |
| Research     | 433               | 432         | 0.02576 | 179.8          |

Automation wall-clock interaction samples were 55 ms for task details, 85 ms for Map → journal and 43 ms for a card flip. These include automation overhead and are not field INP. No scene-engine module was requested by these cold route contexts; the normal production service worker intentionally precaches it in the background for offline use.

Animated scenes used **SwiftShader**, not a hardware phone GPU. After a 1.2-second warm-up, three 1.1-second probe windows were sampled. The table reports the median of those interval means, retaining visible stalls. Initial scene-ready time was 1,511 ms for Pipwing and 2,081 ms for Meadow. These diagnostic intervals are poor and noisy; Lightweight does not consistently improve software timing even though it cuts draw calls. Smooth hardware rendering is an open validation item.

| Scene       | Balanced interval, ms | Lightweight interval, ms |
| ----------- | --------------------- | ------------------------ |
| Pipwing     | 135.17                | 209.24                   |
| Meadow      | 344.20                | 288.47                   |
| Woodland    | 133.87                | 145.31                   |
| Misty Grove | 97.00                 | 66.11                    |

The final measurement run recorded zero runtime page errors. Full individual samples, geometries/textures, triangle counts, bundle bytes and environment details remain in `artifacts/performance/results.json`.

## Architecture and dependencies

- `src/domain.ts`: pure shared rules for scientific validity, eligibility, ownership and rewards.
- `src/store.ts`: typed repository, stable demo IDs, migrations, receipts and redacted CSV projection.
- `src/scanner.tsx`, `record.tsx`, `cards.tsx`, `observations.tsx`: focused lazy routes; `discovery.tsx` retains compatible re-exports.
- `src/research-permission.tsx`, `recovery.tsx`: informed submission, receipts, withdrawal and non-destructive recovery.
- `src/companion-models.tsx`, `Art.tsx`, `companion-data.ts`: six reusable 3D/SVG identities, stages and personalities.
- `src/scene.tsx`, `scene-canvas.tsx`: lazy renderer, graphics preferences, visibility/motion lifecycle, context recovery, camera and diagnostics.
- `src/pages.tsx`, `worlds.tsx`, `observation-map.tsx`, `research.tsx`, `research-projects.tsx`, `participation.tsx`, `ui.tsx`, `polish.css`: refinement within the existing product structure.
- New development dependencies: `@axe-core/playwright` and `prettier`. No new production dependency. Existing Three/R3F/Drei stack is retained.

## Remaining limits and severity

| Severity / scope     | Remaining limit                                                                                                                                                                                                                                                                   |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1 before production | No authenticated researcher service, secure backend/object storage, server-enforced permissions, real transmission or validated AI. Governance, retention, consent language and age safeguards require a real project review. These are explicit prototype boundaries.            |
| P2                   | `localStorage` has limited capacity and is not encrypted; large collections with many photos can exhaust quota. Writes across genuinely simultaneous tabs are not transactional: last writer wins. Sequential cross-tab updates are tested.                                       |
| P2                   | No physical iPhone/Android GPU, Safari, real camera/geolocation permission or Home Screen installation testing in this pass. Desktop software-WebGL and zoom-equivalent automation do not establish device performance, screen-reader usability or native browser zoom behaviour. |
| P2                   | Lazy 3D engine remains approximately 256 KB gzip. The production offline cache includes it intentionally. Lightweight/Illustrated modes help, but a long-session/mobile performance budget needs hardware testing.                                                                |
| P2                   | Photo/task/site draft survives refresh; unsaved text in the recording form does not. The save flow preserves persisted records and blocks false success on storage failure.                                                                                                       |
| P3                   | Procedural movement is in place; no skeletal rigging, travelling root gait, pathfinding, physics or production animation transitions. Worlds retain simple stylised environment geometry.                                                                                         |
| P3                   | Catalogue is six species and three biomes. Scientific uncertainty/review are explicitly demo states; counts are positive sightings and do not establish abundance, biodiversity trends or conservation outcomes.                                                                  |

## Run next time

Open PowerShell and keep it open while using Wilsee:

```powershell
Set-Location -LiteralPath 'C:\Users\abhin\OneDrive\Documents\Faund'
npm.cmd run dev
```

Open **http://localhost:5173/**. Port 5173 is configured in the script; no forwarded port argument is needed. Rebooting stops the server. First-time dependency setup, port troubleshooting, phone access and production preview instructions are in [README.md](../README.md).
