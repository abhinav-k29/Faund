import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";
const root = "artifacts/visual-audit";
const phases = ["before", "iteration-1", "iteration-2", "final"];
const rows = [
  ["Home · 390×844", "390-home.png"],
  ["Scanner · 360×800", "360-scan.png"],
  ["Collection · 390×844", "390-collection.png"],
  ["Wattlet · mature roots and flowering", "model-2-stage-3.png"],
  ["Bumbloom · bee anatomy", "model-3-stage-1.png"],
  ["Chuckleroot · bill and tail", "model-4-stage-3.png"],
  ["Mistleaf · mature framing", "model-5-stage-3.png"],
  ["Meadow · grounding and scale", "biome-meadow.png"],
];
for (const phase of phases)
  for (const [, file] of rows) await fs.access(`${root}/${phase}/${file}`);
const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Wilsee visual review · four passes</title><style>body{margin:0;background:#f5f3ea;color:#163e35;font:16px system-ui;padding:32px}h1{font:42px Georgia;margin:0}p{max-width:1050px;line-height:1.5}a{color:inherit}section{margin:28px 0;border-top:1px solid #bcc9ac;padding-top:12px}h2{font-size:20px}article{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}figure{margin:0;padding:10px;border:1px solid #d8dfce;border-radius:14px;background:#fffef8}figcaption{font-weight:700;margin:0 0 10px}img{display:block;width:100%;height:auto;border-radius:8px}footer{font-size:13px} @media(max-width:700px){article{grid-template-columns:repeat(2,minmax(0,1fr))}}</style><h1>Wilsee · four visual review passes</h1><p>The existing prototype, first revision, second revision and verified final view. Original screenshots are linked at full resolution. Chromium / reduced motion / software WebGL; model renders are actual 3D canvases. These comparisons demonstrate visual changes, not physical phone performance.</p>${rows.map(([label, file]) => `<section><h2>${label}</h2><article>${phases.map((phase) => `<figure><figcaption>${phase}</figcaption><a href="${phase}/${file}"><img src="${phase}/${file}" alt="${label}, ${phase}"></a></figure>`).join("")}</article></section>`).join("")}<footer>Review rationale and subjective scorecards: <a href="../../docs/WILSEE_QUALITY_REPORT.md">quality report</a>. Individual captures and timing samples remain in each phase folder.</footer></html>`;
await fs.writeFile(`${root}/comparison.html`, html);
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  await page.goto(pathToFileURL(path.resolve(`${root}/comparison.html`)).href);
  await page.evaluate(async () =>
    Promise.all([...document.images].map((image) => image.decode())),
  );
  await page.screenshot({ path: `${root}/comparison.png`, fullPage: true });
  console.log("PASS linked four-pass comparison and contact sheet captured");
} finally {
  await browser.close();
}
