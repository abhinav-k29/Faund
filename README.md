# Nature Discovery

A working mobile-first biodiversity discovery and research prototype. **Nature Discovery is a development placeholder**, not a final startup name. Change `src/config.ts` to rename the UI and PWA manifest.

The core journey is **Explore → Photograph / demo sample → Identify → Record → Learn → Collect → Research dataset**. The existing design and scientific workflow are preserved. The upgrade adds a private observation map, premium card previews, six original volumetric 3D companions, three interactive biomes, fictional Community Worlds and research project/task building.

The five navigation items are **Home | Map | Scan | Collection | Explore**. **Tasks** has prominent Home shortcuts and a link in Explore; it remains a core research feature. The previous species/habitat browser is preserved at **`/field-guide`**. **`/ecosystem`** opens the upgraded My World experience.

## Run

Use Node 22.12+, npm, and a modern browser.

```powershell
npm install
npm run dev -- --port 5173
```

Open http://localhost:5173/. The dev server binds to all interfaces. No API keys, account, database or paid service is needed. Complete the participation agreement using the adult demonstration profile. In Profile, choose **Load Demo Explorer** for populated sample records. This requires prior affirmative consent.

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

| Route              | Purpose                                                   |
| ------------------ | --------------------------------------------------------- |
| `/`                | Welcome and quick tour                                    |
| `/consent`         | Required adult participation agreement                    |
| `/home`            | Discovery action, ecosystem and contribution summary      |
| `/map`             | Private geographic observation map, filters and date-grouped list |
| `/field-guide`     | Preserved species and habitat browser |
| `/character/3`     | Rotate, zoom, reset, preview evolution and feed Bumbloom |
| `/explore`         | Meadow, Woodland and Misty Grove; My World / Community |
| `/community/whisperwood` | A curated fictional public-world preview |
| `/scan`            | Camera, photo input, six demo samples                     |
| `/identify/0`      | Suggested identification, alternatives and uncertainty    |
| `/record/0`        | Structured observation form                               |
| `/card/0`          | Real species / companion 3D card                          |
| `/collection`      | Searchable private species and character collection       |
| `/ecosystem`       | Preserved direct entry to Explore → My World |
| `/tasks`           | Research and exploration tasks                            |
| `/contributions`   | Observation details, corrections and deletion             |
| `/sites`           | Repeat visits, timelines and concept comparison slider    |
| `/profile`         | Achievements, consent review/withdrawal and demo controls |
| `/researcher-demo` | Dataset, filters, charts, review, CSV, projects/task builder and site monitoring |
| `/showcase`        | Existing compositions plus Map, 3D Character, Worlds, Community and Projects |

Species IDs are 0–5. Browsing a field-guide card does not add an observation.

For a short pitch: accept consent → Profile / Load Demo Explorer → Map / select a place → Scan / Analyse Bee Sample → confirm → record → Collection / flip the bee card → Inspect Bumbloom in 3D → Explore / Meadow → feed Growth XP → Community / inspect a fictional world → Home / Tasks → researcher dashboard / Research Projects. Demo mode now contains **18 explicitly fictional observations at six plausible Sydney public areas**, with repeat visits, all six species, varied dates, methods, uncertainties and review states. It includes six companions, separate Growth XP and populated biomes. A previously collected species creates another sighting rather than a first-time unlock; use Fresh Explorer to demonstrate the initial reveal.

In **Research Projects**, create a project and publish a task with a question, target category, protocol, region, effort, safety instructions, notes/site requirements and number of distinct visits. Open it in mobile Tasks and record the required observations. They retain project/task/site/consent links. Repeat-task progress counts distinct observation timestamps at the same named site. Inspect linked records, use species/date/identification-uncertainty filters, and open **Site Monitoring**. **Export CSV** downloads the current view; **Example Dataset** exports only seeded demonstration records in that view.

## Data and consent

The local repository (`src/store.ts`) separates consent, scientific observations, sites, task protocols and game progress. Saved observations reference a versioned consent record, contributor pseudonym, identification status, review status, provenance and observation method. The most recent consent decision controls participation. Withdrawal blocks future participation. Previous records remain locally accessible for correction/deletion through the researcher demonstration; this illustrates retention, not production legal policy.

Every saved observation enters both private history and the local authorised research dataset under the agreement. There is no second optional sharing switch. The researcher route is a **demonstration role**, accessible without real authentication; it is not a secure access-control boundary. Local storage is not encrypted. Use sample data, not confidential field observations.

Photos are resized and re-encoded through canvas, removing source EXIF. They are saved locally in browser storage with records. Inputs are limited to 15 MB and resized to 1200 px; browser storage capacity remains limited (commonly a few MB). Quota failures are reported before advancing the save flow. A production repository should move photos to IndexedDB / secure object storage. No photos or geolocation are sent to an external service. Device location is requested only by an explicit one-time action. Exports omit exact coordinates entirely and withhold sensitive localities. Sensitive photos and free-text notes are withheld from the demo researcher detail view. Free text must not contain personal or confidential data.

CSV uses concepts such as occurrenceID, eventDate, scientificName, coordinateUncertaintyInMeters, samplingProtocol and basisOfRecord. Only positive sightings are recorded; the app does not misrepresent non-detections as species occurrences. No GeoJSON export is implemented.

## Map, 3D and game-data boundaries

The Leaflet map derives every pin and list entry from actual local observation records, grouping repeat sites. Records without coordinates remain in List; coordinates are never invented from a location description. A local geographically anchored Sydney schematic works offline and is labelled **not for navigation**. Optional OpenStreetMap street tiles require an explicit action and internet access, display attribution, and reveal the viewed tile area to the tile provider. No observation payload is sent. External tiles are disabled while sensitive records are in the filtered view. No analytics or background tracking is enabled.

The six companions are **real procedural 3D geometry**, not images on planes: Pipwing, Bumbloom, Wattlet, Bramblewisp, Chuckleroot and Mistleaf. The renderer is lazy-loaded React Three Fiber / Three.js with Drei orbit controls. Geometry is reusable across the viewer and biomes; no GLB files or remote model service is needed. Pixel ratio is capped at 1.5; rendering pauses offscreen/in background, and idle movement respects reduced motion. The original SVG art is retained as a clearly labelled fallback when WebGL2 is unavailable. Add `?fallback=1` to a character page to demonstrate it.

Lifetime Explorer XP stays in the existing `xp` field. Spendable `game.availableGrowthXP` and per-character growth are separate. Feeding costs ten Growth XP, cannot overdraw, never lowers Explorer level, and never changes scientific records or review state. Stage selectors preview fictional evolution without granting ownership or growth. Existing browser data uses the **same storage key**, with migration defaults preserving consent, observations, completed tasks and XP.

Community Worlds are three curated fictional examples. Their explicit public-game type has no location, observation photograph, date, consent or research fields. Public scenes accept only character IDs/stages and a biome. They cannot display private scientific records. Appreciations are saved locally; viewing a guest companion does not unlock it. There is no real publishing, social account system or exchange/trading implementation.

## Functional and simulated features

Functional: navigation, consent gates and withdrawal, camera integration and fallback, local photo processing, structured recording, duplicate sightings, uncertain records, collection, flip/reveal, XP, one-time task rewards, three visual companion stages, ecosystem, site timeline, task editing/publication, record review/correction/deletion, filters, charts, CSV and reset.

Simulated: identification (selected example, never image classification), researcher identity/permissions, expert review, research transmission, scientific project activity and vegetation-change interpretation. The comparison slider uses clearly labelled artwork rather than actual before/after field photographs. No authentication, backend, live nearby species, research integration or legal certification exists. Guardian consent is a concept only and minors cannot activate participation. No conservation outcomes or research partnerships are asserted.

For a clean start choose Profile → **Fresh Explorer · Reset Demo**. This removes this app’s local observations, photos, consent and game state. **Load Demo Explorer** replaces progress with labelled sample records while preserving consent.

## Verification and screenshots

With the dev server running:

```powershell
npx playwright install chromium
npm run test:journey
npm run test:quality
npm run test:upgrades
npm run test:responsive
```

The original scientific-flow journey and camera/privacy quality tests remain. The upgrade suite additionally checks migration, map/list/filter consistency, all six rendered 3D models, drag/reset, evolution previews, feeding persistence and data isolation, biomes, fictional Community boundaries, project/task publication, linked repeated observations and example exports. Layout checks cover 375×812, 390×844, 430×932 and 1440×900. The core journey uses the SVG fallback to stay independent of GPU availability; the upgrade suite tests actual WebGL separately, then closes that browser before its research-data phase. Run suites sequentially on memory-constrained machines.

New actual screenshots **14–23** are in `presentation-assets/`, covering the map, bee scanner, card faces, 3D viewer, Meadow, Community, collection, project builder and monitoring. Earlier assets remain available. The source checkpoint before this upgrade is **`checkpoints/before-worlds-upgrade.zip`**; it excludes `node_modules` and `.npm-cache`.

`tests/pwa.mjs` tests the production build’s manifest, service worker and offline reload when a preview server runs at port 4173. These automated checks use desktop Chromium. Physical iPhone Safari, actual device camera permissions, geolocation and Home Screen installation still need manual device verification. See `docs/VERIFICATION.md` for the recorded results.

## Source organisation

- `src/config.ts`: replaceable label, storage key, consent version and demo pseudonym.
- `src/store.ts`: types, local repository, consent enforcement, demo seeding, task progress and CSV projection.
- `src/data.ts`: six educational species records and source links.
- `src/Art.tsx`: original vector characters and landscape.
- `src/participation.tsx`: welcome, consent and profile.
- `src/discovery.tsx`: capture, identification, recording, collectible and observation detail flows.
- `src/pages.tsx`: home, explore, collection, ecosystem, tasks, sites.
- `src/research.tsx`: researcher dashboard and showcase.
- `src/research-projects.tsx`: project/task builder and research site monitoring.
- `src/observation-map.tsx`, `public/sydney-map.svg`: private Leaflet map and offline schematic.
- `src/scene.tsx`, `src/scene-canvas.tsx`: lazy renderer, six procedural models, habitats, camera and fallback.
- `src/worlds.tsx`, `src/community-data.ts`: personal progression and isolated fictional public worlds.
- `src/scan-analysis.tsx`: clearly scripted identification stages.
- `src/upgrades.css`: additions to the existing design system.
- `src/ui.tsx`, `src/style.css`: shared UI and central design tokens.

React, TypeScript, Vite, React Router, Lucide, Motion, Three.js, React Three Fiber, Drei, Leaflet, plain token-based CSS, vite-plugin-pwa and Playwright. Font and photo assets are bundled locally; attribution is in `IMAGE_CREDITS.md` and `/credits`. Outfit and Fraunces use the SIL Open Font License. See `docs/UPGRADE_NOTES.md` for the file-by-file upgrade record.

## Next development steps

Production priorities are study governance and protocols, verified researcher authentication and permissions, secure backend repositories, protected photo storage, consent/retention handling, guardian pathways, identification review, validated geospatial records and accessible device testing. Later integrations could include Atlas of Living Australia or GBIF; none is connected here. More species, educational quizzes, habitat learning progress and task-specific survey/event models would extend the prototype. See `docs/PRODUCT_OVERVIEW.md` for proposal-ready context.
