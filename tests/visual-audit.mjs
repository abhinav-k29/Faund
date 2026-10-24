import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
const phase = process.argv[2] || "before";
const root = `artifacts/visual-audit/${phase}`;
await fs.mkdir(root, { recursive: true });
const errors = [];
let browser = await chromium.launch({ headless: true });
let context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  reducedMotion: "reduce",
});
await context.addInitScript(() => {
  const original = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, ...args) {
    return type === "webgl2" ? null : original.call(this, type, ...args);
  };
});
let page = await context.newPage();
page.on("pageerror", (e) => errors.push(e.message));
const go = async (path) => {
  await page.goto(`http://localhost:5173${path}`);
  await page.locator("h1").first().waitFor();
  await page.evaluate(() => document.fonts.ready);
};
if (phase === "final") {
  await go("/");
  await page.screenshot({ path: `${root}/390-welcome.png` });
  await go("/consent");
  await page.screenshot({ path: `${root}/390-consent.png` });
} else await go("/consent");
await page.getByRole("checkbox").nth(0).check();
await page.getByRole("checkbox").nth(1).check();
await page.getByRole("button", { name: "I Agree — Start Exploring" }).click();
await page.waitForURL("**/home");
const sizes = [
  [1440, 900],
  [1280, 800],
  [768, 1024],
  [390, 844],
  [360, 800],
];
const routes = [
  ["home", "/home"],
  ["map", "/map"],
  ["scan", "/scan"],
  ["collection", "/collection"],
  ["quests", "/tasks"],
  ["world", "/explore?fallback=1"],
  ["research", "/researcher-demo"],
];
const timings = [];
for (const [width, height] of sizes) {
  await page.setViewportSize({ width, height });
  for (const [name, path] of routes) {
    const start = performance.now();
    await go(path);
    if (name === "map") await page.locator(".leaflet-image-layer").waitFor();
    timings.push({
      route: name,
      width,
      ms: Math.round(performance.now() - start),
      overflow: await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    });
    await page.screenshot({ path: `${root}/${width}-${name}.png` });
  }
}
await page.setViewportSize({ width: 390, height: 844 });
for (const [name, path] of [
  ["species-card", "/card/3"],
  ["companion-card", "/card/3?side=character"],
  ["identification", "/identify/3"],
  ["record", "/record/3"],
  ["contributions", "/contributions"],
  ["profile", "/profile"],
  ["community", "/explore?tab=community"],
  ["guide", "/field-guide"],
]) {
  await go(path);
  await page.screenshot({ path: `${root}/390-${name}.png` });
}
await go("/collection");
await page.getByRole("button", { name: /Characters/ }).click();
await page.screenshot({
  path: `${root}/390-characters.png`,
  fullPage: true,
  style:
    ".mobile-app {position:relative!important} .bottom-nav {position:absolute!important;bottom:0!important}",
});
await go("/map");
await page.locator(".map-place-list>button").first().click();
await page.screenshot({ path: `${root}/390-map-dialog.png` });
await page.getByRole("button", { name: "Close dialog" }).click();
await go("/scan");
await page.evaluate(() =>
  Object.defineProperty(navigator.mediaDevices, "getUserMedia", {
    configurable: true,
    value: async () => {
      throw new Error(
        "Camera unavailable for this example. Choose a photo or sample.",
      );
    },
  }),
);
await page.getByRole("button", { name: "Enable camera" }).click();
await page.screenshot({
  path: `${root}/390-camera-error.png`,
  fullPage: true,
  style:
    ".mobile-app {position:relative!important} .bottom-nav {position:absolute!important;bottom:0!important}",
});
await page.route("**/images/3.jpg", (route) => route.abort());
await go("/identify/3");
await page.screenshot({ path: `${root}/390-missing-image.png` });
await page.unroute("**/images/3.jpg");
await page.setViewportSize({ width: 1440, height: 900 });
await go("/researcher-demo?view=projects");
await page.screenshot({ path: `${root}/1440-projects.png`, fullPage: true });
await page
  .getByRole("button", { name: "Site Monitoring", exact: true })
  .click();
await page.screenshot({ path: `${root}/1440-monitoring.png`, fullPage: true });
const storageState = await context.storageState();
await browser.close();
browser = await chromium.launch({
  headless: true,
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  reducedMotion: "reduce",
  storageState,
});
page = await context.newPage();
page.on("pageerror", (e) => errors.push(e.message));
for (const id of [0, 1, 2, 3, 4, 5]) {
  await go(`/character/${id}`);
  await page.locator('[data-scene-ready="true"]').waitFor({ timeout: 60000 });
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${root}/390-character-${id}.png` });
  for (const stage of [1, 3]) {
    await page
      .getByRole("button", { name: `Preview evolution stage ${stage}` })
      .click();
    await page.waitForTimeout(100);
    await page
      .locator(".scene-stage")
      .screenshot({ path: `${root}/model-${id}-stage-${stage}.png` });
  }
}
await go("/explore");
await page.locator('[data-scene-ready="true"]').waitFor({ timeout: 60000 });
for (const biome of ["Meadow", "Woodland", "Misty Grove"]) {
  await page.getByRole("button", { name: new RegExp(`^${biome}`) }).click();
  await page.waitForTimeout(200);
  await page.locator(".scene-stage").screenshot({
    path: `${root}/biome-${biome.toLowerCase().replaceAll(" ", "-")}.png`,
  });
}
await browser.close();
await fs.writeFile(
  `${root}/results.json`,
  JSON.stringify(
    {
      phase,
      capturedAt: new Date().toISOString(),
      environment: "Windows / desktop Chromium; software WebGL, reduced motion",
      errors,
      timings,
    },
    null,
    2,
  ),
);
console.log(
  `Captured ${phase} UI at five sizes, six models at two stages, three biomes, dialogs and error states. Runtime errors: ${errors.length}`,
);
if (phase === "final" && (errors.length || timings.some((t) => t.overflow)))
  process.exitCode = 1;
