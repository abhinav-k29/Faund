import { chromium } from "@playwright/test";
import { strict as assert } from "node:assert";
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  permissions: ["geolocation"],
  geolocation: { latitude: -33.86, longitude: 151.21, accuracy: 50 },
});
const page = await context.newPage();
await page.goto("http://localhost:5173/consent");
await page.getByRole("checkbox").nth(0).check();
await page.getByRole("checkbox").nth(1).check();
await page.getByRole("button", { name: "I Agree — Start Exploring" }).click();
const research = await context.newPage();
await research.goto("http://localhost:5173/researcher-demo");
await page.goto("http://localhost:5173/scan");
await page.evaluate(() => {
  Object.defineProperty(navigator.mediaDevices, "getUserMedia", {
    configurable: true,
    value: async () => {
      throw new Error("Camera permission declined. Choose a sample or photo.");
    },
  });
});
await page.getByRole("button", { name: "Enable camera" }).click();
assert(
  await page
    .getByText("Camera permission declined. Choose a sample or photo.")
    .isVisible(),
);
await page.locator("input[type=file]").setInputFiles("public/images/0.jpg");
await page
  .getByRole("button", { name: "Rainbow Lorikeet", exact: true })
  .click();
await page.waitForURL("**/identify/0");
await page.getByRole("button", { name: "Looks Right" }).click();
await page.getByRole("button", { name: "Use device location once" }).click();
await page
  .getByText("Device location attached privately.", { exact: false })
  .waitFor();
await page.getByLabel("Location description").fill("Sensitive demo locality");
await page.getByRole("checkbox").check();
await page.getByRole("button", { name: "Save Observation" }).click();
await page.waitForURL("**/unlock/0");
const s = await page.evaluate(() =>
  JSON.parse(localStorage.getItem("nature-discovery-v1")),
);
const o = s.observations[0];
assert(o.photo.startsWith("data:image/jpeg"));
assert.equal(o.coordinates.lat, -33.86);
await research.getByText("1 matching records", { exact: false }).waitFor();
await research.getByRole("button", { name: "Inspect record" }).click();
assert(
  await research
    .getByText("Photograph withheld for this sensitive observation.")
    .isVisible(),
);
assert(
  !(await research
    .getByText("Sensitive demo locality", { exact: true })
    .count()),
);
await research.getByRole("button", { name: "Close dialog" }).click();
const csv = await page.evaluate(async () => {
  const mod = await import("/src/store.ts");
  const s = JSON.parse(localStorage.getItem("nature-discovery-v1"));
  return mod.csvText(s.observations);
});
assert(!csv.includes("Sensitive demo locality"));
assert(!csv.includes("-33.86"));
assert(csv.includes("Restricted"));
console.log(
  "PASS camera denial fallback, local photo processing, explicit geolocation, cross-tab dataset updates and sensitive-data withholding",
);
await page.goto("http://localhost:5173/scan");
await page.evaluate(() => {
  const canvas = document.createElement("canvas");
  canvas.width = 320;
  canvas.height = 240;
  const stream = canvas.captureStream(5);
  window.__testStream = stream;
  Object.defineProperty(navigator.mediaDevices, "getUserMedia", {
    configurable: true,
    value: async () => stream,
  });
});
await page.getByRole("button", { name: "Enable camera" }).click();
await page.locator("video").waitFor();
await page.getByRole("link", { name: "Home", exact: true }).click();
await page.waitForURL("**/home");
await page.waitForFunction(() =>
  window.__testStream.getTracks().every((t) => t.readyState === "ended"),
);
assert(
  await page.evaluate(() =>
    window.__testStream.getTracks().every((t) => t.readyState === "ended"),
  ),
);
console.log(
  "PASS camera tracks stop when leaving the scanner (synthetic stream)",
);
await page.goto("http://localhost:5173/consent");
await page.getByRole("button", { name: "I Do Not Agree", exact: true }).click();
await page.waitForFunction(
  () =>
    JSON.parse(localStorage.getItem("nature-discovery-v1")).consents.at(-1)
      .accepted === false,
);
await page.goto("http://localhost:5173/scan");
await page.waitForURL("**/consent");
assert(page.url().endsWith("/consent"));
console.log(
  "PASS a newer declined decision supersedes an earlier accepted consent",
);
await browser.close();
