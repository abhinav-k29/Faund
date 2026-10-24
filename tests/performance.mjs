import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
import os from "node:os";
const report = {
  capturedAt: new Date().toISOString(),
  environment: {
    platform: process.platform,
    node: process.version,
    cpu: os.cpus()[0]?.model,
    memoryGB: Math.round(os.totalmem() / 1024 ** 3),
    viewport: "390×844, DPR 1",
    network:
      "localhost, no network/CPU throttling; production preview; service worker blocked for cold samples",
  },
  routes: [],
  interactions: [],
  errors: [],
};
const browser = await chromium.launch({ headless: true });
try {
  const setup = await browser.newPage();
  await setup.goto("http://localhost:5173/consent");
  await setup.getByRole("checkbox").nth(0).check();
  await setup.getByRole("checkbox").nth(1).check();
  await setup
    .getByRole("button", { name: "I Agree — Start Exploring" })
    .click();
  await setup.waitForURL("**/home");
  const state = await setup.evaluate(() =>
    localStorage.getItem("nature-discovery-v1"),
  );
  await setup.close();
  for (const route of [
    "/home",
    "/scan",
    "/collection",
    "/tasks",
    "/map",
    "/card/3",
    "/researcher-demo",
  ]) {
    const samples = [];
    for (let run = 0; run < 3; run++) {
      const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 1,
        reducedMotion: "reduce",
        serviceWorkers: "block",
      });
      await context.addInitScript((state) => {
        localStorage.setItem("nature-discovery-v1", state);
        window.vitals = { lcp: 0, cls: 0 };
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries())
            window.vitals.lcp = entry.startTime;
        }).observe({ type: "largest-contentful-paint", buffered: true });
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries())
            if (!entry.hadRecentInput) window.vitals.cls += entry.value;
        }).observe({ type: "layout-shift", buffered: true });
      }, state);
      const page = await context.newPage();
      page.on("pageerror", (error) => report.errors.push(error.message));
      const start = performance.now();
      await page.goto("http://localhost:4173" + route);
      await page.locator("h1").first().waitFor();
      const headingMs = performance.now() - start;
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(700);
      samples.push(
        await page.evaluate((headingMs) => {
          const nav = performance.getEntriesByType("navigation")[0],
            resources = performance.getEntriesByType("resource");
          return {
            ...window.vitals,
            headingMs: Math.round(headingMs),
            domContentLoadedMs: Math.round(nav.domContentLoadedEventEnd),
            resourceRequests: resources.length,
            encodedScriptBytes: resources
              .filter((resource) =>
                new URL(resource.name).pathname.endsWith(".js"),
              )
              .reduce((sum, resource) => sum + resource.encodedBodySize, 0),
            sceneEngineRequested: resources.some((resource) =>
              resource.name.includes("scene-canvas-"),
            ),
          };
        }, headingMs),
      );
      if (run === 2) {
        const start = performance.now();
        if (route === "/card/3") {
          await page
            .getByRole("button", { name: "Real Species ↔ Companion" })
            .click();
          await page.locator(".flip-inner.flipped").waitFor();
          report.interactions.push({
            name: "Card flip",
            automationWallMs: Math.round(performance.now() - start),
          });
        }
        if (route === "/tasks") {
          await page.getByRole("button", { name: "View Task" }).first().click();
          await page.locator("dialog").waitFor();
          report.interactions.push({
            name: "Task details",
            automationWallMs: Math.round(performance.now() - start),
          });
        }
        if (route === "/map") {
          await page.getByRole("button", { name: "List", exact: true }).click();
          await page.locator(".map-observation-list").waitFor();
          report.interactions.push({
            name: "Map to journal",
            automationWallMs: Math.round(performance.now() - start),
          });
        }
      }
      await context.close();
    }
    const median = (key) =>
      [...samples].map((sample) => sample[key]).sort((a, b) => a - b)[1];
    report.routes.push({
      route,
      samples,
      median: {
        headingMs: median("headingMs"),
        lcp: median("lcp"),
        cls: median("cls"),
        encodedScriptBytes: median("encodedScriptBytes"),
      },
    });
    console.log(route, report.routes.at(-1).median);
  }
  report.bundle = [];
  const zlib = await import("node:zlib");
  for (const file of await fs.readdir("dist/assets"))
    if (file.endsWith(".js")) {
      const content = await fs.readFile("dist/assets/" + file);
      report.bundle.push({
        file,
        bytes: content.length,
        gzipBytes: zlib.gzipSync(content).length,
      });
    }
  const sceneBrowser = await chromium.launch({
    headless: true,
    args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
  });
  report.scenes = [];
  try {
    const context = await sceneBrowser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 1,
      serviceWorkers: "block",
    });
    await context.addInitScript(
      (state) => localStorage.setItem("nature-discovery-v1", state),
      state,
    );
    const page = await context.newPage();
    page.on("pageerror", (error) => report.errors.push(error.message));
    const sample = async (label, entryMs) => {
      await page.locator(".scene-stage").scrollIntoViewIfNeeded();
      await page.waitForTimeout(1200);
      const frameSamples = [];
      for (let i = 0; i < 3; i++) {
        await page.waitForTimeout(1100);
        frameSamples.push(
          Number(
            await page.locator(".scene-canvas").getAttribute("data-frame-ms"),
          ),
        );
      }
      const metrics = await page
        .locator(".scene-canvas")
        .evaluate((el) => ({ ...el.dataset }));
      report.scenes.push({
        label,
        entryMs,
        ...metrics,
        frameSamples,
        medianFrameIntervalMs: [...frameSamples].sort((a, b) => a - b)[1],
      });
      console.log("Scene", label, metrics);
    };
    let start = performance.now();
    await page.goto("http://localhost:4173/character/0");
    await page.locator('[data-scene-ready="true"]').waitFor({ timeout: 60000 });
    await sample("Pipwing · balanced", Math.round(performance.now() - start));
    await page.getByLabel("Graphics quality").selectOption("low");
    await sample("Pipwing · lightweight");
    await page.getByLabel("Graphics quality").selectOption("balanced");
    start = performance.now();
    await page.goto("http://localhost:4173/explore");
    await page.locator('[data-scene-ready="true"]').waitFor({ timeout: 60000 });
    const worldEntryMs = Math.round(performance.now() - start);
    for (const biome of ["Meadow", "Woodland", "Misty Grove"]) {
      await page.getByRole("button", { name: new RegExp("^" + biome) }).click();
      await page.getByLabel("Graphics quality").selectOption("balanced");
      await sample(
        biome + " · balanced",
        biome === "Meadow" ? worldEntryMs : undefined,
      );
      await page.getByLabel("Graphics quality").selectOption("low");
      await sample(biome + " · lightweight");
    }
  } finally {
    await sceneBrowser.close();
  }
  console.log(
    "PASS production measurements captured; lab samples are not field INP or phone FPS",
  );
} finally {
  await browser.close();
  await fs.mkdir("artifacts/performance", { recursive: true });
  await fs.writeFile(
    "artifacts/performance/results.json",
    JSON.stringify(report, null, 2),
  );
}
