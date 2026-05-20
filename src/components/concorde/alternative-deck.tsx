"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  formatCost,
  formatCo2,
  formatLongDuration,
  transportLabel,
} from "@/lib/format";
import type { Alternative, City } from "@/mocks/trips";

const TripMap = dynamic(() => import("./trip-map"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-night-soft">
      <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-frost-3">
        Initialisation carte…
      </span>
    </div>
  ),
});

type Props = {
  startCity: City;
  alternatives: Alternative[];
  defaultKind?: "cheapest" | "fastest" | "eco";
};

const DECKS: Array<{
  kind: "cheapest" | "fastest" | "eco";
  label: string;
  caption: string;
  accent: "ember" | "helios" | "lichen";
}> = [
  { kind: "cheapest", label: "Économique", caption: "Empreinte tarifaire minimale", accent: "ember" },
  { kind: "fastest", label: "Express", caption: "Temps trajet minimal", accent: "helios" },
  { kind: "eco", label: "Sobre", caption: "Empreinte carbone minimale", accent: "lichen" },
];

export function AlternativeDeck({
  startCity,
  alternatives,
  defaultKind = "cheapest",
}: Props) {
  const [active, setActive] = useState(defaultKind);
  const current = alternatives.find((a) => a.kind === active) ?? alternatives[0];
  const meta = DECKS.find((d) => d.kind === active) ?? DECKS[0];
  const accentText = textClass(meta.accent);
  const glowClass = glowClassFor(meta.accent);

  return (
    <div>
      {/* Deck switcher — pills with active glow */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        {DECKS.map((d) => {
          const isActive = d.kind === active;
          const alt = alternatives.find((a) => a.kind === d.kind);
          const t = textClass(d.accent);
          return (
            <button
              key={d.kind}
              type="button"
              onClick={() => setActive(d.kind)}
              aria-pressed={isActive}
              className={`group/deck relative rounded-2xl px-5 py-4 text-left transition-all duration-300 cursor-pointer ${
                isActive
                  ? `glass-strong ${glowClassFor(d.accent)}`
                  : "glass-soft hover:bg-white/[0.06] hover:-translate-y-0.5"
              }`}
            >
              {/* Glow blob */}
              {isActive && (
                <span
                  aria-hidden
                  className="absolute -top-4 right-4 h-12 w-12 rounded-full blur-2xl pointer-events-none"
                  style={{
                    background:
                      d.accent === "ember"
                        ? "oklch(0.72 0.17 30 / 0.45)"
                        : d.accent === "helios"
                        ? "oklch(0.78 0.16 60 / 0.45)"
                        : "oklch(0.76 0.14 155 / 0.45)",
                  }}
                />
              )}
              <div className="flex items-start justify-between mb-2">
                <span
                  className={`font-mono text-[10px] uppercase tracking-[0.2em] ${
                    isActive ? t : "text-frost-3"
                  }`}
                >
                  {d.caption}
                </span>
                <span
                  aria-hidden
                  className={`h-1.5 w-1.5 rounded-full ${
                    isActive ? dotClass(d.accent) : "bg-white/15"
                  }`}
                />
              </div>
              <div
                className={`text-[20px] font-semibold leading-none tracking-tight ${
                  isActive ? "text-frost" : "text-frost-2"
                }`}
              >
                {d.label}
              </div>
              {alt && (
                <div
                  className={`mt-3 font-mono text-[18px] font-semibold tabular-nums leading-none ${
                    isActive ? t : "text-frost-2"
                  }`}
                >
                  {d.kind === "eco"
                    ? formatCo2(alt.totalCo2Kg)
                    : d.kind === "fastest"
                    ? formatLongDuration(alt.totalDurationMinutes)
                    : formatCost(alt.totalCostEUR)}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Map + legs */}
      <div className="grid grid-cols-12 gap-5 mb-6">
        <div className="col-span-12 lg:col-span-7">
          <div className="rounded-2xl glass overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-frost-3">
                  Trajectoire
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-frost-2">
                  {current.legs.length} segments
                </span>
              </div>
              <span className={`inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] ${accentText}`}>
                <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${dotClass(meta.accent)}`} />
                {meta.label}
              </span>
            </div>
            <div className="h-[440px] p-2">
              <div className="h-full w-full rounded-xl overflow-hidden">
                <TripMap
                  startCity={startCity}
                  legs={current.legs}
                  accent={meta.accent}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Legs deck */}
        <div className="col-span-12 lg:col-span-5">
          <div className="rounded-2xl glass overflow-hidden h-full">
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-frost-3">
                Plan de vol
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-frost-2 tabular-nums">
                {current.legs.length} segments
              </span>
            </div>
            <ol className="divide-y divide-white/5">
              {current.legs.map((leg, idx) => (
                <li
                  key={`${leg.from.name}-${leg.to.name}-${idx}`}
                  className="px-5 py-4 hover:bg-white/[0.03] transition-colors group/leg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-frost-3 tabular-nums">
                      Segment {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={`inline-flex items-center h-5 px-2 rounded-full ring-1 font-mono text-[9px] uppercase tracking-[0.16em] ${chipClass(
                        leg.mode
                      )}`}
                    >
                      {transportLabel(leg.mode)}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-[16px] font-semibold text-frost tabular-nums">
                      {leg.from.name.slice(0, 3).toUpperCase()}
                    </span>
                    <span aria-hidden className="text-frost-3">
                      ✈
                    </span>
                    <span className="font-mono text-[16px] font-semibold text-frost tabular-nums">
                      {leg.to.name.slice(0, 3).toUpperCase()}
                    </span>
                    <span className="text-[12px] text-frost-3 ml-2">
                      {leg.from.name} → {leg.to.name}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-3 font-mono text-[11px] tabular-nums">
                    <Metric label="durée" value={formatLongDuration(leg.durationMinutes)} />
                    <Metric label="coût" value={formatCost(leg.costEUR)} />
                    <Metric label="CO₂" value={formatCo2(leg.co2Kg)} />
                  </div>
                  {leg.carrier && (
                    <div className="mt-2 font-mono text-[9px] uppercase tracking-[0.18em] text-frost-3">
                      opéré par {leg.carrier}
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* Totals — big readout glass */}
      <div className={`rounded-2xl glass-strong overflow-hidden ${glowClass}`}>
        <div className="flex items-center justify-between px-6 pt-4 pb-3">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-frost-3">
              Récapitulatif · {meta.caption.toLowerCase()}
            </span>
            <h3 className={`text-[22px] font-semibold tracking-tight mt-1 ${accentText}`}>
              {current.label}
            </h3>
          </div>
          <div className="text-right">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-frost-3">
              code lecture
            </div>
            <div className="font-mono text-[14px] font-semibold text-frost mt-1 tabular-nums">
              ST · {meta.kind.slice(0, 3).toUpperCase()}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 divide-x divide-white/5 border-t border-white/5">
          <BigTotal
            label="Coût total"
            value={formatCost(current.totalCostEUR)}
            accent={meta.accent === "ember" ? "ember" : null}
          />
          <BigTotal
            label="Durée"
            value={formatLongDuration(current.totalDurationMinutes)}
            accent={meta.accent === "helios" ? "helios" : null}
          />
          <BigTotal
            label="Empreinte"
            value={formatCo2(current.totalCo2Kg)}
            accent={meta.accent === "lichen" ? "lichen" : null}
          />
        </div>
      </div>
    </div>
  );
}

function textClass(a: "ember" | "helios" | "lichen") {
  return a === "ember"
    ? "text-ember"
    : a === "helios"
    ? "text-helios"
    : "text-lichen";
}
function glowClassFor(a: "ember" | "helios" | "lichen") {
  return a === "ember"
    ? "glow-ember"
    : a === "helios"
    ? "glow-helios"
    : "glow-lichen";
}
function dotClass(a: "ember" | "helios" | "lichen") {
  return a === "ember"
    ? "bg-ember shadow-[0_0_8px_2px_oklch(0.72_0.17_30_/_0.65)]"
    : a === "helios"
    ? "bg-helios shadow-[0_0_8px_2px_oklch(0.78_0.16_60_/_0.65)]"
    : "bg-lichen shadow-[0_0_8px_2px_oklch(0.76_0.14_155_/_0.65)]";
}
function chipClass(mode: "plane" | "train" | "bus" | "car") {
  if (mode === "train") return "ring-lichen/40 bg-lichen-soft/30 text-lichen";
  if (mode === "bus") return "ring-helios/40 bg-helios-soft/30 text-helios";
  if (mode === "plane") return "ring-aurora/40 bg-aurora-soft/30 text-aurora";
  return "ring-frost-3/30 bg-white/5 text-frost-2";
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-frost-3 mb-1">
        {label}
      </div>
      <div className="font-mono text-[12px] text-frost tabular-nums">{value}</div>
    </div>
  );
}

function BigTotal({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: "ember" | "helios" | "lichen" | null;
}) {
  const cls =
    accent === "ember"
      ? "text-ember"
      : accent === "helios"
      ? "text-helios"
      : accent === "lichen"
      ? "text-lichen"
      : "text-frost";
  return (
    <div className="px-6 py-5">
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-frost-3 mb-2">
        {label}
      </div>
      <div className={`font-mono text-[32px] font-semibold leading-none tabular-nums ${cls}`}>
        {value}
      </div>
    </div>
  );
}
