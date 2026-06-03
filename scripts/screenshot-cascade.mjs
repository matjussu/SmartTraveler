#!/usr/bin/env node
/**
 * Capture full-page 1440x900 @2x des écrans cascade voyage-pivot.
 * Usage : node scripts/screenshot-cascade.mjs [port]
 *
 * Sortie : docs/cascade-screens/<name>.png
 *
 * Note : ce script est complémentaire à scripts/screenshot.mjs (qui capture
 * les 2 écrans de base voyage-pivot). Il est utilisé par les sub-agents de
 * la cascade pour livrer leur écran avant audit.
 */

import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, "..", "docs/cascade-screens");

const PORT = process.argv[2] || process.env.PORT || "3001";
const BASE = `http://localhost:${PORT}`;

// Variantes capturées pour /trip/new : empty + filled-preview.
// Les sub-agents en aval ajouteront leur(s) entrée(s) ici lors de leur dispatch.
const SCREENS = [
  { path: "/trip/new", out: "new.png", waitExtra: 800 },
  {
    path: "/trip/new",
    out: "new-filled.png",
    waitExtra: 800,
    fill: {
      name: "Escapade méditerranéenne",
      startCity: "Paris",
      startDate: "2026-07-10",
      endDate: "2026-07-22",
    },
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
    console.log(`-> ${url}  (${s.out})`);
    await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 });
    await page.waitForTimeout(s.waitExtra);
    // Force fonts ready
    await page.evaluate(() => document.fonts && document.fonts.ready);

    // Remplissage facultatif pour démontrer le preview live.
    if (s.fill) {
      await page.fill("#trip-name", s.fill.name);
      await page.fill("#trip-start-city", s.fill.startCity);
      await page.fill("#trip-start-date", s.fill.startDate);
      await page.fill("#trip-end-date", s.fill.endDate);
      // Blur le dernier champ pour fermer le picker date
      await page.locator("#trip-end-date").blur();
      await page.waitForTimeout(300);
    }

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
