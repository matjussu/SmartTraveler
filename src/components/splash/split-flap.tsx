"use client";

/**
 * Split-Flap board React — port idiomatique Next 16 du mock Claude Design.
 *
 * Anatomy (cf split-flap.css en regard) :
 *   - <Flap target delay cycleCount runKey /> = un caractère mécanique
 *   - <SplitFlap text size runKey onComplete /> = la board complète
 *
 * Le `runKey` re-déclenche le séquençage L→R (utile pour rejouer l'animation
 * à chaque mount de SplashIntro — `key={Date.now()}` côté parent ou compteur).
 */

import { useEffect, useRef, useState, useId } from "react";
import "./split-flap.css";

const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const FLIP_MS = 230;
const HOLD_MS = 14;

type FlapProps = {
  target: string;
  delay: number;
  cycleCount: number;
  runKey: number;
  onLanded?: () => void;
};

function Flap({ target, delay, cycleCount, runKey, onLanded }: FlapProps) {
  const [current, setCurrent] = useState(" ");
  const [next, setNext] = useState(" ");
  const [flipping, setFlipping] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];

    // Espaces restent quiets — pas de churn random
    const sequence: string[] = [];
    if (target !== " ") {
      for (let i = 0; i < cycleCount; i++) {
        sequence.push(CHARSET[Math.floor(Math.random() * CHARSET.length)]);
      }
    }
    sequence.push(target);

    let i = 0;
    const flipOnce = () => {
      const upcoming = sequence[i];
      setNext(upcoming);
      // double rAF garantit que le back-face contient bien le nouveau glyph
      // AVANT que l'animation .flipping ne démarre
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setFlipping(true);
          const t = setTimeout(() => {
            setCurrent(upcoming);
            setFlipping(false);
            i += 1;
            if (i < sequence.length) {
              const t2 = setTimeout(flipOnce, HOLD_MS);
              timers.current.push(t2);
            } else if (onLanded) {
              onLanded();
            }
          }, FLIP_MS);
          timers.current.push(t);
        });
      });
    };

    const start = setTimeout(flipOnce, delay);
    timers.current.push(start);

    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [target, delay, cycleCount, runKey, onLanded]);

  return (
    <div className="split-flap-flap" aria-hidden="true">
      <div className="split-flap-half top">
        <span className="split-flap-glyph">{next}</span>
      </div>
      <div className="split-flap-half bottom">
        <span className="split-flap-glyph">{current}</span>
      </div>
      <div className={"split-flap-flipper" + (flipping ? " flipping" : "")}>
        <div className="split-flap-face front">
          <span className="split-flap-glyph">{current}</span>
        </div>
        <div className="split-flap-face back">
          <span className="split-flap-glyph">{next}</span>
        </div>
      </div>
    </div>
  );
}

export type SplitFlapSize = "xl" | "mini";

type SplitFlapProps = {
  text: string;
  size?: SplitFlapSize;
  runKey?: number;
  className?: string;
  /** Override du `--split-flap-w` (sinon dérivé du size). */
  flapWidth?: string;
  /**
   * Labels colonnes affichés au-dessus de chaque mot (réplique du mock Claude
   * Design). Doit avoir la même longueur que `text.split(" ")`. Exemple :
   * `["Flight Number", "Destination"]` pour "SMART TRAVELER".
   */
  columnLabels?: string[];
  onComplete?: () => void;
};

const SIZE_WIDTH: Record<SplitFlapSize, string> = {
  xl: "clamp(48px, 8vw, 100px)",
  mini: "clamp(22px, 3.2vw, 44px)",
};

export function SplitFlap({
  text,
  size = "xl",
  runKey = 0,
  className = "",
  flapWidth,
  columnLabels,
  onComplete,
}: SplitFlapProps) {
  const id = useId();
  const words = text.split(" ");

  // Compute starting offsets ahead (immutable) pour que le ripple L→R reste
  // continu cross-mots (le +1 par mot représente le visual word-gap).
  const wordStartIndices: number[] = words.reduce<number[]>((acc, word, idx) => {
    if (idx === 0) return [0];
    const prev = acc[idx - 1] + words[idx - 1].length + 1;
    acc.push(prev);
    return acc;
  }, []);

  const wordEls = words.map((word, wordIdx) => {
    const startIdx = wordStartIndices[wordIdx];
    const label = columnLabels?.[wordIdx];

    const flapsRow = (
      <div className="split-flap-word" key={`${id}-w-${wordIdx}`}>
        {[...word].map((ch, i) => {
          const isLast =
            wordIdx === words.length - 1 && i === word.length - 1;
          return (
            <Flap
              key={`${id}-${wordIdx}-${i}-${runKey}`}
              target={ch}
              delay={(startIdx + i) * 70}
              cycleCount={5 + ((startIdx + i) % 4)}
              runKey={runKey}
              onLanded={isLast ? onComplete : undefined}
            />
          );
        })}
      </div>
    );

    if (!label) return flapsRow;

    return (
      <div className="split-flap-column" key={`${id}-col-${wordIdx}`}>
        <div className="split-flap-label">{label}</div>
        {flapsRow}
      </div>
    );
  });

  const rootStyle = flapWidth
    ? { ["--split-flap-w" as string]: flapWidth }
    : { ["--split-flap-w" as string]: SIZE_WIDTH[size] };

  return (
    <div
      className={`split-flap-root ${className}`}
      style={rootStyle}
      role="img"
      aria-label={text}
    >
      {wordEls}
    </div>
  );
}
