import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
const browser = await chromium.launch({
  headless: true,
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  reducedMotion: "reduce",
});
const page = await context.newPage();
page.on("pageerror", (e) => console.log("PAGE ERROR", e.message));
await page.goto("http://localhost:5173/consent");
await page.getByRole("checkbox").nth(0).check();
await page.getByRole("checkbox").nth(1).check();
await page.getByRole("button", { name: "I Agree — Start Exploring" }).click();
await page.waitForURL("**/home");
await page.goto("http://localhost:5173/profile");
await page.getByRole("button", { name: "Load Demo Explorer" }).click();
await page.getByRole("button", { name: "Load Demo Records" }).click();
await fs.mkdir("presentation-assets/upgrade-checks", { recursive: true });
for (const [path, name] of [
  ["/home", "home"],
  ["/map", "map"],
  ["/scan", "scanner"],
  ["/collection", "collection"],
  ["/character/3", "bumbloom"],
  ["/explore", "world"],
  ["/explore?tab=community", "community"],
]) {
  await page.goto("http://localhost:5173" + path);
  if (path === "/character/3" || path === "/explore")
    await page
      .locator('[data-scene-ready="true"],.scene-fallback')
      .waitFor({ timeout: 60000 });
  await page.waitForTimeout(600);
  await page.screenshot({
    path: `presentation-assets/upgrade-checks/${name}.png`,
    fullPage: true,
  });
  console.log(
    "CAPTURED",
    name,
    (await page.locator(".scene-canvas").count())
      ? await page.locator(".scene-canvas").getAttribute("data-scene-ready")
      : null,
  );
}
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto("http://localhost:5173/researcher-demo");
await page
  .getByRole("button", { name: "Research Projects", exact: true })
  .click();
await page.screenshot({
  path: "presentation-assets/upgrade-checks/projects.png",
  fullPage: true,
});
await browser.close();
