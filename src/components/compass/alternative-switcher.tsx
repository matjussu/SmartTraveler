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
    <div className="h-full w-full flex items-center justify-center bg-paper-soft">
      <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">
        Carte en chargement…
      </span>
    </div>
  ),
});

type Props = {
  startCity: City;
  alternatives: Alternative[];
  defaultKind?: "cheapest" | "fastest" | "eco";
};

const TABS: Array<{
  kind: "cheapest" | "fastest" | "eco";
  label: string;
  hint: string;
  accent: "copper" | "sage" | "amber";
}> = [
  { kind: "cheapest", label: "Économique", hint: "min. dépense", accent: "amber" },
  { kind: "fastest", label: "Rapide", hint: "min. durée", accent: "copper" },
  { kind: "eco", label: "Sobre", hint: "min. CO₂", accent: "sage" },
];

export function AlternativeSwitcher({
  startCity,
  alternatives,
  defaultKind = "cheapest",
}: Props) {
  const [active, setActive] = useState(defaultKind);
  const current = alternatives.find((a) => a.kind === active) ?? alternatives[0];
  const meta = TABS.find((t) => t.kind === active) ?? TABS[0];

  const accentClass =
    meta.accent === "sage"
      ? "text-sage"
      : meta.accent === "amber"
      ? "text-amber"
      : "text-copper";

  return (
    <div>
      {/* Switcher rail */}
      <div className="mb-7 grid grid-cols-1 md:grid-cols-3 gap-3">
        {TABS.map((t) => {
          const isActive = t.kind === active;
          const alt = alternatives.find((a) => a.kind === t.kind);
          const accentText = accentClassFor(t.accent);
          return (
            <button
              key={t.kind}
              type="button"
              onClick={() => setActive(t.kind)}
              className={`group/tab relative flex flex-col items-start text-left rounded-xl px-5 py-4 transition-all duration-300 cursor-pointer ${
                isActive
                  ? "bg-card ring-1 ring-ink/20 shadow-[var(--shadow-paper-lift)]"
                  : "bg-card/40 ring-1 ring-rule/60 hover:ring-ink/15 hover:bg-card hover:-translate-y-0.5"
              }`}
              aria-pressed={isActive}
            >
              {/* Active rail accent */}
              {isActive && (
                <span
                  aria-hidden
                  className={`absolute left-0 top-4 bottom-4 w-[2px] rounded-r-full ${
                    t.accent === "sage"
                      ? "bg-sage"
                      : t.accent === "amber"
                      ? "bg-amber"
                      : "bg-copper"
                  }`}
                />
              )}
              <div className="flex items-baseline justify-between w-full">
                <span
                  className={`font-mono text-[10px] uppercase tracking-[0.18em] ${
                    isActive ? accentText : "text-ink-soft"
                  }`}
                >
                  {t.hint}
                </span>
                <span
                  className={`inline-flex h-1.5 w-1.5 rounded-full transition-opacity duration-300 ${
                    isActive
                      ? t.accent === "sage"
                        ? "bg-sage"
                        : t.accent === "amber"
                        ? "bg-amber"
                        : "bg-copper"
                      : "bg-rule"
                  }`}
                  aria-hidden
                />
              </div>
              <span
                className={`font-display text-[22px] leading-none mt-2 ${
                  isActive ? "text-ink" : "text-ink/70"
                }`}
              >
                {t.label}
              </span>
              {alt && (
                <span
                  className={`font-mono text-[13px] text-tabular mt-2 ${
                    isActive ? accentText : "text-ink-soft"
                  }`}
                >
                  {t.kind === "eco"
                    ? formatCo2(alt.totalCo2Kg)
                    : t.kind === "fastest"
                    ? formatLongDuration(alt.totalDurationMinutes)
                    : formatCost(alt.totalCostEUR)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Map + legs side by side */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        {/* Map */}
        <div className="col-span-12 lg:col-span-7 relative">
          <div className="overflow-hidden rounded-xl ring-1 ring-rule/70 bg-paper-soft h-[460px]">
            <TripMap
              startCity={startCity}
              legs={current.legs}
              accent={meta.accent}
            />
          </div>
          <div className="mt-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
            <span>Tracé · {current.legs.length} segments</span>
            <span>
              Polyline pointillée · marqueurs sériels
            </span>
          </div>
        </div>

        {/* Legs list */}
        <div className="col-span-12 lg:col-span-5">
          <div className="rounded-xl bg-card ring-1 ring-rule/70 overflow-hidden">
            <div className="px-5 py-4 border-b border-rule/60 flex items-baseline justify-between">
              <h3 className="font-display text-[18px] font-medium text-ink leading-none">
                Segments
              </h3>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
                ordre {current.legs.length}/{current.legs.length}
              </span>
            </div>

            <ol className="divide-y divide-rule/60">
              {current.legs.map((leg, idx) => {
                const letter = String.fromCharCode(65 + idx);
                const nextLetter = String.fromCharCode(66 + idx);
                return (
                  <li
                    key={`${leg.from.name}-${leg.to.name}-${idx}`}
                    className="group/leg px-5 py-4 hover:bg-paper-soft/70 transition-colors"
                  >
                    <div className="flex items-baseline gap-3 mb-2">
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">
                        Étape {String(idx + 1).padStart(2, "0")}
                      </span>
                      <span className="flex-1 rule h-[1px]" aria-hidden />
                      <span
                        className={`font-mono text-[10px] uppercase tracking-[0.16em] ${accentClass}`}
                      >
                        {transportLabel(leg.mode)}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-display text-[19px] text-ink leading-tight">
                        {leg.from.name}
                      </span>
                      <span aria-hidden className="text-ink-soft text-[14px]">
                        →
                      </span>
                      <span className="font-display text-[19px] text-ink leading-tight">
                        {leg.to.name}
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-baseline gap-x-5 gap-y-1 flex-wrap font-mono text-[12px] text-ink-soft text-tabular">
                      <span>
                        <span className="text-ink-soft/80">durée</span>{" "}
                        <span className="text-ink">
                          {formatLongDuration(leg.durationMinutes)}
                        </span>
                      </span>
                      <span>
                        <span className="text-ink-soft/80">coût</span>{" "}
                        <span className="text-ink">{formatCost(leg.costEUR)}</span>
                      </span>
                      <span>
                        <span className="text-ink-soft/80">CO₂</span>{" "}
                        <span className="text-ink">{formatCo2(leg.co2Kg)}</span>
                      </span>
                      {leg.carrier && (
                        <span className="text-ink-soft italic">
                          {leg.carrier}
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>

      {/* Totals block */}
      <div className="rounded-xl bg-card ring-1 ring-ink/15 overflow-hidden">
        <div className="px-6 pt-5 pb-3 border-b border-rule/60 flex items-baseline justify-between">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">
              Total — {meta.label.toLowerCase()}
            </span>
            <h3
              className={`font-display text-[26px] leading-tight mt-0.5 ${accentClass}`}
            >
              {current.label}
            </h3>
          </div>
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
            {current.legs.length} segments · {current.legs.length} carriers
          </span>
        </div>
        <div className="grid grid-cols-3 divide-x divide-rule/60">
          <Total
            label="coût"
            value={formatCost(current.totalCostEUR)}
            accent={meta.accent === "amber"}
          />
          <Total
            label="durée"
            value={formatLongDuration(current.totalDurationMinutes)}
            accent={meta.accent === "copper"}
          />
          <Total
            label="empreinte"
            value={formatCo2(current.totalCo2Kg)}
            accent={meta.accent === "sage"}
          />
        </div>
      </div>
    </div>
  );
}

function accentClassFor(accent: "copper" | "sage" | "amber") {
  if (accent === "sage") return "text-sage";
  if (accent === "amber") return "text-amber";
  return "text-copper";
}

function Total({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="px-6 py-5">
      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft mb-1.5">
        {label}
      </div>
      <div
        className={`font-display text-[34px] leading-none text-tabular ${
          accent ? "text-copper" : "text-ink"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
