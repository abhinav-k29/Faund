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
assert.equal(manifest.name, "Nature Discovery");
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
console.log(
  "PASS production manifest, PNG icons, service worker control, offline shell and cached species photograph",
);
await browser.close();
