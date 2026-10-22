import { chromium } from "@playwright/test";
import { strict as assert } from "node:assert";
import fs from "node:fs/promises";
const base = "http://localhost:5173";
await fs.mkdir("presentation-assets", { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  reducedMotion: "reduce",
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const go = async (path) => {
  await page.goto(base + path);
  await page.waitForTimeout(200);
};
const state = async () =>
  page.evaluate(() => JSON.parse(localStorage.getItem("nature-discovery-v1")));
await go("/home");
assert(page.url().endsWith("/consent"));
assert(
  await page
    .getByRole("button", { name: "I Agree — Start Exploring" })
    .isDisabled(),
);
await page.getByRole("button", { name: "I Do Not Agree", exact: true }).click();
assert.equal((await state()).consents.at(-1).accepted, false);
await go("/scan");
assert(page.url().endsWith("/consent"));
await page.getByRole("checkbox").nth(0).check();
await page.getByRole("checkbox").nth(1).check();
await page.getByRole("button", { name: "I Agree — Start Exploring" }).click();
await page.waitForURL("**/home");
assert((await state()).consents.at(-1).timestamp);
console.log(
  "PASS consent required, decline gates routes, adult affirmation and persistence",
);
await page.getByRole("link", { name: "Discover Something New" }).click();
await page
  .getByRole("button", { name: "Rainbow Lorikeet", exact: true })
  .click();
await page.waitForURL("**/identify/0");
await page.screenshot({ path: "presentation-assets/03-identification.png" });
await page.getByRole("button", { name: "Looks Right" }).click();
await page.getByLabel("Save site as").fill("Site A · Street tree");
await page
  .getByLabel("Observation notes")
  .fill("Example sighting from a safe public path.");
await page.screenshot({ path: "presentation-assets/04-observation.png" });
await page.getByRole("button", { name: "Save Observation" }).click();
await page.waitForURL("**/unlock/0");
let s = await state();
assert.equal(s.observations.length, 1);
assert.equal(s.observations[0].consentId, s.consents.at(-1).id);
await page.getByRole("button", { name: "Meet Your Companion" }).click();
await page.getByRole("button", { name: "Add to My Ecosystem" }).click();
await page.waitForURL("**/ecosystem");
assert((await state()).ecosystem.includes(0));
await go("/card/0");
await page.getByRole("button", { name: "Real Species ↔ Companion" }).click();
assert(
  await page
    .locator(".flip-inner")
    .evaluate((el) => el.classList.contains("flipped")),
);
await page.reload();
assert.equal((await state()).observations.length, 1);
console.log(
  "PASS discovery, consent provenance, character unlock, card flip, ecosystem and persistence",
);
await go("/record/0");
await page.getByRole("button", { name: "Save Observation" }).click();
await page.waitForURL("**/card/0");
s = await state();
assert.equal(s.observations.length, 2);
assert.equal(new Set(s.observations.map((o) => o.speciesId)).size, 1);
await go("/identify/1");
await page.getByRole("button", { name: "Not Sure" }).click();
await page.getByRole("button", { name: "Save Observation" }).click();
await page.waitForURL("**/contributions");
assert.equal((await state()).observations.at(-1).speciesId, null);
console.log(
  "PASS repeated observations deduplicate collection; uncertain records preserved",
);
await go("/researcher-demo");
assert(await page.getByText("3 matching records").isVisible());
await page.getByRole("button", { name: "Inspect record" }).first().click();
await page.getByLabel("Internal demo review notes").fill("Demo review only.");
await page
  .getByRole("button", { name: "Needs clarification", exact: true })
  .click();
await page
  .getByLabel("Filter review status")
  .selectOption("Needs clarification");
assert.equal(await page.locator("tbody tr").count(), 1);
const downloadPromise = page.waitForEvent("download");
await page.getByRole("button", { name: "Export CSV" }).click();
const download = await downloadPromise;
await download.saveAs("presentation-assets/example-observations.csv");
const csv = await fs.readFile(
  "presentation-assets/example-observations.csv",
  "utf8",
);
assert(csv.includes("occurrenceID"));
assert(!csv.includes("decimalLatitude"));
console.log(
  "PASS research pipeline, metadata review, filters and functional CSV export",
);
await page.getByRole("button", { name: "Research Tasks", exact: true }).click();
await page.getByRole("button", { name: "Edit Demo Task" }).first().click();
await page.getByLabel("Task title").fill("Urban Tree Watch · updated");
await page.getByRole("button", { name: "Save Demo Task" }).click();
await go("/tasks");
assert(
  await page
    .getByRole("heading", { name: "Urban Tree Watch · updated" })
    .isVisible(),
);
await page.getByRole("button", { name: "View Task" }).first().click();
await page.getByRole("button", { name: "Start Task" }).click();
await page
  .getByRole("button", { name: "Tasmanian Blue Gum", exact: true })
  .click();
await page.waitForURL("**/identify/5");
await page.getByRole("button", { name: "Looks Right" }).click();
await page
  .getByLabel("Previously saved site")
  .selectOption({ label: "Site A · Street tree" });
await page
  .getByLabel("Observation notes")
  .fill("Demo foliage observation; canopy appears green.");
await page.getByRole("button", { name: "Save Observation" }).click();
await page.waitForURL("**/unlock/5");
assert.equal((await state()).observations.at(-1).taskId, "tree");
await go("/tasks");
await page.getByRole("button", { name: "Collect Reward" }).click();
const xp = (await state()).xp;
await page.reload();
assert(
  await page
    .getByRole("button", { name: "Completed", exact: true })
    .isDisabled(),
);
assert.equal((await state()).xp, xp);
await go("/sites");
await page.getByRole("button", { name: "View Observation Timeline" }).click();
assert.equal(await page.locator(".timeline>div").count(), 2);
await page.getByRole("slider").fill("70");
await page.getByRole("button", { name: "Close dialog" }).click();
console.log(
  "PASS editable published task, linked records, single reward collection and repeat-site timeline",
);
await go("/profile");
await page
  .getByRole("button", { name: "Withdraw from Future Participation" })
  .click();
await page.getByRole("button", { name: "Withdraw", exact: true }).click();
await page.waitForURL("**/consent");
await go("/record/0");
assert(page.url().endsWith("/consent"));
console.log("PASS withdrawal blocks further participation");
await page.getByRole("checkbox").nth(0).check();
await page.getByRole("checkbox").nth(1).check();
await page.getByRole("button", { name: "I Agree — Start Exploring" }).click();
await go("/profile");
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
    "/scan",
    "/collection",
    "/tasks",
    "/card/0",
    "/ecosystem",
    "/record/0",
    "/researcher-demo",
  ]) {
    await go(path);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    );
    assert(!overflow, `Overflow ${path} at ${size.width}`);
  }
}
console.log("PASS layout: 375×812, 390×844, 430×932, 1440×900");
await page.setViewportSize({ width: 390, height: 844 });
for (const [path, name] of [
  ["/home", "01-home"],
  ["/scan", "02-scanner"],
  ["/card/0", "05-species-card"],
  ["/card/0?side=character", "06-character-card"],
  ["/collection", "07-collection"],
  ["/ecosystem", "08-ecosystem"],
  ["/tasks", "09-tasks"],
]) {
  await go(path);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `presentation-assets/${name}.png` });
}
await page.setViewportSize({ width: 1440, height: 900 });
await go("/researcher-demo");
await page.screenshot({
  path: "presentation-assets/10-research-dashboard.png",
  fullPage: true,
});
await page.setViewportSize({ width: 1600, height: 900 });
await go("/showcase");
await page.getByRole("button", { name: "Research Flow", exact: true }).click();
await page.screenshot({ path: "presentation-assets/11-data-flow.png" });
await page.getByRole("button", { name: "Two-sided Card", exact: true }).click();
await page.screenshot({
  path: "presentation-assets/12-two-sided-card.png",
  fullPage: true,
});
await page.getByRole("button", { name: "Overview", exact: true }).click();
await page.waitForTimeout(700);
await page.screenshot({
  path: "presentation-assets/13-product-overview.png",
  fullPage: true,
});
await go("/profile");
await page.getByRole("button", { name: "Fresh Explorer · Reset Demo" }).click();
await page.getByRole("button", { name: "Reset Local Data" }).click();
await page.waitForURL(base + "/");
assert.equal((await state()).observations.length, 0);
assert.equal((await state()).consents.length, 0);
assert.equal(errors.length, 0, errors.join("\n"));
console.log("PASS reset, screenshots generated, no browser runtime errors");
await browser.close();
