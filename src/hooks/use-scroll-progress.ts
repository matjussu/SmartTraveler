"use client";

/**
 * useScrollProgress — retourne un float 0→1 selon `window.scrollY / threshold`.
 *
 * Usage typique : piloter une transition `transform: scale + translate` sur un
 * overlay splash, sans déclencher de reflow (lecture passive scrollY via rAF).
 *
 * - threshold default 320px ≈ "un peu de scroll" mais pas tout l'écran
 * - progress reste à 0 tant qu'on n'a pas scrollé, à 1 au-delà du threshold
 * - clean teardown : retire le listener au unmount
 */

import { useEffect, useState } from "react";

export function useScrollProgress(threshold: number = 320): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;

    const compute = () => {
      const y = typeof window !== "undefined" ? window.scrollY : 0;
      const next = Math.max(0, Math.min(1, y / threshold));
      setProgress(next);
      raf = 0;
    };

    const onScroll = () => {
      if (raf === 0) {
        raf = requestAnimationFrame(compute);
      }
    };

    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (raf !== 0) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [threshold]);

  return progress;
}
