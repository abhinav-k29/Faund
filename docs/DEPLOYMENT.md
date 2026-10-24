# Wilsee on Netlify

Production: **https://wilsee.netlify.app**. Published on 25 October 2026. Project ID: `aabe0aa9-b9bc-47a2-906f-7ad4ced3d748`. Current deployment: `6adcfaa88c21039cd23efa6d`.

## Publish an update

From PowerShell:

```powershell
Set-Location -LiteralPath 'C:\Users\abhin\OneDrive\Documents\Faund'
npm.cmd ci
npm.cmd run build
npm.cmd run test:unit
npx.cmd --yes netlify-cli@27.14.2 deploy --prod --dir dist --no-build
```

The `.netlify/state.json` in this folder links to the existing Wilsee project. `--no-build` publishes the `dist` folder you just built. Do not skip `npm.cmd run build` after changing source or images. The public build opens Home immediately; use `npm run build`, rather than `build:research`.

If signed out, run `npx.cmd --yes netlify-cli@27.14.2 login` and approve Netlify in your browser. On another computer, sign in and run `npx.cmd --yes netlify-cli@27.14.2 link --name wilsee` first. Reuse the existing project. Never paste credentials into source or chat.

This is a direct CLI deployment. Automatic Git deployments are not configured. Changing local files does not update the website until you build and deploy again. No API keys, database, domain purchase or paid hosting upgrade is required.

## Hosting configuration

- `netlify.toml`: build command `npm run build`, publish directory `dist`, Node 22.x and cache/security headers.
- `public/_redirects`: `/* /index.html 200` supports direct links and route refreshes; Vite copies it to `dist`.
- CLI uploads only the finished build. Source, dependencies, archives, screenshots, checkpoints, `.git`, `.env*` and private browser journals are not in `dist`.
- `.gitignore` excludes `.netlify/`, `.vercel/`, `.env*`, dependencies and generated output.
- The app needs no environment variables. Credentials must never use the `VITE_` prefix, which includes values in browser code.
- The optional Powered by Netlify badge is disabled for Wilsee because its overlay blocked the mobile navigation. Keep it off in Project configuration > General; no paid upgrade is needed. See [Netlify’s badge setting](https://docs.netlify.com/manage/projects/powered-by-netlify-badge/).
- Browser storage is local to each origin/device. A localhost or Vercel journal is separate from a Netlify journal.

## Verify after publishing

Open the production URL in a private browser window. Confirm level 7, 24 starting entries, six species, the sprout logo, direct Home entry and no permission dialog. Refresh `/collection`, `/character/3`, `/map`, `/tasks`, `/profile` and `/research` directly. Feed a companion and reload to confirm persistence.

Run the automated public checks against the live site:

```powershell
$env:WILSEE_URL = 'https://wilsee.netlify.app'
$env:WILSEE_OUTPUT = 'artifacts/live-release'
npm.cmd run test:public
node tests/public-tools.mjs
Remove-Item Env:WILSEE_URL
Remove-Item Env:WILSEE_OUTPUT
```

These tests change only their own browser's local journal. No shared database exists. The suite verifies direct routes, private photo saving, no fabricated consent, XP, fictional-only research exports, corrupt/blocked storage, offline map and responsive screens.

Production includes a standalone PWA. First load online, then use the browser install menu or Safari Share > Add to Home Screen. Updates wait for an explicit **Update Wilsee** action; finish saving a discovery first. The supplied logo has transparent pixels. The maskable and Apple icons use a cream background for platform compatibility.

## Roll back

Open Wilsee in Netlify's dashboard, select **Deploys**, open the previously verified production deploy and use the publish/rollback control. The site's address stays the same. Netlify deployments do not back up the journal saved in each visitor's browser; Profile provides a private JSON download.
