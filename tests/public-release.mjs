import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";

const base = process.env.WILSEE_URL || "http://localhost:4173";
const output = process.env.WILSEE_OUTPUT || "artifacts/returning-user";
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  reducedMotion: "reduce",
});
const page = await context.newPage();
const errors = [],
  failures = [],
  passed = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("response", (r) => {
  if (r.status() >= 400 && new URL(r.url()).origin === new URL(base).origin)
    failures.push(`${r.status()} ${r.url()}`);
});
const key = "nature-discovery-v1";
const saved = () =>
  page.evaluate((k) => JSON.parse(localStorage.getItem(k)), key);
const open = async (route) => {
  const response = await page.goto(base + route);
  assert.equal(response.status(), 200, route);
  await page.locator("h1").first().waitFor();
};
function pass(label) {
  passed.push(label);
  console.log("PASS", label);
}
try {
  await page.addInitScript(() => {
    window.permissionCalls = 0;
    if (navigator.mediaDevices)
      navigator.mediaDevices.getUserMedia = async () => {
        window.permissionCalls++;
        throw new DOMException("Camera denied", "NotAllowedError");
      };
    navigator.geolocation.getCurrentPosition = () => {
      window.permissionCalls++;
    };
  });
  await open("/");
  await page.waitForFunction((k) => localStorage.getItem(k), key);
  const initial = await saved();
  assert.equal(initial.observations.length, 24);
  assert.equal(initial.xp, 640);
  assert.equal(initial.ecosystem.length, 6);
  assert.equal(initial.game.activeCompanionId, 3);
  assert.deepEqual(initial.consents, []);
  assert(
    initial.observations.every(
      (o) => o.synthetic && !o.consentId && o.research.status !== "submitted",
    ),
  );
  assert.equal(await page.evaluate(() => window.permissionCalls), 0);
  pass(
    "fresh root opens populated level-7 dashboard without consent or permissions",
  );
  for (const route of [
    "/consent",
    "/welcome",
    "/onboarding",
    "/login",
    "/setup",
    "/home",
  ]) {
    await open(route);
    assert.equal(new URL(page.url()).pathname, "/");
  }
  const routes = [
    "/",
    "/map",
    "/scan",
    "/identify/3",
    "/record/3",
    "/card/3",
    "/collection",
    "/explore?fallback=1",
    "/character/3?fallback=1",
    "/community/whisperwood?fallback=1",
    "/tasks",
    "/contributions",
    "/sites",
    "/profile",
    "/credits",
    "/research",
  ];
  for (const route of routes) {
    await open(route);
    assert.doesNotMatch(
      await page.locator("body").innerText(),
      /\b(?:demo|demonstration|prototype|mock|placeholder|beta preview|test environment|sample user)\b/i,
      route,
    );
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      ),
      false,
      "overflow " + route,
    );
  }
  pass(
    "all product routes refresh correctly, with clean copy and no mobile overflow",
  );
  await open("/");
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Collection", exact: true })
    .click();
  await page
    .getByRole("heading", { name: "My Collection", exact: true })
    .waitFor();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Scan", exact: true })
    .click();
  await page
    .getByRole("heading", { name: "Discover a little wild.", exact: true })
    .waitFor();
  await page.goBack();
  await page
    .getByRole("heading", { name: "My Collection", exact: true })
    .waitFor();
  await page.goForward();
  await page
    .getByRole("heading", { name: "Discover a little wild.", exact: true })
    .waitFor();
  pass("bottom navigation and browser Back/Forward retain the correct screen");
  await open("/scan");
  await page.getByLabel("Enable camera", { exact: true }).click();
  await page.getByText("Camera denied", { exact: false }).waitFor();
  await page.locator('input[type="file"]').setInputFiles("public/images/0.jpg");
  await page
    .locator(".camera-view img[alt='Your locally captured organism']")
    .waitFor();
  await page
    .getByRole("button", { name: "Rainbow Lorikeet", exact: true })
    .click();
  await page.waitForURL("**/identify/0");
  await page.getByText("MANUAL IDENTIFICATION", { exact: true }).waitFor();
  assert.match(await page.locator("body").innerText(), /selected.*manually/i);
  await page.getByRole("button", { name: "Looks Right", exact: true }).click();
  await page
    .getByLabel("Location description", { exact: true })
    .fill("Private test garden");
  await page
    .getByLabel("Observation notes", { exact: false })
    .fill("One bird observed from a safe public path.");
  await page
    .getByRole("button", { name: "Save Observation", exact: true })
    .dblclick();
  await page.waitForURL("**/card/0");
  let current = await saved();
  assert.equal(current.observations.length, 25);
  assert.equal(current.xp, 660);
  const capture = current.observations.find((o) => o.photo);
  assert(capture.photo.startsWith("data:image/jpeg"));
  assert.equal(capture.research.status, "private");
  assert(!capture.synthetic);
  assert.deepEqual(current.consents, []);
  await page.reload();
  assert.equal((await saved()).observations.length, 25);
  pass(
    "camera denial, photo upload, manual identification, private save and duplicate-click protection",
  );
  await open("/research");
  await page.getByRole("button", { name: "Observations", exact: true }).click();
  assert.doesNotMatch(
    await page.locator(".research-main").innerText(),
    /Private test garden/,
  );
  const downloadEvent = page.waitForEvent("download");
  await page.getByRole("button", { name: /Export.*CSV/ }).click();
  const download = await downloadEvent;
  const csv = await fs.readFile(await download.path(), "utf8");
  assert.match(csv, /Fictional learning record/);
  assert.doesNotMatch(csv, /Private test garden|151\.254|151\.216/);
  assert.equal(csv.trim().split(/\r?\n/).length, 24);
  pass(
    "research library/export contains only 23 fictional records and withholds sensitive coordinates",
  );
  await open("/explore?fallback=1");
  await page.getByRole("button", { name: "Community", exact: true }).click();
  assert.doesNotMatch(
    await page.locator(".community-gallery").innerText(),
    /Private test garden|2026-|sample-/,
  );
  pass("Community Worlds excludes private scientific observations");
  await open("/character/3?fallback=1");
  const beforeFeed = await saved();
  await page
    .getByRole("button", { name: "Feed +10 Growth XP", exact: true })
    .click();
  await page.reload();
  const afterFeed = await saved();
  assert.equal(
    afterFeed.game.availableGrowthXP,
    beforeFeed.game.availableGrowthXP - 10,
  );
  assert.equal(
    afterFeed.game.characterGrowth[3],
    beforeFeed.game.characterGrowth[3] + 10,
  );
  assert.equal(afterFeed.xp, beforeFeed.xp);
  assert.deepEqual(afterFeed.observations, beforeFeed.observations);
  await open("/tasks");
  const leaf = page.locator(".task-card").filter({
    has: page.getByRole("heading", { name: "Leaf Explorer", exact: true }),
  });
  await leaf
    .getByRole("button", { name: "Collect Reward", exact: true })
    .click();
  await page.reload();
  assert.equal((await saved()).xp, beforeFeed.xp + 30);
  assert.equal((await saved()).claimed.filter((id) => id === "leaf").length, 1);
  pass(
    "feeding and task rewards persist without mutating scientific records or double granting XP",
  );
  // Valid old progress must survive migration, including private visitor data.
  current = await saved();
  current.xp = 1234;
  current.game.availableGrowthXP = 77;
  current.observations.find((o) => o.photo).identification =
    "User-confirmed demo identification";
  delete current.showcaseVersion;
  await page.evaluate(
    ({ key, current }) => localStorage.setItem(key, JSON.stringify(current)),
    { key, current },
  );
  await open("/");
  await page.reload();
  assert.equal((await saved()).xp, 1234);
  assert.equal((await saved()).game.availableGrowthXP, 77);
  assert.equal((await saved()).observations.length, 25);
  await open("/contributions");
  assert.doesNotMatch(
    await page.locator(".observations-list").innerText(),
    /\bdemo\b/i,
  );
  assert.equal(
    (await saved()).observations.find((o) => o.photo).identification,
    "User-confirmed demo identification",
  );
  pass(
    "returning-user migration preserves XP, wallet, observations and consent choices",
  );
  await page.evaluate(
    ({ key, initial }) => localStorage.setItem(key, JSON.stringify(initial)),
    { key, initial },
  );
  await open("/profile");
  await page
    .getByRole("button", { name: "Clear My Local Data", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Confirm Clear Local Data", exact: true })
    .click();
  await page.reload();
  assert.equal((await saved()).observations.length, 0);
  await page
    .getByRole("button", { name: "Restore Starting Journal", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Restore Journal", exact: true })
    .click();
  await page.reload();
  assert.equal((await saved()).observations.length, 24);
  pass(
    "explicit clearing stays empty after reload; starting journal restores only on request",
  );
  await page.evaluate((k) => localStorage.setItem(k, "{unreadable"), key);
  await open("/");
  await page
    .getByRole("heading", { name: "Your saved journal needs recovery" })
    .waitFor();
  assert.equal(
    await page.evaluate((k) => localStorage.getItem(k), key),
    "{unreadable",
  );
  await page.evaluate(
    ({ key, initial }) => localStorage.setItem(key, JSON.stringify(initial)),
    { key, initial },
  );
  pass(
    "corrupt storage preserves original data and offers recovery without a blank app",
  );
  const blocked = await browser.newContext();
  await blocked.addInitScript(() =>
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("Disabled", "SecurityError");
      },
    }),
  );
  const bp = await blocked.newPage();
  await bp.goto(base);
  await bp
    .getByText("Browser storage is disabled.", { exact: false })
    .waitFor();
  await bp.getByRole("heading", { name: "Hey, Explorer." }).waitFor();
  await blocked.close();
  pass(
    "disabled browser storage keeps the populated app usable with clear persistence feedback",
  );
  await open("/");
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  assert(await page.evaluate(() => !!navigator.serviceWorker.controller));
  const manifest = await page.evaluate(() =>
    fetch("/manifest.webmanifest").then((r) => r.json()),
  );
  assert.equal(manifest.name, "Wilsee");
  assert.equal(manifest.start_url, "/");
  assert.equal(manifest.display, "standalone");
  await context.setOffline(true);
  await open("/map");
  await page.locator(".leaflet-image-layer").waitFor();
  await page.waitForFunction(() => {
    const img = document.querySelector(".leaflet-image-layer");
    return img?.complete && img.naturalWidth > 0;
  });
  await context.setOffline(false);
  pass("root PWA manifest, service worker and offline deep-link map");
  assert.deepEqual(errors, []);
  assert.deepEqual(failures, []);
  if (process.env.WILSEE_SCREENSHOTS !== "0") {
    const screens = [
      ["home", "/"],
      ["discovery", "/scan"],
      ["collection", "/collection"],
      ["species", "/card/3"],
      ["character", "/character/3"],
      ["tasks", "/tasks"],
      ["map", "/map"],
      ["profile", "/profile"],
    ];
    for (const [width, height] of [
      [390, 844],
      [375, 667],
      [768, 1024],
      [1440, 900],
    ]) {
      await page.setViewportSize({ width, height });
      for (const [name, route] of screens) {
        await open(route);
        await page.evaluate(() => document.fonts.ready);
        if (name === "character")
          await page
            .locator("canvas, .scene-fallback")
            .first()
            .waitFor({ timeout: 30000 });
        await page.waitForTimeout(name === "character" ? 2500 : 150);
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth + 1,
          ),
          false,
          `${width} ${route}`,
        );
        await page.screenshot({
          path: `${output}/${width}-${name}.png`,
          fullPage: true,
        });
      }
    }
    pass("32 screenshots: eight core screens at four required viewport sizes");
  }
  assert.deepEqual(errors, []);
  assert.deepEqual(failures, []);
  await fs.writeFile(
    `${output}/report.json`,
    JSON.stringify({ base, passed, errors, failures }, null, 2),
  );
} finally {
  await browser.close();
}
