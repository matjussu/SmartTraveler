"use client";

/**
 * SharedView — vue lecture seule d'un voyage partagé via /shared/[token].
 *
 * Clone allégé de ResultView : on garde le switcher 3 alternatives (state local,
 * aucune écriture dans le store Zustand — vérifié), la carte, les segments,
 * le récap colorisé. On retire :
 *  - les CTA d'action (Réserver / Partager / Exporter / Comparer / Modifier)
 *  - le breadcrumb "Vos itinéraires" (le visiteur shared n'a pas de contexte app)
 *
 * On ajoute :
 *  - card cream "Composer le vôtre" en bas (acquisition douce, pas d'agression)
 *  - footer mention "Partagé depuis SmartTraveler · {trip.id}" + watermark fixed
 */

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { Trip, AlternativeKind } from "@/mocks/trips";
import {
  formatCost,
  formatLongDuration,
  formatDateLong,
  formatCo2,
  transportLabel,
  tripDurationDays,
} from "@/lib/format";

const TripMap = dynamic(
  () => import("@/components/voyage/trip-map").then((m) => m.TripMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[360px] items-center justify-center rounded-[18px] border border-line bg-[var(--surface)] text-[12px] text-ink-mute">
        Préparation de la carte…
      </div>
    ),
  }
);

type AltMeta = {
  label: string;
  baseline: string;
  accent: string;
  accentSoft: string;
  accentInk: string;
};

const ALT_META: Record<AlternativeKind, AltMeta> = {
  cheapest: {
    label: "Le plus économique",
    baseline: "Pour voyager léger sans alléger son envie.",
    accent: "oklch(0.62 0.155 38)",
    accentSoft: "oklch(0.93 0.045 50)",
    accentInk: "oklch(0.42 0.13 35)",
  },
  fastest: {
    label: "Le plus rapide",
    baseline: "Pour gagner une journée sur place.",
    accent: "oklch(0.55 0.115 235)",
    accentSoft: "oklch(0.94 0.025 230)",
    accentInk: "oklch(0.38 0.11 240)",
  },
  eco: {
    label: "Empreinte carbone réduite",
    baseline: "Pour que le voyage commence en gare.",
    accent: "oklch(0.55 0.078 145)",
    accentSoft: "oklch(0.93 0.025 140)",
    accentInk: "oklch(0.38 0.07 150)",
  },
};

function StatusLabel(status: Trip["status"]): string {
  switch (status) {
    case "draft":
      return "Brouillon";
    case "computed":
      return "Calculé";
    case "saved":
      return "Sauvegardé";
    case "shared":
      return "Partagé";
  }
}

export function SharedView({ trip }: { trip: Trip }) {
  const [activeKind, setActiveKind] = useState<AlternativeKind>("cheapest");
  const active = useMemo(
    () =>
      trip.alternatives.find((a) => a.kind === activeKind) ??
      trip.alternatives[0],
    [trip, activeKind]
  );
  const activeMeta = ALT_META[active.kind];

  const days = tripDurationDays(trip.startDate, trip.endDate);

  const sequenceCities = [
    trip.startCity,
    ...active.orderedDestinationIds
      .map((did) => trip.destinations.find((x) => x.id === did)?.city)
      .filter(Boolean),
  ];

  return (
    <main data-route="voyage-dark" className="mx-auto w-full max-w-6xl px-8 pb-24 pt-12">
      {/* Hero du voyage — pas de breadcrumb, juste mini-label "partagé" */}
      <section className="mb-10">
        <div className="grid grid-cols-12 items-end gap-6">
          <div className="col-span-12 md:col-span-8">
            <div className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-ink-mute">
              <span
                className="inline-block h-1 w-6"
                style={{ background: activeMeta.accent }}
                aria-hidden
              />
              <span>{StatusLabel(trip.status)}</span>
              <span aria-hidden>·</span>
              <span>{days} jours</span>
              <span aria-hidden>·</span>
              <span>
                {trip.destinations.length} destination
                {trip.destinations.length > 1 ? "s" : ""}
              </span>
            </div>
            <h1
              className="text-[clamp(40px,5.5vw,64px)] leading-[0.98] tracking-[-0.012em] text-ink"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {trip.name}
              <span
                style={{ fontStyle: "italic", color: activeMeta.accentInk }}
              >
                .
              </span>
            </h1>
            <p className="mt-4 max-w-xl text-[15px] leading-[1.55] text-ink-soft">
              Du {formatDateLong(trip.startDate)} au {formatDateLong(trip.endDate)},
              au départ de {trip.startCity.name}. Trois lectures du même voyage,
              partagées telles que composées.
            </p>
          </div>
          <div className="col-span-12 md:col-span-4 md:text-right">
            <div className="text-[10px] uppercase tracking-[0.14em] text-ink-mute">
              Lecture en cours
            </div>
            <div
              className="mt-1 text-[20px] tracking-tight text-ink"
              style={{
                fontFamily: "var(--font-display)",
                fontStyle: "italic",
              }}
            >
              {activeMeta.label}
            </div>
            <p className="mt-1 text-[12.5px] text-ink-mute">
              {activeMeta.baseline}
            </p>
          </div>
        </div>
      </section>

      {/* Switcher des 3 alternatives */}
      <section className="mb-7" aria-label="Choisir une alternative">
        <div className="mb-3 text-[10px] uppercase tracking-[0.14em] text-ink-mute">
          Trois façons d&apos;arriver là-bas
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {trip.alternatives.map((alt) => {
            const meta = ALT_META[alt.kind];
            const isActive = alt.kind === activeKind;
            return (
              <button
                key={alt.id}
                type="button"
                onClick={() => setActiveKind(alt.kind)}
                aria-pressed={isActive}
                className="group relative rounded-[16px] border bg-surface px-5 py-4 text-left transition-all duration-200 ease-out hover:-translate-y-0.5 active:scale-[0.99]"
                style={{
                  borderColor: isActive ? meta.accent : "var(--line)",
                  boxShadow: isActive
                    ? `0 8px 22px -14px ${meta.accent}`
                    : "0 1px 0 0 oklch(0.99 0.005 80)",
                  background: isActive ? meta.accentSoft : "var(--surface)",
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ background: meta.accent }}
                      aria-hidden
                    />
                    <span
                      className="text-[14px] tracking-tight"
                      style={{
                        fontFamily: "var(--font-display)",
                        fontStyle: "italic",
                        color: isActive ? meta.accentInk : "var(--ink)",
                      }}
                    >
                      {meta.label}
                    </span>
                  </div>
                  {isActive && (
                    <span
                      className="text-[10px] uppercase tracking-[0.12em]"
                      style={{ color: meta.accentInk }}
                    >
                      sélectionné
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-baseline justify-between gap-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.12em] text-ink-mute">
                      À partir de
                    </div>
                    <div
                      className="mt-0.5 text-[22px] tracking-tight tabular-nums"
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontWeight: 500,
                        color: isActive ? meta.accentInk : "var(--ink)",
                      }}
                    >
                      {formatCost(alt.totalCostEUR)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-[0.12em] text-ink-mute">
                      Durée
                    </div>
                    <div
                      className="mt-0.5 text-[14px] tabular-nums text-ink-soft"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {formatLongDuration(alt.totalDurationMinutes)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-[0.12em] text-ink-mute">
                      CO₂
                    </div>
                    <div
                      className="mt-0.5 text-[14px] tabular-nums text-ink-soft"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {formatCo2(alt.totalCo2Kg)}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Carte + étapes */}
      <section className="mb-10 grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-7">
          <div className="h-[460px]">
            <TripMap trip={trip} activeAlternative={active} />
          </div>
          <p className="mt-2.5 text-[11.5px] text-ink-mute">
            Carte de fond © OpenStreetMap / CARTO. Itinéraire tracé selon{" "}
            <span style={{ color: activeMeta.accentInk }}>
              {activeMeta.label.toLowerCase()}
            </span>
            .
          </p>
        </div>

        <aside className="col-span-12 lg:col-span-5">
          <div className="rounded-[18px] border border-line bg-surface p-6">
            <div className="text-[10px] uppercase tracking-[0.14em] text-ink-mute">
              Étapes du voyage
            </div>
            <h2
              className="mt-1 text-[22px] tracking-tight text-ink"
              style={{ fontFamily: "var(--font-display)" }}
            >
              De {trip.startCity.name} à {trip.startCity.name},
              <br />
              <span style={{ fontStyle: "italic" }}>en passant par</span>
            </h2>

            <ol className="mt-5 space-y-4">
              {sequenceCities.map((city, idx) => {
                if (!city) return null;
                const dest = trip.destinations.find(
                  (d) => d.city.name === city.name
                );
                const isStart = idx === 0;
                return (
                  <li
                    key={`${city.name}-${idx}`}
                    className="flex items-start gap-3"
                  >
                    <div
                      className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px]"
                      style={{
                        background: isStart
                          ? activeMeta.accentInk
                          : activeMeta.accentSoft,
                        color: isStart
                          ? activeMeta.accentSoft
                          : activeMeta.accentInk,
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {idx + 1}
                    </div>
                    <div className="min-w-0 flex-1 pb-1">
                      <div
                        className="text-[17px] leading-tight text-ink"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {city.name}
                        {isStart && (
                          <span
                            className="ml-2 text-[11px] uppercase tracking-[0.12em] text-ink-mute"
                            style={{ fontFamily: "var(--font-sans)" }}
                          >
                            départ &amp; retour
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 text-[12.5px] text-ink-mute">
                        {city.country}
                        {dest && (
                          <>
                            <span aria-hidden> · </span>
                            <span>
                              {dest.nights} nuit{dest.nights > 1 ? "s" : ""}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </aside>
      </section>

      {/* Détail des segments */}
      <section className="mb-10">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-ink-mute">
              Détail des segments
            </div>
            <h2
              className="mt-1 text-[24px] tracking-tight text-ink"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Chaque étape, expliquée
            </h2>
          </div>
          <span className="text-[11px] uppercase tracking-[0.12em] text-ink-mute">
            {active.legs.length} segments
          </span>
        </div>

        <div className="overflow-hidden rounded-[18px] border border-line bg-surface">
          <ul className="divide-y divide-line">
            {active.legs.map((leg, idx) => (
              <li
                key={`${leg.from.name}-${leg.to.name}-${idx}`}
                className="grid grid-cols-12 items-center gap-3 px-5 py-4"
              >
                <div className="col-span-12 flex items-center gap-3 md:col-span-4">
                  <span
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px]"
                    style={{
                      background: activeMeta.accentSoft,
                      color: activeMeta.accentInk,
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <div
                      className="text-[15px] leading-tight text-ink"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {leg.from.name}
                      <span className="mx-2 text-ink-mute" aria-hidden>
                        →
                      </span>
                      {leg.to.name}
                    </div>
                    <div className="mt-0.5 text-[12px] text-ink-mute">
                      {transportLabel(leg.mode)}
                      {leg.carrier && (
                        <>
                          <span aria-hidden> · </span>
                          <span>{leg.carrier}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="col-span-4 md:col-span-3">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-ink-mute">
                    Durée
                  </div>
                  <div
                    className="mt-0.5 text-[14px] tabular-nums text-ink"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {formatLongDuration(leg.durationMinutes)}
                  </div>
                </div>
                <div className="col-span-4 md:col-span-3">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-ink-mute">
                    Prix
                  </div>
                  <div
                    className="mt-0.5 text-[14px] tabular-nums text-ink"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {formatCost(leg.costEUR)}
                  </div>
                </div>
                <div className="col-span-4 text-right md:col-span-2">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-ink-mute">
                    CO₂
                  </div>
                  <div
                    className="mt-0.5 text-[14px] tabular-nums"
                    style={{
                      fontFamily: "var(--font-mono)",
                      color:
                        leg.mode === "train"
                          ? "oklch(0.38 0.07 150)"
                          : "var(--ink-soft)",
                    }}
                  >
                    {formatCo2(leg.co2Kg)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Récapitulatif colorisé — identique au pilote, sans la barre de CTA */}
      <section className="mb-12">
        <div
          className="grid grid-cols-12 items-center gap-6 rounded-[24px] border px-8 py-8"
          style={{
            background: activeMeta.accentSoft,
            borderColor: activeMeta.accent,
          }}
        >
          <div className="col-span-12 md:col-span-7">
            <div
              className="text-[11px] uppercase tracking-[0.14em]"
              style={{ color: activeMeta.accentInk }}
            >
              Récapitulatif
            </div>
            <h2
              className="mt-2 text-[30px] leading-[1.08] tracking-tight"
              style={{
                fontFamily: "var(--font-display)",
                color: activeMeta.accentInk,
              }}
            >
              {trip.name} —{" "}
              <span style={{ fontStyle: "italic" }}>
                {activeMeta.label.toLowerCase()}
              </span>
            </h2>
            <p className="mt-3 max-w-md text-[14px] text-ink-soft">
              {trip.destinations.length} étape
              {trip.destinations.length > 1 ? "s" : ""} entre{" "}
              {formatDateLong(trip.startDate)} et {formatDateLong(trip.endDate)},
              au départ de {trip.startCity.name}.
            </p>
          </div>
          <div className="col-span-12 grid grid-cols-3 gap-4 md:col-span-5">
            <Stat
              label="Total"
              value={formatCost(active.totalCostEUR)}
              ink={activeMeta.accentInk}
            />
            <Stat
              label="Durée"
              value={formatLongDuration(active.totalDurationMinutes)}
              ink={activeMeta.accentInk}
            />
            <Stat
              label="CO₂"
              value={formatCo2(active.totalCo2Kg)}
              ink={activeMeta.accentInk}
            />
          </div>
        </div>
      </section>

      {/* Bloc acquisition douce — pas d'agression, juste une invitation */}
      <section className="mb-10">
        <div className="rounded-[24px] border border-line bg-[var(--surface)] px-8 py-10 text-center">
          <div className="text-[10px] uppercase tracking-[0.16em] text-ink-mute">
            Composez le vôtre
          </div>
          <h2
            className="mx-auto mt-3 max-w-2xl text-[30px] leading-[1.1] tracking-tight text-ink"
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
            }}
          >
            Vous aimeriez composer le vôtre&nbsp;?
          </h2>
          <p
            className="mx-auto mt-3 max-w-lg text-[15px] leading-[1.55] text-ink-soft"
            style={{ fontStyle: "italic" }}
          >
            SmartTraveler crée des itinéraires comme celui-ci, à partir de vos
            villes et vos contraintes.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/trip/new"
              className="inline-flex items-center gap-2 rounded-full bg-terracotta px-6 py-3 text-[13.5px] font-medium text-[oklch(0.99_0.005_80)] transition-transform duration-200 ease-out hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Composer mon voyage</span>
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="/"
              className="text-[13px] text-ink-mute underline-offset-4 transition-colors duration-150 hover:text-ink hover:underline"
            >
              ← Découvrir SmartTraveler
            </Link>
          </div>
        </div>
      </section>

      {/* Footer signature */}
      <footer className="mt-16 border-t border-line pt-6">
        <div className="flex flex-col items-start justify-between gap-2 text-[11px] text-ink-mute md:flex-row md:items-center">
          <div className="flex items-center gap-2">
            <span aria-hidden>·</span>
            <span
              style={{ fontFamily: "var(--font-mono)" }}
              className="tracking-tight"
            >
              Partagé depuis SmartTraveler · {trip.id}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-ink-mute underline-offset-4 transition-colors duration-150 hover:text-ink hover:underline"
              style={{ fontStyle: "italic" }}
            >
              Voyage composé sur SmartTraveler
            </Link>
            <span aria-hidden>·</span>
            <span>© 2026 — voyages composés avec soin.</span>
          </div>
        </div>
      </footer>

      {/* Watermark discret fixed bottom-right */}
      <div
        aria-hidden
        className="pointer-events-none fixed bottom-4 right-4 hidden select-none text-[11px] tracking-tight md:block"
        style={{
          fontFamily: "var(--font-display)",
          fontStyle: "italic",
          color: "var(--ink-mute)",
          opacity: 0.32,
        }}
      >
        SmartTraveler
      </div>
    </main>
  );
}

function Stat({
  label,
  value,
  ink,
}: {
  label: string;
  value: string;
  ink: string;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.12em] text-ink-mute">
        {label}
      </div>
      <div
        className="mt-1 text-[18px] tabular-nums"
        style={{
          fontFamily: "var(--font-mono)",
          fontWeight: 500,
          color: ink,
        }}
      >
        {value}
      </div>
    </div>
  );
}
