"use client";

/**
 * SplashIntro — overlay fullscreen sur la home `/` qui shrink + fade au scroll.
 *
 * Phase 1 du grand redesign SmartTraveler : remplacer le hero éditorial cream
 * par une arrivée tableau Solari. Décisions :
 *
 *  - À CHAQUE arrivée sur `/`, le splash rejoue (pas de localStorage flag —
 *    c'est une démo, pas une persistance). Le mount du composant suffit pour
 *    que `<SplitFlap>` redémarre son séquençage L→R.
 *  - Pas de bouton "Skip", pas d'auto-transition après 2s : uniquement scroll
 *    driven. `useScrollProgress(320)` produit un float 0→1.
 *  - Transform-only (scale + translateY) pour éviter le reflow. L'overlay reste
 *    `position: fixed inset-0`, ce sont les transforms internes qui shrinkent.
 *  - À progress = 1, opacity passe à 0 + pointer-events none : l'overlay devient
 *    transparent pour révéler la home (qui contient déjà un `<SplitFlap mini>`
 *    rendu en arrière-plan dans le hero).
 *  - Accent point amber pulsing (réplique de la `.label` du mock Claude Design)
 *    placé en sub-caption "EMBARQUEMENT IMMÉDIAT".
 */

import { SplitFlap } from "./split-flap";
import { useScrollProgress } from "@/hooks/use-scroll-progress";
import "./splash-intro.css";

type Props = {
  /** Texte du Split-Flap splash. Default "SMART TRAVELER". */
  text?: string;
  /** Seuil de scroll en pixels où la transition se complète. */
  scrollThreshold?: number;
};

export function SplashIntro({
  text = "SMART TRAVELER",
  scrollThreshold = 320,
}: Props) {
  const progress = useScrollProgress(scrollThreshold);

  // Curve : scale 1 → 0.32, translateY 0 → -28vh, opacity 1 → 0 à partir de 0.85
  // (la home en dessous contient un Split-Flap mini "in place" qui prend le relais)
  const scale = 1 - progress * 0.68;
  const translateY = `${-28 * progress}vh`;
  const opacity = progress < 0.85 ? 1 : Math.max(0, 1 - (progress - 0.85) / 0.15);

  return (
    <div
      className="splash-intro"
      style={{
        opacity,
        pointerEvents: progress >= 0.999 ? "none" : "auto",
      }}
      aria-hidden={progress >= 0.85}
    >
      <div
        className="splash-intro-stage"
        style={{
          transform: `translate3d(0, ${translateY}, 0) scale(${scale})`,
        }}
      >
        <div className="splash-intro-caption">
          <span aria-hidden className="splash-intro-dot" />
          <span>Embarquement immédiat</span>
        </div>
        <SplitFlap text={text} size="xl" />
      </div>
    </div>
  );
}
