# Wilsee refinement audit — 23 October 2026

This work extends the existing React 19 / TypeScript / Vite 8 application, React Router routes, local repository, Leaflet map and lazy React Three Fiber / Three.js scenes. It retains the ivory, forest, lime, coral and lavender visual identity and the Home / Map / Scan / Collection / Explore navigation.

## Baseline evidence

- Git working tree was clean at inspection. Recoverable source/assets archive: `checkpoints/before-wilsee-overhaul.zip` (no dependencies, environment files or browser data).
- `npm.cmd run build`, `test:journey`, `test:quality`, and `test:upgrades` passed before changes. Type checking is part of the production build. No linter was configured.
- Vite warned that the lazy 3D engine exceeds 500 KB minified. Baseline scene: 938.53 KB / 249.62 KB gzip; main: 508.64 KB / 161.65 KB gzip. This is a warning, not a build failure.
- `node tests/visual-audit.mjs before` captured five sizes (1440×900, 1280×800, 768×1024, 390×844, 360×800), six models at two stages, three biomes, cards, modal, camera failure and missing image. Zero runtime page errors. Results and route timing samples are in `artifacts/visual-audit/before/results.json`.
- The application is a local frontend prototype. AI inference, researcher identity, scientific review, real research transmission and public social publishing are not implemented. Camera, upload, local storage, card/game progression, map, project/task building, filtering and CSV are functional.

## Product inventory

| Area / routes                       | Existing functional foundation                                                 | Main finding                                                                                                                                |
| ----------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Welcome, consent, Profile           | Affirmative adult participation, decline, withdrawal, demo/fresh/reset         | Temporary branding and dense wording; research scope needs explicit per-record permission under the latest brief                            |
| Home                                | Shared statistics, illustrated world, scan link, tasks, recent discovery       | Tasks repeated in three places while the active mission sits below the main world                                                           |
| Scan, Identify, Record, Unlock      | Camera/upload/fallback, clear scripted bee analysis, unknown records, metadata | Uploaded image retained, but asynchronous upload/rapid save races need guards and validation belongs in domain functions                    |
| Cards, Collection, Field Guide      | Real/fantasy flip, six species and companions, search/category filters         | Tiny 7–10 px labels; irrelevant empty categories; most SVG companions share one silhouette                                                  |
| Character, Explore, Ecosystem alias | Actual WebGL, stages, Growth XP, biome ownership, fallback                     | Plants resemble bipeds; sphere-based forms and identical facial language; viewer lacks explicit quality/pause/context-loss recovery         |
| Community                           | Curated fictional public-game data only                                        | Boundary is sound and must remain narrow                                                                                                    |
| Map, Sites                          | Record-derived pins, dates/category/search, task focus, repeat timelines       | 500-record rendering needs bounds; sensitive data should never produce destination guidance                                                 |
| Contributions                       | History, review state, correction, delete                                      | No separate submission receipt; deleting last discovery leaves hidden game ownership data                                                   |
| Researcher, Projects, Monitoring    | Filters/charts, editable protocols, review, sample/full CSV                    | Accepted consent alone currently controls access; withdrawn/private permissions need one shared selector across counts, details and exports |
| Showcase, Credits                   | Presentation panels, local licensed assets and sources                         | Temporary branding; source documentation must match revised behaviour                                                                       |

## Priorities and actions

| Priority | Finding                                                                    | Action                                                                                                                                                                      |
| -------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P0       | Research views can include records merely linked to any accepted agreement | Mandatory participation remains; new records default private, separate informed research confirmation creates receipt, all research views use a shared eligibility selector |
| P0       | Double saves and UI-only reward checks can grant inconsistent progress     | Central validation, idempotent event saves, one-time eligible reward function, explicit progression tests                                                                   |
| P0       | Deletion leaves orphaned companion/world state                             | Central deletion reconciles ownership and active companion; earned task history and lifetime XP remain historical                                                           |
| P0       | Malformed stored JSON can be overwritten by an empty state                 | Recovery mode preserves original data, blocks writes, offers private download and explicit reset                                                                            |
| P1       | Active tasks are below duplicated links and decorative content             | One compact active mission near Home greeting; clear routes retained                                                                                                        |
| P1       | Small labels/targets, unnamed dialogs, card toggle state                   | Readable type scale, named dialogs, semantic state, keyboard/focus/reduced-motion checks, Axe audit                                                                         |
| P2       | Humanoid plants, generic silhouettes, four-leg bee                         | Curved botanical anatomy/root motion, six-leg insect, three distinct bird forms, matching SVGs and meaningful stages                                                        |
| P3       | Long observation tables and histories render every item                    | Incremental display/pagination with full filtered export; stress 0/1/20/100/500 records                                                                                     |
| P3       | 3D load/context failure and lifecycle need deeper coverage                 | Explicit fallback/retry and quality controls, 50-switch test, resource and timing measurements                                                                              |
| P4       | One screenshot pass is inadequate                                          | Before → iteration-1 → iteration-2 → final captures, actual visual critiques, contact-sheet comparison and transparent release report                                       |

Final rendered review, scorecards, executed checks, measurements and remaining limits are recorded in [WILSEE_QUALITY_REPORT.md](WILSEE_QUALITY_REPORT.md).
