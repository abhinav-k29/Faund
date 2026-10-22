import { chromium } from "@playwright/test";
import { strict as assert } from "node:assert";
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  reducedMotion: "reduce",
});
await context.addInitScript(() => {
  const original = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, ...args) {
    if (type === "webgl2") return null;
    return original.call(this, type, ...args);
  };
});
const page = await context.newPage();
page.on("pageerror", (e) => console.log("PAGE ERROR", e.message));
await page.goto("http://localhost:5173/consent");
await page.getByRole("checkbox").nth(0).check();
await page.getByRole("checkbox").nth(1).check();
await page.getByRole("button", { name: "I Agree — Start Exploring" }).click();
await page.waitForURL("**/home");
await page.getByRole("navigation").waitFor();
await page.goto("http://localhost:5173/profile");
await page.getByRole("button", { name: "Load Demo Explorer" }).click();
await page.getByRole("button", { name: "Load Demo Records" }).click();
for (const size of [
  { width: 375, height: 812 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 1440, height: 900 },
]) {
  await page.setViewportSize(size);
  for (const path of [
    "/home",
    "/map",
    "/scan",
    "/collection",
    "/field-guide",
    "/character/3",
    "/explore",
    "/explore?tab=community",
    "/tasks",
    "/researcher-demo",
  ]) {
    try {
      await page.goto("http://localhost:5173" + path);
      await page.locator("h1").first().waitFor({ timeout: 15000 });
      assert(
        !(await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        )),
        `Overflow ${path} at ${size.width}`,
      );
    } catch (e) {
      console.log(
        "FAILED VIEW",
        size.width,
        path,
        page.url(),
        (await page.locator("body").innerText()).slice(0, 1000),
      );
      await page.screenshot({
        path: "presentation-assets/responsive-failure.png",
        fullPage: true,
      });
      throw e;
    }
  }
  console.log("PASS upgraded layout " + size.width + "×" + size.height);
}
await browser.close();
