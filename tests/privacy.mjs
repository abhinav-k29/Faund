import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage(),
    errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const go = async (path) => {
    await page.goto("http://localhost:5173" + path);
    await page.locator("h1").first().waitFor();
  };
  const state = () =>
    page.evaluate(() =>
      JSON.parse(localStorage.getItem("nature-discovery-v1")),
    );
  await go("/consent");
  await page.getByRole("checkbox").nth(0).check();
  await page.getByRole("checkbox").nth(1).check();
  await page.getByRole("radio", { name: /Fresh Explorer/ }).check();
  await page.getByRole("button", { name: "I Agree — Start Exploring" }).click();
  await page.waitForURL("**/home");
  await go("/record/0");
  await page.getByLabel("Date and time").fill("2026-10-20T10:00");
  await page
    .getByLabel("Observation notes")
    .fill("Fictional private event for an isolated regression test.");
  await page
    .getByRole("button", { name: "Save Observation" })
    .evaluate((button) => {
      button.click();
      button.click();
    });
  await page.waitForURL("**/unlock/0");
  let saved = await state();
  assert.equal(saved.observations.length, 1);
  assert.equal(saved.xp, 20);
  assert.equal(saved.observations[0].research.status, "private");
  assert.equal(saved.observations[0].review, "Not submitted");
  await go("/record/0");
  await page.getByLabel("Date and time").fill("2026-10-20T10:00");
  await page.getByRole("button", { name: "Save Observation" }).click();
  await page.waitForURL("**/contributions?record=*");
  saved = await state();
  assert.equal(saved.observations.length, 1);
  assert.equal(saved.xp, 20);
  await go("/home");
  await expect(page.locator(".research-callout")).toContainText(
    "0 observations submitted",
  );
  await go("/researcher-demo");
  await expect(page.locator("tbody tr")).toHaveCount(0);
  await go("/contributions?record=" + saved.observations[0].id);
  await page
    .getByRole("button", { name: "Review Research Submission" })
    .click();
  await expect(
    page.getByRole("button", { name: "Submit to Research Demo" }),
  ).toBeDisabled();
  await page
    .getByRole("checkbox", {
      name: "I authorise this observation for the local biodiversity research demonstration.",
    })
    .check();
  await page.getByRole("button", { name: "Submit to Research Demo" }).click();
  await page
    .getByText("Research submission receipt", { exact: true })
    .waitFor();
  await fs.mkdir("artifacts/quality", { recursive: true });
  await page.screenshot({ path: "artifacts/quality/research-receipt.png" });
  const receipt = (await state()).observations[0].research.receiptId;
  assert(receipt);
  await page.getByRole("button", { name: "Close dialog" }).click();
  await go("/home");
  await expect(page.locator(".research-callout")).toContainText(
    "1 observation submitted",
  );
  await go("/researcher-demo");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await go("/contributions?record=" + saved.observations[0].id);
  await page
    .getByRole("button", { name: "Withdraw This Research Permission" })
    .click();
  await page
    .getByRole("button", { name: "Confirm Permission Withdrawal" })
    .click();
  await page
    .getByText("Research permission withdrawn", { exact: true })
    .waitFor();
  await page.screenshot({ path: "artifacts/quality/withdrawn-permission.png" });
  await page.getByRole("button", { name: "Close dialog" }).click();
  assert.equal((await state()).observations.length, 1);
  assert.equal((await state()).xp, 20);
  await go("/home");
  await expect(page.locator(".research-callout")).toContainText(
    "0 observations submitted",
  );
  await go("/researcher-demo");
  await expect(page.locator("tbody tr")).toHaveCount(0);
  await go("/profile");
  await page
    .getByRole("button", { name: "Withdraw from Future Participation" })
    .click();
  await page.getByRole("button", { name: "Withdraw", exact: true }).click();
  await page.waitForURL("**/consent");
  await page
    .getByRole("button", { name: "Delete My Local Data", exact: true })
    .click();
  await page.getByRole("button", { name: "Keep My Data" }).click();
  assert.equal((await state()).observations.length, 1);
  await page
    .getByRole("button", { name: "Delete My Local Data", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Confirm Delete My Local Data" })
    .click();
  await page.waitForURL("http://localhost:5173/");
  saved = await state();
  assert.equal(saved.observations.length, 0);
  assert.equal(saved.consents.length, 0);
  assert.equal(saved.startMode, "fresh");
  assert.deepEqual(errors, []);
  console.log(
    "PASS private-by-default capture; rapid/exact-event duplicate saves grant once; informed receipt and withdrawal; independent local deletion without re-consent; no runtime errors",
  );
} finally {
  await browser.close();
}
