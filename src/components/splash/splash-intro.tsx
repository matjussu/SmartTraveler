"use client";

/**
 * SplashIntro — Split-Flap overlay qui shrinke au scroll et reste visible au final.
 *
 * Itération #1546 (fixes Matteo) :
 *  - **Background interpolé** : `#050505` opaque jusqu'à progress 0.6, fade-out
 *    linéaire vers transparent jusqu'à progress 1. Au mount, l'overlay masque
 *    COMPLÈTEMENT le main en dessous (subtitle + CTA invisibles). Quand user
 *    scroll au-delà de progress 0.6, le main commence à transparaître.
 *  - **Scale final 0.5** (au lieu de 0.34) : SplitFlap mini reste lisible.
 *  - **translateY final -26vh** (au lieu de -32vh) : cohérent avec scale plus grand,
 *    atterrit au-dessus du placeholder réservé dans le flow document de la home.
 *
 * Le placeholder in-page (page.tsx) réserve l'espace que le splash overlay occupe
 * visuellement au final state — sans ça, subtitle + CTA remontent et se superposent
 * avec la position finale du splash.
 *
 * À CHAQUE arrivée sur `/`, le splash rejoue (mount du composant suffit).
 */

import { SplitFlap } from "./split-flap";
import { useScrollProgress } from "@/hooks/use-scroll-progress";
import "./splash-intro.css";

type Props = {
  text?: string;
  scrollThreshold?: number;
  columnLabels?: string[];
  /** Largeur des flaps (transmis à SplitFlap). Plus petit = titre 1 ligne sur + d'écrans. */
  flapWidth?: string;
};

const FADE_START = 0.6;

export function SplashIntro({
  text = "SMART TRAVELER",
  scrollThreshold = 280,
  columnLabels = ["Flight Number", "Destination"],
  flapWidth,
}: Props) {
  const progress = useScrollProgress(scrollThreshold);

  // Transform curve : scale 1 → 0.5, translateY 0 → -26vh
  const scale = 1 - progress * 0.5;
  const translateY = `${-30 * progress}vh`;

  // Background interpolation : opaque jusqu'à FADE_START, puis fade-out linéaire
  const bgAlpha =
    progress < FADE_START
      ? 1
      : Math.max(0, 1 - (progress - FADE_START) / (1 - FADE_START));

  return (
    <div
      className="splash-intro"
      style={{
        backgroundColor: `rgba(5, 5, 6, ${bgAlpha})`,
      }}
    >
      <div
        className="splash-intro-stage"
        style={{
          transform: `translate3d(0, ${translateY}, 0) scale(${scale})`,
        }}
      >
        <SplitFlap text={text} size="xl" columnLabels={columnLabels} flapWidth={flapWidth} />
      </div>
    </div>
  );
}
