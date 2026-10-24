import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const base = "http://localhost:5173",
  key = "nature-discovery-v1";
const report = {
  capturedAt: new Date().toISOString(),
  environment:
    "Windows desktop Chromium; software WebGL via SwiftShader, not physical phone performance",
  datasets: [],
  checks: [],
  models: [],
  errors: [],
};
await fs.mkdir("artifacts/stress", { recursive: true });
let browser;
const check = (name) => {
  report.checks.push(name);
  console.log("PASS " + name);
};
try {
  browser = await chromium.launch({ headless: true });
  let context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  await context.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return type === "webgl2" ? null : original.call(this, type, ...args);
    };
  });
  let page = await context.newPage();
  page.on("pageerror", (e) => report.errors.push(e.message));
  const go = async (path) => {
    const start = performance.now();
    await page.goto(base + path);
    await page.locator("h1").first().waitFor();
    return Math.round(performance.now() - start);
  };
  const state = () =>
    page.evaluate((key) => JSON.parse(localStorage.getItem(key)), key);
  const put = async (value) => {
    await page.evaluate(
      ({ key, value }) => localStorage.setItem(key, JSON.stringify(value)),
      { key, value },
    );
  };
  await go("/consent");
  await page.getByRole("checkbox").nth(0).check();
  await page.getByRole("checkbox").nth(1).check();
  await page.getByRole("button", { name: "I Agree — Start Exploring" }).click();
  await page.waitForURL("**/home");
  const demo = await state();
  for (const count of [0, 1, 20, 100, 500]) {
    const value = structuredClone(demo);
    value.startMode = "fresh";
    value.sites = [];
    value.observations = Array.from({ length: count }, (_, i) => ({
      ...demo.observations[i % 23],
      id: "stress-" + i,
      speciesId: i % 6,
      provisional: "",
      siteId: "",
      taskId: "",
      projectId: "",
      location:
        i === 0 && count >= 20
          ? "SENSITIVE STRESS LOCATION"
          : "Fictional stress area " + i,
      coordinates: {
        lat: -33.9 + (i % 25) * 0.001,
        lon: 151.1 + Math.floor(i / 25) * 0.001,
      },
      sensitive: i === 0 && count >= 20,
      research: {
        status: "submitted",
        receiptId: "stress-receipt-" + i,
        agreementConsentId: demo.consents.at(-1).id,
        agreementVersion: "1.1",
        events: [],
      },
    }));
    await put(value);
    const journalMs = await go("/contributions");
    await expect(page.locator(".observation-row")).toHaveCount(
      Math.min(count, 50),
    );
    const mapMs = await go("/map");
    await page.locator(".leaflet-image-layer").waitFor();
    await expect(page.locator(".discovery-pin")).toHaveCount(
      count - (count >= 20 ? 1 : 0),
    );
    await page.getByRole("button", { name: "List", exact: true }).click();
    await expect(page.locator(".observation-row")).toHaveCount(
      Math.min(count, 50),
    );
    if (count > 50) {
      await page
        .getByRole("button", { name: "Show 50 More Observations" })
        .click();
      await expect(page.locator(".observation-row")).toHaveCount(100);
    }
    const researchMs = await go("/researcher-demo");
    await expect(page.locator("tbody tr")).toHaveCount(Math.min(count, 50));
    if (count > 50) {
      await page
        .getByRole("button", { name: "Show 50 More Observations" })
        .click();
      await expect(page.locator("tbody tr")).toHaveCount(100);
    }
    if (count) {
      const pending = page.waitForEvent("download");
      await page
        .getByRole("button", { name: "Export CSV", exact: true })
        .click();
      const download = await pending;
      const path = `artifacts/stress/${count}-observations.csv`;
      await download.saveAs(path);
      const csv = await fs.readFile(path, "utf8");
      assert.equal(csv.trim().split("\n").length, count + 1);
      assert(!csv.includes("SENSITIVE STRESS LOCATION"));
      assert(!csv.includes("decimalLatitude"));
    }
    const collectionMs = await go("/collection");
    await expect(page.locator(".collectible-preview")).toHaveCount(
      Math.min(count, 6),
    );
    report.datasets.push({
      observations: count,
      catalogueSpecies: 6,
      journalMs,
      mapMs,
      researchMs,
      collectionMs,
    });
    if (count === 500) {
      await go("/map");
      await page.screenshot({ path: "artifacts/stress/500-map.png" });
      await go("/researcher-demo");
      await page.screenshot({ path: "artifacts/stress/500-research.png" });
    }
    check(
      `${count} observations: journal/map/research/collection counts, bounded rows and full CSV`,
    );
  }
  await put(demo);
  await go("/card/3");
  await page
    .getByRole("button", { name: "Real Species ↔ Companion" })
    .evaluate((button) => {
      for (let i = 0; i < 31; i++) button.click();
    });
  await expect(
    page.getByRole("button", { name: "Real Species ↔ Companion" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Real Species ↔ Companion" }),
  ).toHaveAttribute("aria-pressed", "true");
  for (let i = 0; i < 10; i++) {
    await go("/map");
    const trigger = page.locator(".map-place-list>button").first();
    await trigger.click();
    await page.keyboard.press("Escape");
    await expect(page.locator("dialog")).toHaveCount(0);
    await expect(trigger).toBeFocused();
  }
  await go("/home");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
  for (const path of [
    "/identify/999",
    "/record/nope",
    "/unlock/-1",
    "/card/999",
    "/character/999",
  ]) {
    await go(path);
    assert(
      !/\/(identify|record|unlock|card|character)\/(999|nope|-1)/.test(
        page.url(),
      ),
    );
  }
  check(
    "31 rapid flips retain parity and refresh state; ten modal cycles restore focus; skip link and invalid routes",
  );
  await go("/scan");
  for (const file of [
    {
      name: "empty.png",
      mimeType: "image/png",
      buffer: Buffer.alloc(0),
      message: /file is empty/,
    },
    {
      name: "broken.png",
      mimeType: "image/png",
      buffer: Buffer.from("broken image bytes"),
      message: /could not be read/,
    },
    {
      name: "notes.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("not an image"),
      message: /Choose an image file/,
    },
    {
      name: "vector.svg",
      mimeType: "image/svg+xml",
      buffer: Buffer.from("<svg/>"),
      message: /Choose a photograph/,
    },
    {
      name: "huge.jpg",
      mimeType: "image/jpeg",
      buffer: Buffer.alloc(15 * 1024 * 1024 + 1),
      message: /smaller than 15 MB/,
    },
  ]) {
    await page.locator("input[type=file]").setInputFiles({
      name: file.name,
      mimeType: file.mimeType,
      buffer: file.buffer,
    });
    await page.getByText(file.message).waitFor();
  }
  await page.locator("input[type=file]").setInputFiles("public/images/0.jpg");
  await page.locator(".camera-view img").waitFor();
  await page.waitForFunction(() =>
    JSON.parse(
      sessionStorage.getItem("nature-discovery-v1:draft") || "{}",
    ).photo?.startsWith("data:image/jpeg"),
  );
  const photo = await page.evaluate(
    () => JSON.parse(sessionStorage.getItem("nature-discovery-v1:draft")).photo,
  );
  await page.reload();
  await expect(page.locator(".camera-view img")).toHaveAttribute("src", photo);
  await page.locator("input[type=file]").setInputFiles("public/images/0.jpg");
  await expect(page.locator(".camera-view img")).toHaveAttribute("src", photo);
  const wide = await page.evaluate(() => {
    const c = document.createElement("canvas");
    c.width = 6000;
    c.height = 60;
    c.getContext("2d").fillRect(0, 0, c.width, c.height);
    return c.toDataURL("image/png").split(",")[1];
  });
  await page.locator("input[type=file]").setInputFiles({
    name: "wide.png",
    mimeType: "image/png",
    buffer: Buffer.from(wide, "base64"),
  });
  await page.waitForFunction(
    () =>
      document.querySelector(".camera-view img")?.src !==
      JSON.parse(sessionStorage.getItem("nature-discovery-v1:draft") || "{}")
        .old,
  );
  await page.waitForTimeout(200);
  const dimensions = await page.evaluate(async () => {
    const { photo } = JSON.parse(
      sessionStorage.getItem("nature-discovery-v1:draft"),
    );
    const image = new Image();
    image.src = photo;
    await image.decode();
    return [image.width, image.height];
  });
  assert.deepEqual(dimensions, [1200, 12]);
  await page.evaluate(() => {
    const original = Image.prototype.decode;
    let count = 0;
    Image.prototype.decode = async function () {
      await original.call(this);
      if (++count === 1)
        await new Promise((resolve) => setTimeout(resolve, 350));
    };
  });
  await page.locator("input[type=file]").setInputFiles("public/images/0.jpg");
  await page.locator("input[type=file]").setInputFiles("public/images/3.jpg");
  await page.waitForTimeout(500);
  const newest = await page.evaluate(async () => {
    const { readPhoto } = await import("/src/ui.tsx");
    return readPhoto(
      new File([await (await fetch("/images/3.jpg")).blob()], "bee.jpg", {
        type: "image/jpeg",
      }),
    );
  });
  await expect(page.locator(".camera-view img")).toHaveAttribute("src", newest);
  await page
    .getByRole("button", { name: "Blue-banded Bee", exact: true })
    .click();
  await page.reload();
  await page.waitForTimeout(2400);
  assert(page.url().endsWith("/scan"));
  assert.equal((await state()).observations.length, 24);
  await page.getByRole("button", { name: "Clear photo" }).click();
  await page.evaluate(() => {
    const c = document.createElement("canvas");
    c.width = 20;
    c.height = 20;
    window.testStream = c.captureStream(5);
    Object.defineProperty(navigator.mediaDevices, "getUserMedia", {
      configurable: true,
      value: async () => {
        await new Promise((r) => setTimeout(r, 250));
        return window.testStream;
      },
    });
  });
  await page.getByRole("button", { name: "Enable camera" }).click();
  await page.getByRole("button", { name: "Clear photo" }).click();
  await page.waitForTimeout(400);
  assert(
    await page.evaluate(() =>
      window.testStream
        .getTracks()
        .every((track) => track.readyState === "ended"),
    ),
  );
  assert.equal(await page.locator("video").count(), 0);
  check(
    "empty/corrupt/wrong-type/SVG/oversized/repeated/wide uploads; latest upload wins; draft photo refresh; analysis cancellation; stale camera tracks stop",
  );
  await put(demo);
  await go("/contributions?record=sample-21");
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
  const submitted = await state();
  assert(
    submitted.observations.find((o) => o.id === "sample-21").research.receiptId,
  );
  const other = await context.newPage();
  await other.goto(base + "/researcher-demo");
  await other.getByText("24 matching records", { exact: false }).waitFor();
  await page
    .getByRole("button", { name: "Withdraw This Research Permission" })
    .click();
  await page
    .getByRole("button", { name: "Confirm Permission Withdrawal" })
    .click();
  await other.getByText("23 matching records", { exact: false }).waitFor();
  const withdrawn = await state();
  assert.equal(withdrawn.observations.length, 24);
  assert.equal(withdrawn.xp, demo.xp);
  assert.equal(
    withdrawn.observations.find((o) => o.id === "sample-21").research.status,
    "withdrawn",
  );
  const pending = other.waitForEvent("download");
  await other.getByRole("button", { name: "Export CSV", exact: true }).click();
  const dl = await pending;
  await dl.saveAs("artifacts/stress/after-withdrawal.csv");
  assert(
    !(
      await fs.readFile("artifacts/stress/after-withdrawal.csv", "utf8")
    ).includes("sample-21,"),
  );
  await go("/community/blooming-meadow?fallback=1");
  const publicShape = await page.evaluate(async () => {
    const { communityWorlds } = await import("/src/community-data.ts");
    return communityWorlds;
  });
  assert(!JSON.stringify(publicShape).includes("sample-"));
  assert(
    publicShape.every((world) =>
      Object.keys(world).every((key) =>
        [
          "id",
          "username",
          "name",
          "biome",
          "characters",
          "description",
          "appreciations",
          "demoOnly",
        ].includes(key),
      ),
    ),
  );
  await other.close();
  check(
    "explicit permission receipt and withdrawal update the other tab and CSV without deleting the journal/XP; curated Community contains no scientific records",
  );
  const partial = structuredClone(demo);
  partial.observations = [
    {
      id: "partial-record",
      speciesId: 999,
      observedAt: "2026-10-20T11:00:00+11:00",
      location: "Unknown metadata example",
    },
  ];
  await put(partial);
  await go("/contributions?record=partial-record");
  await page
    .getByText("Some metadata was not recorded", { exact: false })
    .waitFor();
  await page.getByRole("button", { name: "Close dialog" }).click();
  await go("/map");
  await go("/collection");
  const long = structuredClone(demo);
  long.observations[0].notes =
    "<script>window.injected=true</script>" +
    "long observation notes ".repeat(180);
  long.observations[0].location = "A".repeat(200);
  long.tasks[2].title = "A long research title ".repeat(30);
  await put(long);
  await go("/contributions?record=sample-1");
  assert(!(await page.evaluate(() => window.injected)));
  await page.getByRole("button", { name: "Close dialog" }).click();
  await go("/tasks");
  assert(
    !(await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    )),
  );
  await page.evaluate(
    (key) => localStorage.setItem(key, "{unreadable-private-journal"),
    key,
  );
  await go("/home");
  await page
    .getByRole("heading", { name: "Your saved journal needs recovery" })
    .waitFor();
  assert.equal(
    await page.evaluate((key) => localStorage.getItem(key), key),
    "{unreadable-private-journal",
  );
  await page.reload();
  assert.equal(
    await page.evaluate((key) => localStorage.getItem(key), key),
    "{unreadable-private-journal",
  );
  await put(demo);
  await go("/home");
  await page.route("**/images/3.jpg", (route) => route.abort());
  await go("/identify/3");
  await page
    .getByRole("img", { name: "Blue-banded Bee photograph unavailable" })
    .waitFor();
  await page.unroute("**/images/3.jpg");
  const streets = structuredClone(demo);
  streets.observations = streets.observations.filter((o) => !o.sensitive);
  await put(streets);
  await go("/map");
  await page.route("**://tile.openstreetmap.org/**", (route) => route.abort());
  await page
    .getByRole("button", { name: "Load street tiles · internet" })
    .click();
  await page.getByText("Tiles are unavailable", { exact: false }).waitFor();
  await expect(page.locator(".leaflet-image-layer")).toBeVisible();
  check(
    "partial/unknown metadata, long untrusted text, corrupted-data preservation, missing photo and failed street tiles recover honestly",
  );
  const storageState = await context.storageState();
  await browser.close();
  browser = await chromium.launch({
    headless: true,
    args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
  });
  context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
    storageState,
  });
  page = await context.newPage();
  page.on("pageerror", (e) => report.errors.push(e.message));
  await go("/character/0");
  await page.locator('[data-scene-ready="true"]').waitFor({ timeout: 60000 });
  const cdp = await context.newCDPSession(page);
  await cdp.send("Performance.enable");
  const resources = () =>
    page
      .locator(".scene-canvas")
      .evaluate((el) =>
        Object.fromEntries(
          [
            "drawCalls",
            "triangles",
            "geometries",
            "textures",
            "frameMs",
            "stages",
          ].map((key) => [key, el.dataset[key]]),
        ),
      );
  const heap = async () => {
    await cdp.send("HeapProfiler.collectGarbage");
    return (await cdp.send("Performance.getMetrics")).metrics.find(
      (metric) => metric.name === "JSHeapUsedSize",
    ).value;
  };
  for (let id = 0; id < 6; id++) {
    await page.getByLabel("Choose companion").selectOption(String(id));
    for (let stage = 1; stage <= 3; stage++) {
      await page
        .getByRole("button", { name: `Preview evolution stage ${stage}` })
        .click();
      await page.waitForTimeout(250);
    }
    await page.waitForTimeout(1100);
    report.models.push({ id, ...(await resources()) });
  }
  const warm = { resources: await resources(), heapBytes: await heap() };
  for (let i = 0; i < 60; i++) {
    await page.getByLabel("Choose companion").selectOption(String(i % 6));
    await page
      .getByRole("button", { name: `Preview evolution stage ${(i % 3) + 1}` })
      .click();
    if (i % 10 === 0) await page.waitForTimeout(100);
  }
  await page.waitForTimeout(1100);
  const after = { resources: await resources(), heapBytes: await heap() };
  report.modelStress = { switches: 60, warm, after };
  assert(
    Number(after.resources.geometries) <=
      Number(warm.resources.geometries) + 12,
    "Geometry resources grew after warm-up",
  );
  assert(
    after.heapBytes < warm.heapBytes + 20 * 1024 * 1024,
    "Post-GC heap grew by over 20 MB during 60 model switches",
  );
  console.log(
    "PASS 60 model switches: geometry " +
      warm.resources.geometries +
      " → " +
      after.resources.geometries +
      "; post-GC heap " +
      warm.heapBytes +
      " → " +
      after.heapBytes,
  );
  const imageBefore = await page
    .locator("canvas")
    .evaluate((c) => c.toDataURL());
  await page.getByRole("button", { name: "Rotate left", exact: true }).focus();
  await page.keyboard.press("Enter");
  await page.waitForTimeout(200);
  assert.notEqual(
    await page.locator("canvas").evaluate((c) => c.toDataURL()),
    imageBefore,
  );
  await page.getByRole("button", { name: "Zoom in", exact: true }).click();
  await page.getByRole("button", { name: "Reset 3D camera" }).click();
  await page.getByLabel("Graphics quality").selectOption("low");
  await page.waitForTimeout(200);
  await page.getByLabel("Graphics quality").selectOption("illustrated");
  await page.locator(".scene-fallback").waitFor();
  await page.getByLabel("Graphics quality").selectOption("balanced");
  await page.locator('[data-scene-ready="true"]').waitFor({ timeout: 60000 });
  for (const [width, height] of [
    [1440, 900],
    [1280, 800],
    [768, 1024],
    [390, 844],
    [360, 800],
  ]) {
    await page.setViewportSize({ width, height });
    await page.waitForTimeout(100);
    assert(
      !(await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      )),
    );
  }
  await page
    .locator("canvas")
    .evaluate((c) =>
      c.getContext("webgl2").getExtension("WEBGL_lose_context").loseContext(),
    );
  await page.locator(".scene-fallback").waitFor();
  await page.getByRole("button", { name: "Try 3D Again" }).click();
  await page.locator('[data-scene-ready="true"]').waitFor({ timeout: 60000 });
  for (let i = 0; i < 6; i++) {
    await go("/home");
    assert.equal(await page.locator("canvas").count(), 0);
    await go("/character/" + i);
    await page.locator('[data-scene-ready="true"]').waitFor({ timeout: 60000 });
  }
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.getByRole("button", { name: "Pause animations" }).click();
  await expect(page.locator(".scene-canvas")).toHaveAttribute(
    "data-render-mode",
    "demand",
  );
  await expect(
    page.getByRole("button", { name: "Resume animations" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await page.locator('[data-scene-ready="true"]').waitFor({ timeout: 60000 });
  await expect(
    page.getByRole("button", { name: "Resume animations" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Resume animations" }).click();
  await page.locator(".scene-stage").scrollIntoViewIfNeeded();
  await expect(page.locator(".scene-canvas")).toHaveAttribute(
    "data-render-mode",
    "always",
  );
  await page.waitForTimeout(1300);
  report.animatedSoftwareFrame = await resources();
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect(page.locator(".scene-canvas")).toHaveAttribute(
    "data-render-mode",
    "never",
  );
  check(
    "all six models and stages; 60 warmed model switches; renderer/heap bounds; keyboard camera; graphics fallback; five resizes; context loss/retry; six scene exits; persistent pause",
  );
  assert.deepEqual(report.errors, []);
  console.log("PASS no runtime page errors");
} catch (error) {
  report.failure = error.stack;
  console.error(error);
  process.exitCode = 1;
} finally {
  await browser?.close();
  await fs.writeFile(
    "artifacts/stress/results.json",
    JSON.stringify(report, null, 2),
  );
}
