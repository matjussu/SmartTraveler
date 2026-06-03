"use client";

import { useEffect, useRef } from "react";
import createGlobe from "cobe";

/**
 * Globe pointillé ambre — composant décoratif de la home noire (Phase 1 redesign).
 *
 * Rendu via `cobe` (~5KB WebGL) : sphère sombre + continents en dot-matrix ambre.
 * Choisi plutôt que three.js : géographie intégrée (aucun asset à charger),
 * couleurs entièrement pilotables → match matte black + amber du split-flap.
 *
 * - Rotation auto douce (incrément `phi` poussé via globe.update() en boucle rAF).
 * - Drag pointeur pour faire tourner manuellement (delta clientX → phi).
 * - Respecte `prefers-reduced-motion` : stoppe l'auto-rotation (drag reste possible).
 * - SSR-unsafe (WebGL + window) → à importer via `dynamic(ssr:false)`.
 *
 * Palette ambre (tunable) : baseColor = ambre → l'océan rend en brun très sombre,
 * les points de terre (× mapBrightness) ressortent en ambre lumineux.
 */
export function DottedGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phiRef = useRef(0);
  const widthRef = useRef(0);
  // État du drag : null = pas d'interaction, sinon { startX, startPhi }.
  const dragRef = useRef<{ startX: number; startPhi: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const autoSpeed = reduceMotion ? 0 : 0.0032;

    const onResize = () => {
      widthRef.current = canvas.offsetWidth;
    };
    onResize();
    window.addEventListener("resize", onResize);

    const globe = createGlobe(canvas, {
      devicePixelRatio: dpr,
      width: widthRef.current * dpr,
      height: widthRef.current * dpr,
      phi: 0,
      theta: 0.22,
      dark: 1,
      diffuse: 1.1,
      mapSamples: 16000,
      mapBrightness: 6.5,
      // Ambre : océan = ambre fortement assombri (brun ~noir), terres = points ambre vifs.
      baseColor: [1, 0.55, 0.18],
      markerColor: [1, 0.62, 0.26],
      // Atmosphère chaude discrète (pas de halo blanc).
      glowColor: [0.28, 0.13, 0.04],
      markers: [],
    });

    // cobe v2 ne pilote pas la rotation lui-même : on pousse l'état à chaque frame
    // via globe.update() dans une boucle rAF (auto-rotation + résolution adaptative).
    let raf = 0;
    let firstFrame = true;
    const tick = () => {
      if (!dragRef.current) {
        phiRef.current += autoSpeed;
      }
      const size = widthRef.current * dpr;
      globe.update({ phi: phiRef.current, width: size, height: size });
      if (firstFrame) {
        // Fade-in une fois le premier frame rendu (évite le flash du canvas vide).
        firstFrame = false;
        canvas.style.opacity = "1";
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      globe.destroy();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    dragRef.current = { startX: e.clientX, startPhi: phiRef.current };
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.style.cursor = "grabbing";
  };

  const endDrag = (e: React.PointerEvent<HTMLCanvasElement>) => {
    dragRef.current = null;
    e.currentTarget.style.cursor = "grab";
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragRef.current) return;
    const delta = e.clientX - dragRef.current.startX;
    phiRef.current = dragRef.current.startPhi + delta * 0.01;
  };

  return (
    <div
      className="relative aspect-square w-full"
      style={{ width: "clamp(240px, 36vh, 440px)" }}
    >
      <canvas
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onPointerMove={onPointerMove}
        className="h-full w-full opacity-0 transition-opacity duration-700 ease-out"
        style={{ cursor: "grab", contain: "layout paint size" }}
      />
    </div>
  );
}
