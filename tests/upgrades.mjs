import { chromium, expect } from "@playwright/test";
import { strict as assert } from "node:assert";
import fs from "node:fs/promises";
let browser = await chromium.launch({
  headless: true,
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
let context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  reducedMotion: "reduce",
});
let page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const base = "http://localhost:5173";
const go = async (path) => {
  await page.goto(base + path);
  await page.locator("h1").first().waitFor();
};
const state = async () => {
  await page.waitForTimeout(60);
  return page.evaluate(() =>
    JSON.parse(localStorage.getItem("nature-discovery-v1")),
  );
};
const scene = async () => {
  await page.locator('[data-scene-ready="true"]').waitFor({ timeout: 60000 });
  await page.waitForTimeout(350);
};
await fs.mkdir("presentation-assets", { recursive: true });
await go("/consent");
await page.getByRole("checkbox").nth(0).check();
await page.getByRole("checkbox").nth(1).check();
await page.getByRole("button", { name: "I Agree — Start Exploring" }).click();
await page.waitForURL("**/home");
await page.getByRole("navigation", { name: "Main navigation" }).waitFor();
assert.equal(
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link")
    .count(),
  5,
);
assert(
  await page
    .getByRole("link", { name: /Tasks & Research Missions/ })
    .isVisible(),
);
await go("/profile");
await page.getByRole("button", { name: "Load Demo Explorer" }).click();
await page.getByRole("button", { name: "Load Demo Records" }).click();
assert.equal((await state()).observations.length, 18);
const migrated = await page.evaluate(async () => {
  const { migrateState } = await import("/src/store.ts");
  const current = JSON.parse(localStorage.getItem("nature-discovery-v1"));
  const { game, projects, ...legacy } = current;
  const updated = migrateState(legacy);
  return {
    same:
      JSON.stringify(legacy.observations) ===
      JSON.stringify(updated.observations),
    consentSame:
      JSON.stringify(legacy.consents) === JSON.stringify(updated.consents),
    xp: updated.xp,
    game: updated.game,
    projects: updated.projects.length,
  };
});
assert(migrated.same && migrated.consentSame);
assert.equal(migrated.xp, 640);
assert(migrated.projects > 0 && migrated.game.availableGrowthXP >= 0);
console.log(
  "PASS storage-key compatibility and legacy-data migration; five navigation items; prominent Tasks",
);
await go("/map");
await page.locator(".discovery-pin").first().waitFor();
assert.equal(await page.locator(".discovery-pin").count(), 6);
await page.getByLabel("Search mapped observations").fill("Blue-banded");
await page.getByRole("button", { name: "List", exact: true }).click();
assert.equal(
  await page.locator(".map-observation-list .observation-row").count(),
  4,
);
await page.getByRole("button", { name: "Map", exact: true }).click();
assert.equal(await page.locator(".map-place-list>button").count(), 3);
await page.getByLabel("Search mapped observations").fill("");
await page.getByRole("button", { name: "Show map date filters" }).click();
await page.getByLabel("From date", { exact: true }).fill("2026-10-10");
await page.getByLabel("To date", { exact: true }).fill("2026-10-20");
const expected = (await state()).observations.filter(
  (o) =>
    o.observedAt.slice(0, 10) >= "2026-10-10" &&
    o.observedAt.slice(0, 10) <= "2026-10-20",
).length;
assert(
  (await page.locator(".map-summary").innerText()).startsWith(
    String(expected) + " observations",
  ),
);
await go("/map");
await page.locator(".map-place-list>button").first().click();
await page
  .getByRole("button", { name: "View Observation", exact: true })
  .first()
  .click();
assert(await page.getByText("sample-1", { exact: true }).isVisible());
await page.getByRole("button", { name: "Close dialog" }).click();
await page.locator(".map-place-list>button").first().click();
await page.screenshot({ path: "presentation-assets/14-personal-map.png" });
await page.getByRole("link", { name: "View Site Timeline" }).click();
await expect(page.locator(".timeline>div")).toHaveCount(3);
await page.getByRole("button", { name: "Close dialog" }).click();
console.log(
  "PASS record-derived geographic markers, grouping, map/list/search/date filters and repeat-site timeline",
);
await go("/scan");
const fit = await page
  .locator(".camera-view>.photo")
  .evaluate((el) => getComputedStyle(el).objectFit);
assert.equal(fit, "contain");
assert(
  (await page.locator(".camera-view>.photo").getAttribute("src")).endsWith(
    "/3.jpg",
  ),
);
await page.screenshot({ path: "presentation-assets/15-bee-scanner.png" });
await page.getByRole("button", { name: "Analyse Bee Sample · Demo" }).click();
await expect(
  page.getByText("DEMO ANALYSIS · SCRIPTED SIMULATION"),
).toBeVisible();
await page.waitForURL("**/identify/3");
await expect(page.getByText("What stands out?", { exact: true })).toBeVisible();
await go("/card/3");
await page.screenshot({
  path: "presentation-assets/16-trading-card-front.png",
});
await page.getByRole("button", { name: "Real Species ↔ Companion" }).click();
await expect(page.locator(".flip-inner.flipped")).toHaveCount(1);
await page.screenshot({ path: "presentation-assets/17-trading-card-back.png" });
await page.getByRole("link", { name: "Inspect Bumbloom in 3D" }).click();
await scene();
const image = () => page.locator("canvas").evaluate((c) => c.toDataURL());
const before = await image();
assert(before.length > 10000);
const box = await page.locator("canvas").boundingBox();
await page.mouse.move(box.x + box.width * 0.45, box.y + box.height * 0.45);
await page.mouse.down();
await page.mouse.move(box.x + box.width * 0.75, box.y + box.height * 0.55, {
  steps: 12,
});
await page.mouse.up();
await page.waitForTimeout(500);
const rotated = await image();
assert.notEqual(rotated, before);
await page.getByRole("button", { name: "Reset 3D camera" }).click();
await page.waitForTimeout(400);
assert.notEqual(await image(), rotated);
await page.getByRole("button", { name: "Preview evolution stage 3" }).click();
await expect(page.locator(".scene-canvas")).toHaveAttribute("data-stages", "3");
await page.getByRole("button", { name: "Show current stage" }).click();
const beforeFeed = await state();
await page
  .getByRole("button", { name: "Feed +10 Growth XP", exact: true })
  .click();
await page
  .getByRole("button", { name: "Feed +10 Growth XP", exact: true })
  .click();
let s = await state();
assert.equal(s.game.availableGrowthXP, beforeFeed.game.availableGrowthXP - 20);
assert.equal(
  s.game.characterGrowth["3"],
  beforeFeed.game.characterGrowth["3"] + 20,
);
assert.equal(s.xp, beforeFeed.xp);
assert.equal(
  JSON.stringify(s.observations),
  JSON.stringify(beforeFeed.observations),
);
await page.reload();
await scene();
assert.equal((await state()).game.characterGrowth["3"], 105);
await page.screenshot({ path: "presentation-assets/18-3d-character.png" });
for (const id of [0, 1, 2, 3, 4, 5]) {
  await page.getByLabel("Choose companion").selectOption(String(id));
  await page.waitForTimeout(250);
  assert((await image()).length > 10000, "Blank model " + id);
}
await go("/character/0?fallback=1");
await expect(
  page.getByText("3D unavailable · illustrated fallback"),
).toBeVisible();
assert.equal(await page.locator("canvas").count(), 0);
console.log(
  "PASS fully framed bee, scripted analysis, flip, six volumetric models, drag/reset, evolution preview, fallback and separate Growth XP",
);
await go("/explore");
await scene();
assert.equal(
  await page.locator(".scene-canvas").getAttribute("data-character-count"),
  "2",
);
await page.screenshot({ path: "presentation-assets/19-meadow-biome.png" });
await page.getByRole("button", { name: /Woodland A canopy/ }).click();
await page.waitForTimeout(300);
assert.equal(
  await page.locator(".scene-canvas").getAttribute("data-character-count"),
  "3",
);
await page.getByRole("button", { name: /Misty Grove Still water/ }).click();
await expect(page.locator(".scene-canvas")).toHaveAttribute(
  "data-character-count",
  "1",
);
await page.getByRole("button", { name: "Community", exact: true }).click();
await expect(page.locator(".community-card")).toHaveCount(3);
await page.screenshot({ path: "presentation-assets/20-community-worlds.png" });
await page
  .locator(".community-card")
  .filter({ hasText: "Whisperwood" })
  .click();
await scene();
assert.equal(await page.locator('img[src^="/images/"]').count(), 0);
const communityText = await page.locator("body").innerText();
for (const site of (await state()).sites)
  assert(!communityText.includes(site.location));
assert(!communityText.includes("sample-1"));
assert.equal(await page.getByRole("button", { name: /Feed \+10/ }).count(), 0);
const scientific = JSON.stringify((await state()).observations);
await page.getByRole("button", { name: /Appreciate this world/ }).click();
assert.equal(JSON.stringify((await state()).observations), scientific);
await go("/collection");
await page.screenshot({
  path: "presentation-assets/21-updated-collection.png",
});
await page.getByRole("button", { name: "Characters", exact: false }).click();
await page.locator(".collection-tile").filter({ hasText: "Bumbloom" }).click();
await page.waitForURL("**/character/3");
await go("/field-guide");
assert(
  await page
    .getByRole("heading", { name: "Explore Nature", exact: true })
    .isVisible(),
);
await go("/ecosystem");
assert(
  await page
    .getByRole("heading", { name: "Explore Worlds", exact: true })
    .isVisible(),
);
console.log(
  "PASS three populated biomes, isolated fictional community, collection character links and preserved Field Guide/ecosystem routes",
);
// Close the WebGL process before the data-workflow phase. The same local state
// is restored; research tests do not need an active GPU renderer.
const savedSession = await context.storageState();
await browser.close();
browser = await chromium.launch({ headless: true });
context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  storageState: savedSession,
  reducedMotion: "reduce",
});
await context.addInitScript(() => {
  const original = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, ...args) {
    if (type === "webgl2") return null;
    return original.call(this, type, ...args);
  };
});
page = await context.newPage();
page.on("pageerror", (e) => errors.push(e.message));
await page.setViewportSize({ width: 1440, height: 900 });
await go("/researcher-demo");
await page
  .getByRole("button", { name: "Research Projects", exact: true })
  .click();
await page.getByRole("button", { name: "New Research Project" }).click();
await page.getByLabel("Project title").fill("Pollinator Window Study");
await page
  .getByLabel("Project description")
  .fill("Fictional protocol design and repeat-visit demonstration.");
await page
  .getByLabel("Scientific question", { exact: true })
  .fill(
    "What visits are recorded during consistent garden observation windows?",
  );
await page.getByRole("button", { name: "Save Research Project" }).click();
const projectCard = page
  .locator(".project-card")
  .filter({ hasText: "Pollinator Window Study" });
await projectCard.getByRole("button", { name: "Create Research Task" }).click();
await page.getByLabel("Task title").fill("Flower Visitor Watch");
await page
  .getByLabel("Scientific question", { exact: true })
  .fill("Which flower visitors are observed at the same site on two visits?");
await page
  .getByLabel("Observation protocol")
  .fill(
    "Observe from a safe path for five minutes. Return on a separate visit. Record the same named site, effort and notes.",
  );
await page.getByLabel("Target category").selectOption("Insects");
await page.getByLabel("Visits to same site").fill("2");
await page.getByRole("button", { name: "Publish Demo Task" }).click();
const newTask = (await state()).tasks.find(
  (t) => t.title === "Flower Visitor Watch",
);
assert(newTask.projectId);
await page.screenshot({
  path: "presentation-assets/22-research-project-builder.png",
  fullPage: true,
});
await page.setViewportSize({ width: 390, height: 844 });
for (let i = 0; i < 2; i++) {
  await go("/tasks");
  const card = page
    .locator(".task-card")
    .filter({ hasText: "Flower Visitor Watch" });
  await card.getByRole("button", { name: "Read Protocol" }).click();
  await page.getByRole("button", { name: "Start Task" }).click();
  await page
    .getByRole("button", { name: "Blue-banded Bee", exact: true })
    .click();
  await page.waitForURL("**/identify/3");
  await page.getByRole("button", { name: "Looks Right" }).click();
  await page.getByLabel("Previously saved site").selectOption("site-a");
  await page
    .getByLabel("Observation notes")
    .fill("Fictional repeat visit " + (i + 1) + "; no actual research event.");
  await page.getByLabel("Date and time").fill("2026-10-" + (20 + i) + "T10:30");
  await page.getByRole("button", { name: "Save Observation" }).click();
  await page.waitForURL("**/card/3");
}
s = await state();
assert.equal(s.observations.length, 20);
assert(
  s.observations
    .slice(-2)
    .every(
      (o) =>
        o.projectId === newTask.projectId &&
        o.taskId === newTask.id &&
        o.siteId === "site-a",
    ),
);
await go("/tasks");
const completed = page
  .locator(".task-card")
  .filter({ hasText: "Flower Visitor Watch" });
assert((await completed.innerText()).includes("100%"));
const recordsBeforeReward = JSON.stringify((await state()).observations);
await completed
  .getByRole("button", { name: "Collect Reward", exact: true })
  .click();
assert(
  await completed
    .getByRole("button", { name: "Completed", exact: true })
    .isDisabled(),
);
assert.equal(JSON.stringify((await state()).observations), recordsBeforeReward);
await page.setViewportSize({ width: 1440, height: 900 });
await go("/researcher-demo");
await page
  .getByRole("button", { name: "Research Projects", exact: true })
  .click();
await page
  .getByRole("button", { name: "View linked records for Flower Visitor Watch" })
  .click();
assert.equal(await page.locator("tbody tr").count(), 2);
await page.getByLabel("Filter task", { exact: true }).selectOption("All");
await page.getByLabel("Filter species", { exact: true }).selectOption("3");
assert.equal(await page.locator("tbody tr").count(), 6);
await page.getByLabel("Filter species", { exact: true }).selectOption("All");
await page
  .getByLabel("Filter identification uncertainty")
  .selectOption("Unconfirmed");
assert.equal(await page.locator("tbody tr").count(), 1);
await page.getByLabel("Filter identification uncertainty").selectOption("All");
const dl = page.waitForEvent("download");
await page
  .getByRole("button", { name: "Example Dataset", exact: true })
  .click();
const file = await dl;
await file.saveAs("presentation-assets/example-upgraded-dataset.csv");
const csv = await fs.readFile(
  "presentation-assets/example-upgraded-dataset.csv",
  "utf8",
);
assert.equal(csv.split("\r\n").length, 19);
assert(csv.includes("projectId"));
assert(!csv.includes("decimalLatitude"));
await page
  .getByRole("button", { name: "Site Monitoring", exact: true })
  .click();
assert.equal(await page.locator(".monitoring-card").count(), 6);
await page
  .locator(".monitoring-card")
  .first()
  .getByRole("button", { name: "Inspect Visit Timeline" })
  .click();
assert.equal(await page.locator(".timeline>div").count(), 5);
await page.getByRole("button", { name: "Close dialog" }).click();
await page.screenshot({
  path: "presentation-assets/23-research-site-monitoring.png",
  fullPage: true,
});
console.log(
  "PASS new project/task publication, protocol-linked repeat observations, one-time reward, researcher filters, sample dataset export and monitoring",
);
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
    await go(path);
    assert(
      !(await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      )),
      `Overflow ${path} at ${size.width}`,
    );
  }
}
console.log("PASS upgraded routes at all four requested viewports");
assert.equal(errors.length, 0, errors.join("\n"));
await browser.close();
console.log("PASS upgraded screenshots captured; no browser runtime errors");
