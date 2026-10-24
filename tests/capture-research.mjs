import { chromium } from "@playwright/test";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  reducedMotion: "reduce",
});
await page.goto("http://localhost:5173/consent");
await page.getByRole("checkbox").nth(0).check();
await page.getByRole("checkbox").nth(1).check();
await page.getByRole("button", { name: "I Agree — Start Exploring" }).click();
await page.getByRole("navigation").waitFor();
await page.goto("http://localhost:5173/profile");
await page.getByRole("button", { name: "Load Demo Explorer" }).click();
await page.getByRole("button", { name: "Load Demo Records" }).click();
await page.goto("http://localhost:5173/researcher-demo?view=projects");
await page
  .getByRole("heading", { name: "Research Projects", exact: true })
  .waitFor();
await page.evaluate(() => window.scrollTo(0, 0));
await page.screenshot({
  path: "presentation-assets/24-research-projects.png",
  fullPage: true,
});
await page
  .locator(".project-card")
  .filter({ hasText: "Seasonal Encounters" })
  .getByRole("button", { name: "Create Research Task" })
  .click();
await page.getByLabel("Task title").fill("Flower Visitor Watch");
await page
  .getByLabel("Scientific question", { exact: true })
  .fill(
    "Which flower visitors are recorded during consistent observation windows?",
  );
await page
  .getByLabel("Observation protocol")
  .fill(
    "Observe a flowering plant safely for five minutes. Record visitors, effort, habitat and notes. Return to the same named site on a separate visit.",
  );
await page.getByLabel("Target category").selectOption("Insects");
await page.getByLabel("Visits to same site").fill("2");
await page.locator("dialog").evaluate((el) => (el.scrollTop = 0));
await page.screenshot({
  path: "presentation-assets/22-research-project-builder.png",
});
await page.getByRole("button", { name: "Close dialog" }).click();
await page
  .getByRole("button", { name: "Site Monitoring", exact: true })
  .click();
await page.locator(".monitoring-card").first().waitFor();
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(150);
await page.screenshot({
  path: "presentation-assets/23-research-site-monitoring.png",
  fullPage: true,
});
await browser.close();
console.log("Captured project overview, task builder and site monitoring.");
