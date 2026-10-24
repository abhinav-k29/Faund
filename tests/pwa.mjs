import { chromium } from "@playwright/test";
import { strict as assert } from "node:assert";
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();
await page.goto("http://localhost:4173/");
await page.evaluate(() => navigator.serviceWorker.ready);
await page.reload();
assert(await page.evaluate(() => !!navigator.serviceWorker.controller));
const manifest = await page.evaluate(async () =>
  fetch("/manifest.webmanifest").then((r) => r.json()),
);
assert.equal(manifest.name, "Wilsee");
assert.equal(manifest.display, "standalone");
assert(manifest.icons.some((i) => i.sizes === "192x192"));
assert(manifest.icons.some((i) => i.sizes === "512x512"));
await context.setOffline(true);
await page.reload();
assert(
  await page
    .getByRole("button", { name: "Get Started", exact: true })
    .isVisible(),
);
const loaded = await page.evaluate(async () => {
  const img = new Image();
  img.src = "/images/0.jpg";
  await img.decode();
  return img.naturalWidth > 0;
});
assert(loaded);
const cached = await page.evaluate(async () => {
  const urls = [];
  for (const name of await caches.keys()) {
    const cache = await caches.open(name);
    for (const req of await cache.keys()) urls.push(req.url);
  }
  return urls;
});
assert(
  cached.some((u) => u.includes("scene-canvas-") && u.includes(".js")),
  "3D renderer is not precached",
);
assert(
  cached.some((u) => u.includes("/sydney-map.svg")),
  "Offline geographic schematic is not cached",
);
await context.setOffline(false);
await page.goto("http://localhost:4173/consent");
await page.getByRole("checkbox").nth(0).check();
await page.getByRole("checkbox").nth(1).check();
await page.getByRole("button", { name: "I Agree — Start Exploring" }).click();
await page.getByRole("navigation").waitFor();
await context.setOffline(true);
await page.goto("http://localhost:4173/map");
await page
  .getByRole("heading", { name: "My Discovery Map", exact: true })
  .waitFor();
await page.locator(".leaflet-image-layer").waitFor();
await page.waitForFunction(() => {
  const img = document.querySelector(".leaflet-image-layer");
  return img?.complete && img.naturalWidth > 0;
});
console.log(
  "PASS production manifest, PNG icons, service worker, offline shell/photo/map and precached 3D renderer",
);
await browser.close();
