import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const base = process.env.WILSEE_URL || "http://localhost:4173";
const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const violations = [];
  for (const route of [
    "/",
    "/scan",
    "/collection",
    "/card/3",
    "/character/3?fallback=1",
    "/tasks",
    "/map",
    "/profile",
    "/research",
  ]) {
    await page.goto(base + route);
    await page.locator("h1").first().waitFor();
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    violations.push(
      ...result.violations.map((v) => ({
        route,
        id: v.id,
        impact: v.impact,
        targets: v.nodes.map((n) => n.target),
      })),
    );
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await page
    .getByRole("button", { name: "Research Projects", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Create Research Task", exact: true })
    .first()
    .click();
  await page.getByLabel("Task title", { exact: true }).fill("Canopy Watch");
  await page
    .getByLabel("Scientific question", { exact: true })
    .fill("Which visible foliage changes appear across repeat visits?");
  await page
    .getByLabel("Observation protocol", { exact: true })
    .fill("Watch the same tree from a safe path and describe visible foliage.");
  await page.getByLabel("Visits to same site", { exact: true }).fill("3");
  await page.getByRole("button", { name: "Publish Task", exact: true }).click();
  await page.reload();
  const state = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("nature-discovery-v1")),
  );
  assert.equal(
    state.tasks.find((t) => t.title === "Canopy Watch").repeatVisits,
    3,
  );
  assert.deepEqual(state.consents, []);
  await page.goto(base + "/tasks");
  await page
    .getByRole("heading", { name: "Canopy Watch", exact: true })
    .waitFor();
  await page.goto(base + "/research");
  await page.getByRole("button", { name: "Observations", exact: true }).click();
  const all = await page.locator("tbody tr").count();
  assert.equal(all, 23);
  await page.getByLabel("Filter species", { exact: true }).selectOption("3");
  assert.equal(await page.locator("tbody tr").count(), 6);
  await page.getByLabel("Filter species", { exact: true }).selectOption("All");
  await page
    .getByLabel("Filter review status", { exact: true })
    .selectOption("Needs clarification");
  assert((await page.locator("tbody tr").count()) > 0);
  await page
    .getByLabel("Filter review status", { exact: true })
    .selectOption("All");
  await page
    .getByRole("button", { name: "Site Monitoring", exact: true })
    .click();
  assert.match(
    await page.locator(".research-main").innerText(),
    /Centennial|Botanic/,
  );
  await fs.mkdir("artifacts/returning-user", { recursive: true });
  await fs.writeFile(
    "artifacts/returning-user/accessibility.json",
    JSON.stringify({ base, violations }, null, 2),
  );
  assert.deepEqual(violations, []);
  console.log(
    "PASS public project/task publication, repeat-site monitoring, species/review filters and nine Axe accessibility audits",
  );
} finally {
  await browser.close();
}
