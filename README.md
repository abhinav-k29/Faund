# Wilsee

A working mobile-first biodiversity discovery and research prototype, formerly Faund. Wilsee preserves the existing nature aesthetic, routes and local records.

The core journey is **Explore → Photograph / demo sample → Identify → Record privately → Learn → Collect → Choose a research contribution**. It includes a private observation map, two-sided cards, six original volumetric 3D companions, three interactive biomes, fictional Community Worlds and research project/task building.

The five navigation items are **Home | Map | Scan | Collection | Explore**. **Tasks** has a prominent active-mission shortcut near the Home greeting and a link in Explore; it remains a core research feature. The previous species/habitat browser is preserved at **`/field-guide`**. **`/ecosystem`** opens the upgraded My World experience.

## Start the app after restarting the laptop

The app runs on a local development server. Shutting down or restarting the laptop stops that server. Opening a saved browser link does not start it again.

Every time you want to use the app:

1. Open **Windows Terminal → PowerShell** (or a PowerShell terminal in VS Code).
2. Copy and run these two commands:

   ```powershell
   Set-Location -LiteralPath 'C:\Users\abhin\OneDrive\Documents\Faund'
   npm.cmd run dev
   ```

3. Wait until the terminal shows **Local: http://localhost:5173/**, then open that address in your browser.
4. **Keep that terminal open while using the app.** The command keeps running; it does not return to the PowerShell prompt. Closing the terminal or pressing **Ctrl+C** stops the server.

Port **5173** is now set in `package.json`. You do not need to add `-- --port 5173` or a bare `5173` to the command. The server reports an error if that port is occupied instead of silently changing the URL. Use **`npm.cmd`** on Windows PowerShell to avoid the `npm.ps1` execution-policy problem; no execution-policy change is needed.

### First-time setup only

Use Node 22.12+, npm, and a modern browser. For a new copy of the project, or if the `node_modules` folder is missing, run:

```powershell
Set-Location -LiteralPath 'C:\Users\abhin\OneDrive\Documents\Faund'
npm.cmd install
npm.cmd run dev
```

You do not need to reinstall dependencies or run a production build after each reboot.

### If it does not open

| What you see                                              | What to do                                                                                                                                                                              |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm.ps1 cannot be loaded` / scripts are disabled         | Use `npm.cmd run dev`, exactly as above.                                                                                                                                                |
| `Could not read package.json` / `ENOENT`                  | Run the `Set-Location` command above first. The terminal must be in this project's folder.                                                                                              |
| `vite` is not recognised or a dependency is missing       | Run `npm.cmd install` in the project folder, then `npm.cmd run dev`.                                                                                                                    |
| Browser says it cannot connect / `ERR_CONNECTION_REFUSED` | Check that the server terminal is still open and shows the Local URL. Start it with the two commands above.                                                                             |
| `Port 5173 is already in use`                             | Open http://localhost:5173/ first: the app may already be running. If an old prototype server is running, stop it with **Ctrl+C in its own terminal**, then run `npm.cmd run dev` once. |
| Browser shows `404 Not Found`                             | An incorrectly started Vite server may be treating a bare `5173` as a folder name. Stop that server with **Ctrl+C**, then run `npm.cmd run dev` from the project folder.                |

If the port is occupied and you cannot find its terminal, these **read-only** PowerShell commands identify the process:

```powershell
$previewListeners = Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue
$previewListeners | Select-Object LocalAddress, LocalPort, OwningProcess
$previewListeners | ForEach-Object {
    Get-CimInstance Win32_Process -Filter "ProcessId=$($_.OwningProcess)"
} | Select-Object ProcessId, Name, CommandLine
```

The prototype's command line should point into this project's `node_modules\vite` folder. Stop only the identified prototype process through Task Manager if its terminal is unavailable; leave unrelated processes running. Then start the app again using the two commands above.

No API keys, account, database or paid service is needed. Complete the participation agreement using the adult demonstration profile. **Demo Explorer is selected by default** and populates the app immediately after affirmative consent. Choose **Fresh Explorer** on that screen for an empty journal. Existing saved explorers are preserved. Profile also offers **Load Demo Explorer**.

## Phone access

1. Keep the server running and connect the iPhone and computer to the same Wi-Fi.
2. Run `ipconfig` on the computer and find the IPv4 address for the Wi-Fi adapter.
3. Open `http://<computer-ip>:5173/` in Safari. At verification the Wi-Fi address was `10.4.96.65`, so the address was http://10.4.96.65:5173/. IP addresses can change.
4. If it cannot connect, check the private-network firewall rule and whether the network isolates clients. Do not disable the firewall. A personal hotspot can be a useful alternative.

Ordinary LAN HTTP supports the demo selector and file/photo input. Live `getUserMedia` and device geolocation generally require HTTPS (localhost is a special exception). Browser photo capture support varies by device. No camera access is needed for a presentation.

## PWA and deployment

```powershell
npm run build
npm run preview -- --port 4173
```

`dist/` is a static production build, with a generated web manifest, service worker, 192/512 PNG icons, Apple touch icon, standalone display settings and safe-area CSS. App shell, downloaded photographs and local fonts are precached. Offline use requires a successful first visit to the production build. The development server does not enable the service worker.

Deploy `dist/` to an HTTPS static host such as Netlify, Cloudflare Pages or Vercel, with all client routes falling back to `/index.html`. A `_redirects` file is provided for compatible hosts. No server secrets or backend configuration are needed. Then open the HTTPS address in iPhone Safari, tap Share → **Add to Home Screen**, and launch the icon. iOS system UI may remain visible. The site has not been published to an external host in this task.

## Demonstration routes

| Route                    | Purpose                                                                          |
| ------------------------ | -------------------------------------------------------------------------------- |
| `/`                      | Welcome and quick tour                                                           |
| `/consent`               | Required adult participation agreement                                           |
| `/home`                  | Discovery action, ecosystem and contribution summary                             |
| `/map`                   | Private geographic observation map, filters and date-grouped list                |
| `/field-guide`           | Preserved species and habitat browser                                            |
| `/character/3`           | Rotate, zoom, reset, preview evolution and feed Bumbloom                         |
| `/explore`               | Meadow, Woodland and Misty Grove; My World / Community                           |
| `/community/whisperwood` | A curated fictional public-world preview                                         |
| `/scan`                  | Camera, photo input, six demo samples                                            |
| `/identify/0`            | Suggested identification, alternatives and uncertainty                           |
| `/record/0`              | Structured observation form                                                      |
| `/card/0`                | Real species / companion 3D card                                                 |
| `/collection`            | Searchable private species and character collection                              |
| `/ecosystem`             | Preserved direct entry to Explore → My World                                     |
| `/tasks`                 | Research and exploration tasks                                                   |
| `/contributions`         | Observation details, corrections and deletion                                    |
| `/sites`                 | Repeat visits, timelines and concept comparison slider                           |
| `/profile`               | Achievements, consent review/withdrawal and demo controls                        |
| `/researcher-demo`       | Dataset, filters, charts, review, CSV, projects/task builder and site monitoring |
| `/showcase`              | Existing compositions plus Map, 3D Character, Worlds, Community and Projects     |

Species IDs are 0–5. Browsing a field-guide card does not add an observation.

For a short pitch: accept consent with Demo Explorer selected → Collection / six species and Characters → Home / Tasks / Pollinator Watch / Take Me There → Map / highlighted area and visit details → Start Task Here → Scan / bee field entry / Analyse Bee Sample → confirm → record → flip the bee card → Inspect Bumbloom in 3D → Visit in My World → feed Growth XP → Community / fictional world → researcher dashboard / Research Projects. Demo mode contains **24 explicitly fictional observations at eight plausible Sydney public areas**, with distinct notes, dates, methods, uncertainties and review states. It includes six owned companions, separate Growth XP and three populated biomes. Urban Tree Watch and Bird Spotter are completed; Pollinator Watch has four of five same-site visits. A previously collected species creates another sighting rather than a first-time unlock; choose Fresh Explorer to demonstrate the initial reveal.

In **Research Projects**, create a project and publish a task with a question, target category, protocol, region, effort, safety instructions, notes/site requirements and number of distinct visits. Open it in mobile Tasks and record the required observations. They retain project/task/site/consent links. Repeat-task progress counts distinct observation timestamps at the same named site. Inspect linked records, use species/date/identification-uncertainty filters, and open **Site Monitoring**. **Export CSV** downloads the current view; **Example Dataset** exports only seeded demonstration records in that view.

## Data and consent

The local repository (`src/store.ts`) separates consent, scientific observations, sites, task protocols and game progress. Shared rules in `src/domain.ts` validate observations, prevent duplicate event/reward grants, reconcile deleted ownership and select research-eligible records. Saved observations reference a versioned agreement, contributor pseudonym, identification status, review status, provenance and method. The most recent agreement controls participation. Withdrawal blocks saving and research access. Existing v1.0 explorers review v1.1 while retaining their records and progress.

New observations default to the **private journal**. Separate, unchecked informed permission at capture or in **My Contributions → Review Research Submission** creates a local receipt. **Withdraw This Research Permission** removes the observation from researcher counts, details, project links and exports while retaining the journal and game progress. Demo Explorer has 24 fictional records: 23 submitted examples and one private example. Legacy records previously shared under v1.0 retain an explicitly labelled legacy receipt. The mandatory participation agreement remains required. The researcher route is a **demonstration role**, accessible without real authentication; this is local UI eligibility, not a production security boundary. Local storage is not encrypted.

Photos are resized and re-encoded through canvas, removing source EXIF. They are saved locally in browser storage with records. Inputs are limited to 15 MB and resized to 1200 px; browser storage capacity remains limited (commonly a few MB). Quota failures are reported before advancing the save flow. A production repository should move photos to IndexedDB / secure object storage. No photos or geolocation are sent to an external service. Device location is requested only by an explicit one-time action. Exports omit exact coordinates entirely and withhold sensitive localities. Sensitive photos and free-text notes are withheld from the demo researcher detail view. Free text must not contain personal or confidential data.

CSV uses concepts such as occurrenceID, eventDate, scientificName, coordinateUncertaintyInMeters, samplingProtocol and basisOfRecord. Only positive sightings are recorded; the app does not misrepresent non-detections as species occurrences. No GeoJSON export is implemented.

## Map, 3D and game-data boundaries

The Leaflet map derives every observation pin and list entry from actual local records, grouping repeat sites. Sensitive records have no geographic pin and their list locality is withheld; records without coordinates remain in List. Coordinates are never invented from a location description. Task links use `/map?focus=site-b&task=pollinator` to highlight a recommended area and open existing visits. A recommended area without observations appears as an area circle, never a fabricated observation marker. Starting there retains the task and named site through recording. This is map focus, with no live directions or invented walking times. A local geographically anchored Sydney schematic works offline and is labelled **not for navigation**. Optional OpenStreetMap street tiles require an explicit action and internet access, display attribution, and reveal the viewed tile area to the tile provider. No observation payload is sent. External tiles are disabled while sensitive records are in the filtered view. No analytics or background tracking is enabled.

The six companions use **procedural 3D geometry**: Pipwing, Bumbloom, Wattlet, Bramblewisp, Chuckleroot and Mistleaf. Plants use curved stems/trunks, leaves and supporting root tendrils; birds have distinct bills, wings and tails; the bee has six legs and four wings. All three stages have structural changes and matching SVG portraits. The lazy React Three Fiber / Three.js renderer needs no remote models. **Graphics** offers Balanced 3D (DPR ≤1.5), Lightweight 3D (DPR 1, no dynamic shadows) and Illustrated. Camera buttons support keyboard rotation/zoom. Pause, reduced motion, offscreen suspension and context-loss fallback are implemented. Add `?fallback=1` to demonstrate recovery artwork. See [companion art notes](docs/CHARACTER_ART.md).

Lifetime Explorer XP stays in the existing `xp` field. Spendable `game.availableGrowthXP` and per-character growth are separate. Feeding costs ten Growth XP, cannot overdraw, never lowers Explorer level, and never changes scientific records or review state. Stage selectors preview fictional evolution without granting ownership or growth. Existing browser data uses the **same storage key**, with migration defaults preserving consent, observations, completed tasks and XP.

Community Worlds are three curated fictional examples. Their explicit public-game type has no location, observation photograph, date, consent or research fields. Public scenes accept only character IDs/stages and a biome. They cannot display private scientific records. Appreciations are saved locally; viewing a guest companion does not unlock it. There is no real publishing, social account system or exchange/trading implementation.

## Functional and simulated features

Functional: navigation, consent gates and withdrawal, camera integration and fallback, local photo processing, structured recording, duplicate sightings, uncertain records, collection, flip/reveal, XP, one-time task rewards, three visual companion stages, ecosystem, site timeline, task editing/publication, record review/correction/deletion, filters, charts, CSV and reset.

Simulated: identification (selected example, never image classification), researcher identity/permissions, expert review, research transmission, scientific project activity and vegetation-change interpretation. The comparison slider uses clearly labelled artwork rather than actual before/after field photographs. No authentication, backend, live nearby species, research integration or legal certification exists. Guardian consent is a concept only and minors cannot activate participation. No conservation outcomes or research partnerships are asserted.

For a clean start choose Profile → **Fresh Explorer · Reset Demo**. This removes this app’s local observations, photos, consent and game state and remembers the explicit Fresh Explorer choice through the next consent/reload. **Load Demo Explorer** replaces progress with labelled sample records while preserving consent. An empty Home also offers a direct Load Demo Explorer action. Seed dates are fixed in September/October 2026 for repeatable presentations; relative journal headings use the current date and may change over time.

## Verification and screenshots

With the dev server running:

```powershell
npx playwright install chromium
npm run test:journey
npm run test:quality
npm run test:population
npm run test:upgrades
npm run test:responsive
npm run test:unit
npm run test:accessibility
npm run test:privacy
npm run test:stress
npm run test:visual
npm run format:check
```

The original scientific-flow journey and camera/privacy quality tests remain. The upgrade suite additionally checks migration, map/list/filter consistency, all six rendered 3D models, drag/reset, evolution previews, feeding persistence and data isolation, biomes, fictional Community boundaries, project/task publication, linked repeated observations and example exports. Layout checks cover 375×812, 390×844, 430×932 and 1440×900. The core journey uses the SVG fallback to stay independent of GPU availability; the upgrade suite tests actual WebGL separately, then closes that browser before its research-data phase. Run suites sequentially on memory-constrained machines.

Actual screenshots **14–24** cover the map, scanner, cards, 3D viewer, Meadow, Community and research tools. **25–30** document the populated Home, both Collection tabs, task-focused map, bee field entry and chronological map journal. Earlier assets remain available. Source checkpoints are **`checkpoints/before-worlds-upgrade.zip`** and **`checkpoints/before-population-polish.zip`**; they exclude dependencies and caches. See `docs/POPULATION_NOTES.md` for this pass.

The Wilsee audit captures **1440×900, 1280×800, 768×1024, 390×844 and 360×800**. [Four-pass visual comparison](artifacts/visual-audit/comparison.html) links original screenshots; [quality report](docs/WILSEE_QUALITY_REPORT.md) records changes, test results, resource measurements and remaining limits. The new checkpoint is `checkpoints/before-wilsee-overhaul.zip`. Stress datasets use up to 500 fictional observations against the existing six-species catalogue.

`tests/pwa.mjs` tests the production build’s manifest, service worker and offline reload when a preview server runs at port 4173. `npm.cmd run test:performance` also needs that preview server and records local production lab samples. Run `npm.cmd run build`, then `npm.cmd run preview -- --port 4173 --strictPort` in another terminal first. Automated checks use desktop Chromium. Physical iPhone Safari, actual device camera permissions, geolocation, assistive technology and Home Screen installation still need manual verification.

## Source organisation

- `src/config.ts`: replaceable label, storage key, consent version and demo pseudonym.
- `src/store.ts`: types, local repository, consent enforcement, demo seeding, task progress and CSV projection.
- `src/data.ts`: six educational species records and source links.
- `src/Art.tsx`: original vector characters and landscape.
- `src/participation.tsx`: welcome, consent and profile.
- `src/domain.ts`: shared scientific validation, event/reward idempotency, ownership and permission rules.
- `src/scanner.tsx`, `src/record.tsx`, `src/cards.tsx`, `src/observations.tsx`: lazy discovery routes; `src/discovery.tsx` keeps named re-exports for compatibility.
- `src/research-permission.tsx`, `src/recovery.tsx`: submission receipts, withdrawal, route and storage recovery.
- `src/pages.tsx`: home, explore, collection, ecosystem, tasks, sites.
- `src/research.tsx`: researcher dashboard and showcase.
- `src/research-projects.tsx`: project/task builder and research site monitoring.
- `src/observation-map.tsx`, `public/sydney-map.svg`: private Leaflet map and offline schematic.
- `src/scene.tsx`, `src/scene-canvas.tsx`, `src/companion-models.tsx`: lazy renderer, six procedural models, habitats, camera, graphics settings and fallback.
- `src/companion-data.ts`: distinct personalities and stage labels, consistently used across views.
- `src/worlds.tsx`, `src/community-data.ts`: personal progression and isolated fictional public worlds.
- `src/scan-analysis.tsx`: clearly scripted identification stages.
- `src/bee-panel.tsx`: visible bee field entry, comparison guidance and discovery actions.
- `src/upgrades.css`, `src/polish.css`: additions and refinements to the existing design system.
- `src/ui.tsx`, `src/style.css`: shared UI and central design tokens.

React, TypeScript, Vite, React Router, Lucide, Motion, Three.js, React Three Fiber, Drei, Leaflet, plain token-based CSS, vite-plugin-pwa and Playwright. Font and photo assets are bundled locally; attribution is in `IMAGE_CREDITS.md` and `/credits`. Outfit and Fraunces use the SIL Open Font License. See `docs/UPGRADE_NOTES.md` for the file-by-file upgrade record.

## Next development steps

Production priorities are study governance and protocols, verified researcher authentication and permissions, secure backend repositories, protected photo storage, consent/retention handling, guardian pathways, identification review, validated geospatial records and accessible device testing. Later integrations could include Atlas of Living Australia or GBIF; none is connected here. More species, educational quizzes, habitat learning progress and task-specific survey/event models would extend the prototype. See `docs/PRODUCT_OVERVIEW.md` for proposal-ready context.
