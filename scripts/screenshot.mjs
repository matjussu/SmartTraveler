#!/usr/bin/env node
/**
 * Capture full-page 1440x900 @2x des 2 écrans clés voyage-pivot.
 * Usage : node scripts/screenshot.mjs [port]
 */

import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, "..", "docs/design-directions/v2");

const PORT = process.argv[2] || process.env.PORT || "3001";
const BASE = `http://localhost:${PORT}`;

const SCREENS = [
  { path: "/", out: "voyage-pivot-home.png", waitExtra: 800 },
  {
    path: "/trip/trip-mediterranee/result",
    out: "voyage-pivot-result.png",
    waitExtra: 2400, // tiles Leaflet
  },
];

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    locale: "fr-FR",
  });
  const page = await context.newPage();

  for (const s of SCREENS) {
    const url = `${BASE}${s.path}`;
    console.log(`-> ${url}`);
    await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 });
    // attendre fonts + tiles
    await page.waitForTimeout(s.waitExtra);
    // force loading des polices
    await page.evaluate(() => document.fonts && document.fonts.ready);
    await page.waitForTimeout(400);
    const out = resolve(OUT_DIR, s.out);
    await page.screenshot({ path: out, fullPage: true });
    console.log(`   saved ${out}`);
  }

  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
