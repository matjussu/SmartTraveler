"use client";

/**
 * SplashIntro — Split-Flap overlay qui shrinke au scroll et **reste visible** au final.
 *
 * Décision architecturale (vs précédente itération où l'overlay disparaissait à
 * progress=1 et un second SplitFlap "mini" prenait sa place dans le hero) :
 *
 *  - **1 seul SplitFlap** géré par l'overlay. Au scroll, le board shrinke
 *    (scale + translateY) vers une position fixed haut de viewport, mais
 *    **opacity reste 1** — le splash devient le "H1" final, pas un overlay
 *    qui disparaît. Ça évite le bug "subtitle + CTA invisibles" qu'on avait
 *    avec le hero centré qui finissait caché sous le top-nav.
 *  - La page `/` positionne ensuite le subtitle + CTA SOUS la position finale
 *    du splash (via `pt-[40vh]` sur la section hero), de sorte que ces éléments
 *    sont visibles dès que le splash a fini de shrinker.
 *  - Labels colonnes "Flight Number" / "Destination" (port direct du mock
 *    Claude Design) — visibles XL au mount ET mini après shrink (c'est le même
 *    DOM, la transform `scale` les réduit proportionnellement).
 *
 * À CHAQUE arrivée sur `/`, le splash rejoue (mount du composant suffit pour
 * que `<SplitFlap>` redémarre son séquençage L→R). Pas de localStorage flag.
 */

import { SplitFlap } from "./split-flap";
import { useScrollProgress } from "@/hooks/use-scroll-progress";
import "./splash-intro.css";

type Props = {
  /** Texte du Split-Flap splash. Default "SMART TRAVELER". */
  text?: string;
  /** Seuil de scroll en pixels où la transition se complète. */
  scrollThreshold?: number;
  /** Labels colonnes (un par mot). Default ["Flight Number", "Destination"]. */
  columnLabels?: string[];
};

export function SplashIntro({
  text = "SMART TRAVELER",
  scrollThreshold = 280,
  columnLabels = ["Flight Number", "Destination"],
}: Props) {
  const progress = useScrollProgress(scrollThreshold);

  // Curve transformation :
  //   scale: 1 → 0.34
  //   translateY: 0 → -32vh (remonte vers le haut du viewport)
  // Pas de fade-out — l'overlay reste opacity 1 et devient le "H1" final.
  const scale = 1 - progress * 0.66;
  const translateY = `${-32 * progress}vh`;

  return (
    <div
      className="splash-intro"
      style={{
        // pointer-events: none pour ne jamais bloquer les clicks sur subtitle/CTA
        // (le splash est purement décoratif une fois shrinké)
        pointerEvents: progress >= 0.5 ? "none" : "auto",
      }}
    >
      <div
        className="splash-intro-stage"
        style={{
          transform: `translate3d(0, ${translateY}, 0) scale(${scale})`,
        }}
      >
        <SplitFlap text={text} size="xl" columnLabels={columnLabels} />
      </div>
    </div>
  );
}
