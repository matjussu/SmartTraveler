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
    <div className="h-full w-full flex items-center justify-center bg-bg-elev2">
      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-3">
        Loading tiles…
      </span>
    </div>
  ),
});

type Props = {
  startCity: City;
  alternatives: Alternative[];
  defaultKind?: "cheapest" | "fastest" | "eco";
};

const SCORERS: Array<{
  kind: "cheapest" | "fastest" | "eco";
  label: string;
  code: string;
  accent: "amber" | "coral" | "lime";
}> = [
  { kind: "cheapest", label: "Cheapest", code: "MIN.COST", accent: "amber" },
  { kind: "fastest", label: "Fastest", code: "MIN.TIME", accent: "coral" },
  { kind: "eco", label: "Eco", code: "MIN.CO₂", accent: "lime" },
];

export function AlternativeConsole({
  startCity,
  alternatives,
  defaultKind = "cheapest",
}: Props) {
  const [active, setActive] = useState(defaultKind);
  const current = alternatives.find((a) => a.kind === active) ?? alternatives[0];
  const meta = SCORERS.find((s) => s.kind === active) ?? SCORERS[0];

  const accentColor = colorClass(meta.accent);
  const glowClass =
    meta.accent === "lime"
      ? "glow-lime"
      : meta.accent === "coral"
      ? "glow-coral"
      : "glow-amber";

  return (
    <div>
      {/* Scorer tabs */}
      <div className="mb-6 flex items-stretch gap-2">
        {SCORERS.map((s) => {
          const isActive = s.kind === active;
          const alt = alternatives.find((a) => a.kind === s.kind);
          const accentCls = colorClass(s.accent);
          return (
            <button
              key={s.kind}
              type="button"
              onClick={() => setActive(s.kind)}
              aria-pressed={isActive}
              className={`group/scorer relative flex-1 rounded-lg px-4 py-3 text-left transition-all duration-200 cursor-pointer ${
                isActive
                  ? `bg-bg-elev2 ring-1 ${ringClass(s.accent)}`
                  : "bg-bg-elev1 ring-1 ring-stroke-soft hover:ring-stroke hover:bg-bg-elev2/60"
              }`}
            >
              <div className="flex items-baseline justify-between mb-1">
                <span
                  className={`font-mono text-[10px] uppercase tracking-[0.18em] ${
                    isActive ? accentCls : "text-text-3"
                  }`}
                >
                  {s.code}
                </span>
                <span
                  className={`h-1.5 w-1.5 rounded-full transition-colors ${
                    isActive
                      ? dotClass(s.accent)
                      : "bg-stroke"
                  }`}
                  aria-hidden
                />
              </div>
              <div
                className={`text-[16px] font-semibold leading-none tracking-tight ${
                  isActive ? "text-text-1" : "text-text-2"
                }`}
              >
                {s.label}
              </div>
              {alt && (
                <div
                  className={`mt-2 font-mono text-[15px] font-medium tabular-nums leading-none ${
                    isActive ? accentCls : "text-text-2"
                  }`}
                >
                  {s.kind === "eco"
                    ? formatCo2(alt.totalCo2Kg)
                    : s.kind === "fastest"
                    ? formatLongDuration(alt.totalDurationMinutes)
                    : formatCost(alt.totalCostEUR)}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Main viz : map + segments */}
      <div className="grid grid-cols-12 gap-4 mb-5">
        {/* Map panel */}
        <div className="col-span-12 lg:col-span-7">
          <div className="rounded-lg ring-1 ring-stroke-soft bg-bg-elev1 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-stroke-soft">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-3">
                  carte · trajectoire
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-2">
                  {current.legs.length} hops
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${dotClass(meta.accent)}`} aria-hidden />
                <span className={`font-mono text-[10px] uppercase tracking-[0.16em] ${accentColor}`}>
                  scorer.{meta.kind}
                </span>
              </div>
            </div>
            <div className="h-[440px]">
              <TripMap
                startCity={startCity}
                legs={current.legs}
                accent={meta.accent}
              />
            </div>
          </div>
        </div>

        {/* Segments panel */}
        <div className="col-span-12 lg:col-span-5">
          <div className="rounded-lg ring-1 ring-stroke-soft bg-bg-elev1 overflow-hidden h-full">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-stroke-soft">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-3">
                segments
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-2 tabular-nums">
                {current.legs.length} entrées
              </span>
            </div>
            <ol className="divide-y divide-stroke-soft">
              {current.legs.map((leg, idx) => (
                <li
                  key={`${leg.from.name}-${leg.to.name}-${idx}`}
                  className="px-4 py-3.5 hover:bg-bg-elev2/40 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-3">
                      hop.{String(idx + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 h-4 px-1.5 rounded font-mono text-[9px] uppercase tracking-[0.14em] ${chipClass(
                        leg.mode === "train"
                          ? "lime"
                          : leg.mode === "bus"
                          ? "amber"
                          : "coral"
                      )}`}
                    >
                      {transportLabel(leg.mode)}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-[13px] font-medium text-text-1 tabular-nums">
                      {leg.from.name}
                    </span>
                    <span aria-hidden className="text-text-3 font-mono text-[12px]">
                      →
                    </span>
                    <span className="font-mono text-[13px] font-medium text-text-1 tabular-nums">
                      {leg.to.name}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 font-mono text-[11px] tabular-nums">
                    <DataCell label="t" value={formatLongDuration(leg.durationMinutes)} />
                    <DataCell label="€" value={formatCost(leg.costEUR)} />
                    <DataCell label="co₂" value={formatCo2(leg.co2Kg)} />
                  </div>
                  {leg.carrier && (
                    <div className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-text-3">
                      via {leg.carrier}
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* Totals — big readout */}
      <div className={`rounded-lg bg-bg-elev1 ring-1 ${ringClass(meta.accent)} overflow-hidden ${glowClass}`}>
        <div className="flex items-center justify-between px-5 py-2.5 border-b border-stroke-soft">
          <div className="flex items-center gap-2.5">
            <span className={`h-1.5 w-1.5 rounded-full ${dotClass(meta.accent)}`} aria-hidden />
            <span className={`font-mono text-[10px] uppercase tracking-[0.18em] ${accentColor}`}>
              totals · {meta.code}
            </span>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-3">
            {current.legs.length} segments aggregated
          </span>
        </div>
        <div className="grid grid-cols-3 divide-x divide-stroke-soft">
          <BigKPI
            label="Cost"
            value={formatCost(current.totalCostEUR)}
            accent={meta.accent === "amber" ? "amber" : "text-1"}
          />
          <BigKPI
            label="Time"
            value={formatLongDuration(current.totalDurationMinutes)}
            accent={meta.accent === "coral" ? "coral" : "text-1"}
          />
          <BigKPI
            label="CO₂"
            value={formatCo2(current.totalCo2Kg)}
            accent={meta.accent === "lime" ? "lime" : "text-1"}
          />
        </div>
      </div>
    </div>
  );
}

function colorClass(a: "amber" | "coral" | "lime" | "ice") {
  return a === "amber"
    ? "text-amber"
    : a === "coral"
    ? "text-coral"
    : a === "lime"
    ? "text-lime"
    : "text-ice";
}
function ringClass(a: "amber" | "coral" | "lime" | "ice") {
  return a === "amber"
    ? "ring-amber/40"
    : a === "coral"
    ? "ring-coral/40"
    : a === "lime"
    ? "ring-lime/40"
    : "ring-ice/40";
}
function dotClass(a: "amber" | "coral" | "lime" | "ice") {
  return a === "amber"
    ? "bg-amber shadow-[0_0_8px_1px_oklch(0.85_0.13_80_/_0.7)]"
    : a === "coral"
    ? "bg-coral shadow-[0_0_8px_1px_oklch(0.74_0.16_25_/_0.7)]"
    : a === "lime"
    ? "bg-lime shadow-[0_0_8px_1px_oklch(0.85_0.16_130_/_0.7)]"
    : "bg-ice shadow-[0_0_8px_1px_oklch(0.85_0.105_215_/_0.7)]";
}
function chipClass(a: "amber" | "coral" | "lime" | "ice") {
  return a === "amber"
    ? "bg-amber-soft/40 text-amber border border-amber/30"
    : a === "coral"
    ? "bg-coral-soft/40 text-coral border border-coral/30"
    : a === "lime"
    ? "bg-lime-soft/40 text-lime border border-lime/30"
    : "bg-ice-soft/40 text-ice border border-ice/30";
}

function DataCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-text-3 mb-0.5">
        {label}
      </div>
      <div className="font-mono text-[11px] text-text-2 tabular-nums">{value}</div>
    </div>
  );
}

function BigKPI({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: "amber" | "coral" | "lime" | "ice" | "text-1";
}) {
  const cls =
    accent === "text-1"
      ? "text-text-1"
      : accent === "amber"
      ? "text-amber"
      : accent === "coral"
      ? "text-coral"
      : accent === "lime"
      ? "text-lime"
      : "text-ice";
  return (
    <div className="px-6 py-5">
      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-3 mb-2">
        {label}
      </div>
      <div className={`font-mono text-[30px] font-semibold leading-none tabular-nums ${cls}`}>
        {value}
      </div>
    </div>
  );
}
