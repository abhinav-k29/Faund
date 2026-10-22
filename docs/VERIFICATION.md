# Verification record

Verified on 22 October 2026 using Windows, Node 23.5.0 and Playwright Chromium 156. Production uses Vite 8.3.5 and vite-plugin-pwa 2.0.0. Dependencies are locked in `package-lock.json`.

## Passed

- TypeScript checking and production build (`npm run build`). Generated PWA shell and bundled local photographs/fonts; precache approximately 1.64 MiB.
- Consent required for all observation-app routes; unchecked affirmative controls; adult demonstration affirmation; decline prevents entry; timestamp/version/scope persist; withdrawal stops participation; a later declined decision supersedes earlier agreement.
- Sample scanner → suggested identification → observation → companion reveal → card flip → collection → ecosystem.
- Duplicate sightings preserve separate records while deduplicating species. Unknown species can be recorded with a provisional category.
- Observation metadata and consent provenance appear in the same browser's researcher interface. A second open tab receives new records through storage events.
- Dataset filtering, simulated review notes/status changes, actual CSV download, editable research-task publication and task-linked observations.
- Single collection of task rewards, local persistence after reload, repeat-site history and comparison control, fresh reset.
- Camera denial displays a usable fallback; selected photo is locally resized/re-encoded and stored; explicit one-time location attaches uncertainty; no background location requests.
- Camera track cleanup verified with a synthetic MediaStream when navigating away. Physical camera hardware was not used.
- Sensitive locations are absent from CSV. Sensitive photos and free-text notes are withheld from the demo researcher detail view. CSV omits all precise coordinates.
- No document overflow across principal routes at **375×812, 390×844, 430×932, 1440×900**.
- Reduced-motion browser journey and no runtime page errors.
- Production manifest, 192/512 PNG icons, controlling service worker, offline reload and cached species photograph.
- Actual PNG presentation screenshots generated in `presentation-assets/`; selected mobile, card showcase and research-dashboard captures visually inspected.

## Commands

```powershell
# Server on 5173 required:
npm run test:journey
npm run test:quality

# Production preview on 4173 required:
npm run build
npm run preview -- --port 4173
npm run test:pwa
```

`test:journey` recreates screenshots in its own isolated browser context and resets that context afterwards. It does not reset a user's ordinary browser profile.

## Remaining verification and scope

Physical iPhone Safari, device permission UI, actual camera hardware, real geolocation accuracy, Add to Home Screen, accessibility with assistive technology and external HTTPS hosting require manual verification. Chromium tests and Safari-friendly CSS are not a claim of Safari device testing.

Researcher authorisation, expert review, identification inference, research transmission and guardian verification are simulated or unimplemented, as labelled in the interface. No data was sent to a research organisation. Local storage is not a production security boundary. No external deployment was performed.
