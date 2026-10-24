# Wilsee

Wilsee opens directly into a populated nature-discovery dashboard: level 7, 640 Explorer XP, 24 journal entries, six species and companions, and eight public-area sites. Existing saved progress is preserved. New photographs and observations stay private in the browser. The starting journal and research datasets are fictional learning records, never verified occurrences or real research submissions.

## Open the published app

Open **[wilsee.netlify.app](https://wilsee.netlify.app)**. No terminal or running laptop server is needed for the published app. See [Deployment](docs/DEPLOYMENT.md) to publish future updates.

## Run locally after turning on your laptop

Open Windows Terminal or VS Code's PowerShell terminal. Run these **two commands**:

```powershell
Set-Location -LiteralPath 'C:\Users\abhin\OneDrive\Documents\Faund'
npm.cmd run dev
```

Wait for **Local: http://localhost:5173/**, then open that address. **Keep the terminal open.** Closing it, pressing Ctrl+C, restarting Windows or shutting down the laptop stops the server. A saved browser bookmark does not start it again.

Port 5173 is already configured. Do not add a bare `5173` or `-- --port 5173`. Use `npm.cmd` in PowerShell to avoid the `npm.ps1` execution-policy error. No execution-policy change is needed.

For a fresh checkout, install Node **22.12 or later in the 22.x LTS line**, then run `npm.cmd ci` in this folder once before starting. Reinstall only when dependencies change or `node_modules` is missing. No API keys, account, database or paid services are required for local use.

| Problem                                    | Fix                                                                                                      |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| `npm.ps1 cannot be loaded`                 | Use `npm.cmd run dev`.                                                                                   |
| `ENOENT` / cannot find `package.json`      | Run the `Set-Location` command first.                                                                    |
| `vite` not recognised / missing dependency | Run `npm.cmd ci`, then `npm.cmd run dev`.                                                                |
| Connection refused                         | Start the server and keep its terminal open.                                                             |
| Port 5173 already in use                   | First open http://localhost:5173/. If an old server is running, stop it with Ctrl+C in its own terminal. |
| 404 from an incorrectly started server     | Stop that server, then use the exact two commands above from this folder.                                |

If you cannot find the terminal occupying 5173, identify its process without stopping anything:

```powershell
$previewListeners = Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue
$previewListeners | Select-Object LocalAddress, LocalPort, OwningProcess
$previewListeners | ForEach-Object {
    Get-CimInstance Win32_Process -Filter "ProcessId=$($_.OwningProcess)"
} | Select-Object ProcessId, Name, CommandLine
```

The Vite command should point into this project's `node_modules\vite`. Stop only the identified project process in Task Manager if its terminal is unavailable.

## Build modes and persistence

- `npm.cmd run dev` / `npm.cmd run build`: public experience; `/` is Home, no onboarding, no consent recorded, visitor observations private, research workspace limited to fictional learning records.
- `npm.cmd run dev:research` / `npm.cmd run build:research`: preserved scientific workflow with the mandatory versioned participation agreement, explicit per-record research permission and withdrawal. Research identity and transmission are local simulations. This mode is for local development and regression checks; it is not the public deployment.

Both modes retain the existing `nature-discovery-v1` storage key. Use a separate browser profile when testing the original research workflow. Public migration retains consent history and earned progress; it strips invented submission receipts from known fictional starter records. New visitors receive the same original profile once; reloads preserve changes. **Clear My Local Data** stays empty on reload. **Restore Starting Journal** deliberately replaces progress after confirmation. Profile offers a private JSON download first.

Blocked storage permits temporary exploration with feedback. Corrupt storage preserves the unreadable original, pauses saving and offers recovery. Quota failures do not advance a photo save. Browser data is local, unencrypted and not synced between devices or between localhost and the public site.

## Main routes

| Route            | What opens                                                                         |
| ---------------- | ---------------------------------------------------------------------------------- |
| `/`              | Populated Home with prominent discovery and Tasks shortcuts                        |
| `/map`           | Private map, filters, repeat-site visits and offline Sydney schematic              |
| `/scan`          | Deliberate camera/upload actions and manual field-guide selection                  |
| `/collection`    | Species cards and character collection                                             |
| `/card/3`        | Two-sided Blue-banded Bee / Bumbloom card                                          |
| `/character/3`   | Rotate, zoom, evolve-preview and feed Bumbloom                                     |
| `/explore`       | Biomes, personal world and curated Community Worlds                                |
| `/tasks`         | Research-designed missions, protocols and one-time rewards                         |
| `/contributions` | Private observation journal, corrections and deletion                              |
| `/sites`         | Repeat-site timelines                                                              |
| `/profile`       | Level, achievements, companion, privacy and journal controls                       |
| `/research`      | Research projects/task builder, fictional observations, review, monitoring and CSV |
| `/credits`       | Local image attribution and licences                                               |

Public `/home`, `/consent`, `/welcome`, `/onboarding`, `/login`, `/setup` and `/showcase` resolve to Home. The original `/researcher-demo` link still works. Research mode retains its original welcome, consent and presentation routes.

## Privacy, identification and PWA

No identification model or research endpoint is connected. Organisms are chosen manually; uncertain records remain unconfirmed. Camera/location permission is requested only after an explicit action. Photos are resized and re-encoded to remove source EXIF. Sensitive observations have no map pin; research exports omit exact coordinates and sensitive localities. Community Worlds accept only characters/stages/biomes, with no scientific observation fields.

The six procedural 3D companions, three growth stages, illustrated fallback, graphics controls and reduced-motion support are preserved. No remote model downloads are needed. App photographs and fonts are local; optional online map tiles require a deliberate action and provider attribution.

Production includes a root-starting standalone PWA, PNG icons, Apple touch icon and cached app shell/assets. Offline use needs a successful online visit first. Updates offer an explicit **Update Wilsee** action so a discovery is not interrupted. Install through the browser menu or Safari Share > Add to Home Screen; no install prompt appears on entry. Camera/location generally require HTTPS on phones, which the public deployment provides.

## Checks and screenshots

```powershell
npm.cmd run build
npm.cmd run test:unit
npm.cmd run format:check
```

For public browser checks, run `npm.cmd run preview -- --port 4173 --strictPort` in a second terminal, then:

```powershell
npm.cmd run test:public
node tests/public-tools.mjs
npm.cmd run test:pwa
```

`test:public` captures eight screens at 390x844, 375x667, 768x1024 and 1440x900 in `artifacts/returning-user/`. Set `WILSEE_URL` to the live HTTPS URL to repeat the same checks there. Screenshots and reports are linked in [the release report](docs/RETURNING_USER_RELEASE.md).

Original journey/quality/privacy/upgrades tests run against **research-mode** Vite on port 5173. Stop any public dev server with Ctrl+C, run `npm.cmd run dev:research`, then run `test:journey`, `test:quality`, `test:privacy`, or `test:upgrades` in another terminal. The public preview uses port 4173, so both test modes can run side by side.

React, TypeScript, Vite, React Router, Motion, Three.js/React Three Fiber, Leaflet and vite-plugin-pwa remain the existing stack. See [character art notes](docs/CHARACTER_ART.md), [original upgrade notes](docs/UPGRADE_NOTES.md), [previous quality audit](docs/WILSEE_QUALITY_REPORT.md) and [image credits](IMAGE_CREDITS.md).
