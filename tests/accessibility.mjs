import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs/promises";
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  reducedMotion: "reduce",
});
await context.addInitScript(() => {
  const original = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, ...args) {
    return type === "webgl2" ? null : original.call(this, type, ...args);
  };
});
const page = await context.newPage();
const report = [];
const go = async (path) => {
  await page.goto("http://localhost:5173" + path);
  await page.locator("h1").first().waitFor();
  await page.evaluate(() => document.fonts.ready);
};
const audit = async (name) => {
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  report.push({
    name,
    violations: result.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      description: v.description,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  });
  console.log(`${name}: ${result.violations.length} violations`);
};
await go("/");
await audit("Welcome 390");
await go("/consent");
await audit("Consent 390");
await page.getByRole("checkbox").nth(0).check();
await page.getByRole("checkbox").nth(1).check();
await page.getByRole("button", { name: "I Agree — Start Exploring" }).click();
await page.waitForURL("**/home");
for (const path of [
  "/home",
  "/scan",
  "/identify/3",
  "/record/3",
  "/card/3",
  "/collection",
  "/character/3?fallback=1",
  "/tasks",
  "/map",
  "/contributions",
  "/explore?fallback=1",
  "/profile",
]) {
  await go(path);
  await audit(path + " 390");
}
await go("/card/3");
await page.getByRole("button", { name: "Real Species ↔ Companion" }).click();
await audit("Flipped card 390");
await go("/tasks");
await page.getByRole("button", { name: "View Task" }).first().click();
await audit("Task protocol dialog 390");
await go("/contributions?record=sample-21");
await page.getByRole("button", { name: "Review Research Submission" }).click();
await audit("Private research permission 390");
await go("/map");
await page.locator(".map-place-list>button").first().click();
await audit("Map dialog 390");
await page.setViewportSize({ width: 1440, height: 900 });
await go("/researcher-demo");
await audit("Research 1440");
await page
  .getByRole("button", { name: "Research Projects", exact: true })
  .click();
await audit("Research projects 1440");
await page
  .getByRole("button", { name: "Site Monitoring", exact: true })
  .click();
await audit("Research monitoring 1440");
const cdp = await context.newCDPSession(page);
await cdp.send("Emulation.setDeviceMetricsOverride", {
  width: 640,
  height: 400,
  deviceScaleFactor: 2,
  mobile: false,
});
await go("/collection");
await audit(
  "Collection 200% desktop zoom equivalent · 640 CSS px / 1280 device px",
);
report.at(-1).reflowOverflow = await page.evaluate(
  () => document.documentElement.scrollWidth > innerWidth,
);
await fs.mkdir("artifacts/quality", { recursive: true });
await fs.writeFile(
  "artifacts/quality/accessibility.json",
  JSON.stringify(report, null, 2),
);
await browser.close();
const total = report.reduce((sum, r) => sum + r.violations.length, 0);
console.log(
  `Axe WCAG checks: ${total} route/state violations across ${report.length} audits. Manual assistive-technology and device testing still required.`,
);
if (total) process.exitCode = 1;
