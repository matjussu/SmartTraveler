#!/usr/bin/env node
/**
 * Capture Playwright des 2 écrans (home + trip result) pour une direction donnée.
 * Usage : node scripts/screenshot.mjs <direction-slug>
 * Ex   : node scripts/screenshot.mjs compass-editorial
 *
 * Le port dev est lu depuis l'arg --port=XXXX (défaut 3003).
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const args = process.argv.slice(2);
const direction = args.find((a) => !a.startsWith("--")) ?? "unknown";
const portArg = args.find((a) => a.startsWith("--port="));
const port = portArg ? portArg.split("=")[1] : "3003";

const OUT_DIR = resolve(process.cwd(), "docs/design-directions");
mkdirSync(OUT_DIR, { recursive: true });

const screens = [
  { name: "home", path: "/" },
  { name: "result", path: "/trip/trip-mediterranee/result" },
];

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});
const page = await context.newPage();
// Mock prefers-color-scheme: light
await page.emulateMedia({ colorScheme: "light", reducedMotion: "no-preference" });

for (const s of screens) {
  const url = `http://localhost:${port}${s.path}`;
  console.log(`-> ${url}`);
  await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 });
  // Wait for Leaflet tiles if any
  if (s.path.includes("result")) {
    await page.waitForTimeout(3500);
  } else {
    await page.waitForTimeout(800);
  }
  const file = resolve(OUT_DIR, `${direction}-${s.name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  console.log(`   saved ${file}`);
}

await browser.close();
console.log("Done.");
