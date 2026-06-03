"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import type { Trip, Alternative, AlternativeKind } from "@/mocks/trips";
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
      <div className="flex h-full items-center justify-center rounded-[16px] border border-line bg-[oklch(0.95_0.012_80)] text-[11px] text-ink-mute">
        Préparation de la carte…
      </div>
    ),
  }
);

type AltMeta = {
  label: string;
  baseline: string;
  recommended: string;
  accent: string;
  accentSoft: string;
  accentInk: string;
};

const ALT_META: Record<AlternativeKind, AltMeta> = {
  cheapest: {
    label: "Le plus économique",
    baseline: "Pour voyager léger sans alléger son envie.",
    recommended: "Budget serré",
    accent: "oklch(0.62 0.155 38)",
    accentSoft: "oklch(0.93 0.045 50)",
    accentInk: "oklch(0.42 0.13 35)",
  },
  fastest: {
    label: "Le plus rapide",
    baseline: "Pour gagner une journée sur place.",
    recommended: "Peu de temps",
    accent: "oklch(0.55 0.115 235)",
    accentSoft: "oklch(0.94 0.025 230)",
    accentInk: "oklch(0.38 0.11 240)",
  },
  eco: {
    label: "Empreinte carbone réduite",
    baseline: "Pour que le voyage commence en gare.",
    recommended: "Conscience écologique",
    accent: "oklch(0.55 0.078 145)",
    accentSoft: "oklch(0.93 0.025 140)",
    accentInk: "oklch(0.38 0.07 150)",
  },
};

const KIND_ORDER: AlternativeKind[] = ["cheapest", "fastest", "eco"];

function transportGlyph(mode: Alternative["legs"][number]["mode"]): string {
  switch (mode) {
    case "plane":
      return "✈";
    case "train":
      return "▬";
    case "bus":
      return "▭";
    case "car":
      return "▣";
  }
}

function dominantModes(alt: Alternative): string {
  const counts = new Map<string, number>();
  for (const leg of alt.legs) {
    counts.set(leg.mode, (counts.get(leg.mode) ?? 0) + 1);
  }
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  return sorted
    .map(([mode]) => transportLabel(mode as Alternative["legs"][number]["mode"]) + "s")
    .join(" + ");
}

export function CompareView({ trip }: { trip: Trip }) {
  const days = tripDurationDays(trip.startDate, trip.endDate);

  // Tri stable des alternatives selon l'ordre canonique (cheapest, fastest, eco)
  const ordered = KIND_ORDER.map((k) =>
    trip.alternatives.find((a) => a.kind === k)
  ).filter((a): a is Alternative => Boolean(a));

  return (
    <main className="mx-auto w-full max-w-7xl px-6 pb-24 pt-10">
      {/* Breadcrumb */}
      <div className="mb-6 flex flex-wrap items-center gap-2 text-[12px] text-ink-mute">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 transition-colors hover:text-ink"
        >
          <span aria-hidden>←</span>
          <span>Vos itinéraires</span>
        </Link>
        <span aria-hidden>·</span>
        <Link
          href={`/trip/${trip.id}/result`}
          className="transition-colors hover:text-ink"
        >
          {trip.name}
        </Link>
        <span aria-hidden>·</span>
        <span className="text-ink">Comparer</span>
      </div>

      {/* Hero */}
      <section className="mb-10 grid grid-cols-12 gap-6 items-end">
        <div className="col-span-12 md:col-span-8">
          <div className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-ink-mute">
            <span className="inline-flex items-center gap-1.5">
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ background: "oklch(0.62 0.155 38)" }}
                aria-hidden
              />
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ background: "oklch(0.55 0.115 235)" }}
                aria-hidden
              />
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ background: "oklch(0.55 0.078 145)" }}
                aria-hidden
              />
            </span>
            <span>Comparatif des alternatives</span>
          </div>
          <h1
            className="text-[clamp(40px,5.5vw,64px)] leading-[0.98] tracking-[-0.012em] text-ink"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Trois façons d&apos;
            <span style={{ fontStyle: "italic" }}>arriver là-bas</span>.
          </h1>
          <p
            className="mt-4 max-w-xl text-[15px] leading-[1.55] text-ink-soft"
            style={{ fontStyle: "italic" }}
          >
            La même séquence de villes, trois philosophies de voyage. Choisissez
            celle qui vous ressemble.
          </p>
        </div>
        <div className="col-span-12 md:col-span-4 md:text-right">
          <dl className="space-y-2 text-[12.5px] text-ink-mute">
            <div className="md:justify-end flex items-baseline gap-2">
              <dt className="uppercase tracking-[0.12em] text-[10px]">Période</dt>
              <dd className="text-ink-soft">
                Du {formatDateLong(trip.startDate)} au{" "}
                {formatDateLong(trip.endDate)}
              </dd>
            </div>
            <div className="md:justify-end flex items-baseline gap-2">
              <dt className="uppercase tracking-[0.12em] text-[10px]">Étapes</dt>
              <dd className="text-ink-soft">
                {trip.destinations.length} ville
                {trip.destinations.length > 1 ? "s" : ""}
              </dd>
            </div>
            <div className="md:justify-end flex items-baseline gap-2">
              <dt className="uppercase tracking-[0.12em] text-[10px]">Durée</dt>
              <dd className="text-ink-soft">
                {days} jour{days > 1 ? "s" : ""}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Grid 3 cartes alternatives */}
      <section
        className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3"
        aria-label="Trois alternatives à comparer"
      >
        {ordered.map((alt) => (
          <AlternativeCard key={alt.id} trip={trip} alt={alt} />
        ))}
      </section>

      {/* Différences clés — tableau comparatif */}
      <section className="mt-16">
        <div className="mb-5">
          <div className="text-[10px] uppercase tracking-[0.14em] text-ink-mute">
            Lecture transversale
          </div>
          <h2
            className="mt-1 text-[28px] leading-[1.1] tracking-tight text-ink"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Différences <span style={{ fontStyle: "italic" }}>clés</span>
          </h2>
        </div>

        <div className="overflow-hidden rounded-[18px] border border-line bg-surface">
          <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
            {/* En-tête */}
            <div className="hidden md:block border-b border-line px-5 py-3 text-[10px] uppercase tracking-[0.14em] text-ink-mute">
              Critère
            </div>
            {ordered.map((alt) => {
              const meta = ALT_META[alt.kind];
              return (
                <div
                  key={`head-${alt.id}`}
                  className="hidden md:block border-b border-line px-5 py-3"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ background: meta.accent }}
                      aria-hidden
                    />
                    <span
                      className="text-[13px] tracking-tight"
                      style={{
                        fontFamily: "var(--font-display)",
                        fontStyle: "italic",
                        color: meta.accentInk,
                      }}
                    >
                      {meta.label}
                    </span>
                  </div>
                </div>
              );
            })}

            <ComparisonRow
              label="Coût total"
              values={ordered.map((a) => ({
                key: a.kind,
                text: formatCost(a.totalCostEUR),
                meta: ALT_META[a.kind],
              }))}
            />
            <ComparisonRow
              label="Durée totale"
              values={ordered.map((a) => ({
                key: a.kind,
                text: formatLongDuration(a.totalDurationMinutes),
                meta: ALT_META[a.kind],
              }))}
            />
            <ComparisonRow
              label="Empreinte carbone"
              values={ordered.map((a) => ({
                key: a.kind,
                text: formatCo2(a.totalCo2Kg),
                meta: ALT_META[a.kind],
              }))}
            />
            <ComparisonRow
              label="Modes de transport"
              values={ordered.map((a) => ({
                key: a.kind,
                text: dominantModes(a),
                meta: ALT_META[a.kind],
                mono: false,
              }))}
            />
            <ComparisonRow
              label="Recommandé pour"
              values={ordered.map((a) => ({
                key: a.kind,
                text: ALT_META[a.kind].recommended,
                meta: ALT_META[a.kind],
                mono: false,
                italic: true,
              }))}
              isLast
            />
          </div>
        </div>
      </section>

      {/* Footer tagline + CTAs */}
      <section className="mt-16">
        <p
          className="max-w-2xl text-[18px] leading-[1.4] text-ink-soft"
          style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
        >
          SmartTraveler optimise pour vous — vous, vous choisissez.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href={`/trip/${trip.id}/result`}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-5 py-3 text-[13.5px] text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
          >
            <span aria-hidden>←</span>
            <span>Retour à l&apos;itinéraire principal</span>
          </Link>
          <Link
            href={`/trip/${trip.id}/export`}
            className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-[13.5px] text-ink-mute transition-colors hover:text-ink-soft"
          >
            <span>Exporter le comparatif PDF</span>
            <span aria-hidden>↗</span>
          </Link>
        </div>
      </section>

      <footer className="mt-20 border-t border-line pt-6 text-[11.5px] text-ink-mute">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <span
            style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
            className="text-ink-soft"
          >
            SmartTraveler — voyages composés
          </span>
          <span>© {new Date().getFullYear()} — pensé pour les voyages qui ont du sens.</span>
        </div>
      </footer>
    </main>
  );
}

/* ---------------------------------------------------------------------- */
/* Card alternative — col-span-1, height-equal via flex                    */
/* ---------------------------------------------------------------------- */

function AlternativeCard({ trip, alt }: { trip: Trip; alt: Alternative }) {
  const meta = ALT_META[alt.kind];

  return (
    <article
      className="boarding-ticket flex flex-col overflow-hidden"
      style={{ borderColor: "var(--line)" }}
    >
      {/* Header card */}
      <header
        className="px-6 pt-6 pb-5"
        style={{ background: meta.accentSoft }}
      >
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ background: meta.accent }}
            aria-hidden
          />
          <span
            className="text-[10px] uppercase tracking-[0.14em]"
            style={{ color: meta.accentInk }}
          >
            {meta.recommended}
          </span>
        </div>
        <h2
          className="mt-2 text-[22px] leading-tight tracking-tight"
          style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            color: meta.accentInk,
          }}
        >
          {meta.label}
        </h2>
        <p
          className="mt-1.5 text-[13px] leading-[1.45] text-ink-soft"
          style={{ fontStyle: "italic" }}
        >
          {meta.baseline}
        </p>
      </header>

      <div className="ticket-perforation" aria-hidden />

      {/* Mini-carte — note : TripMap impose une min-height de 360px en interne
          (cf. trip-map.tsx). On aligne la zone hôte à 300px pour rester compact
          côté grille, et on accepte que la carte occupe sa min-height effective
          pour éviter un layout-shift visuel. */}
      <div
        className="relative border-b border-line"
        style={{ height: 300 }}
        aria-label={`Carte de l'itinéraire — ${meta.label.toLowerCase()}`}
      >
        <TripMap trip={trip} activeAlternative={alt} />
      </div>

      {/* Stats trio */}
      <div className="grid grid-cols-3 divide-x divide-line border-b border-line">
        <Metric
          label="À partir de"
          value={formatCost(alt.totalCostEUR)}
          ink={meta.accentInk}
          emphasized
        />
        <Metric
          label="Durée"
          value={formatLongDuration(alt.totalDurationMinutes)}
          ink="var(--ink)"
        />
        <Metric
          label="CO₂"
          value={formatCo2(alt.totalCo2Kg)}
          ink={alt.kind === "eco" ? meta.accentInk : "var(--ink-soft)"}
        />
      </div>

      {/* Liste segments — condensée */}
      <ul className="flex-1 divide-y divide-line">
        {alt.legs.map((leg, idx) => (
          <li
            key={`${alt.id}-leg-${idx}`}
            className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-5 py-3"
          >
            <span
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px]"
              style={{
                background: meta.accentSoft,
                color: meta.accentInk,
                fontFamily: "var(--font-mono)",
              }}
              aria-hidden
            >
              {transportGlyph(leg.mode)}
            </span>
            <div className="min-w-0">
              <div
                className="truncate text-[13.5px] leading-tight text-ink"
                style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
              >
                {leg.from.name}
                <span className="mx-1.5 text-ink-mute" aria-hidden>
                  →
                </span>
                {leg.to.name}
              </div>
              <div className="mt-0.5 truncate text-[11.5px] text-ink-mute">
                {leg.carrier ?? transportLabel(leg.mode)}
                <span aria-hidden> · </span>
                <span
                  className="tabular-nums"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {formatLongDuration(leg.durationMinutes)}
                </span>
              </div>
            </div>
            <div
              className="text-right text-[12.5px] tabular-nums text-ink-soft"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {formatCost(leg.costEUR)}
            </div>
          </li>
        ))}
      </ul>

      {/* Footer card — CTA */}
      <footer className="border-t border-line p-5">
        <Link
          href={`/trip/${trip.id}/result?alt=${alt.kind}`}
          aria-label={`Choisir la version ${meta.label.toLowerCase()} pour ${trip.name}`}
          className="group inline-flex w-full items-center justify-between gap-2 rounded-full px-5 py-3 text-[13.5px] font-medium transition-transform duration-200 ease-out hover:scale-[1.01] active:scale-[0.99] motion-reduce:transition-none motion-reduce:hover:scale-100"
          style={{
            background: meta.accent,
            color: "oklch(0.99 0.005 80)",
          }}
        >
          <span>Choisir cette version</span>
          <span aria-hidden className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0">
            →
          </span>
        </Link>
      </footer>
    </article>
  );
}

function Metric({
  label,
  value,
  ink,
  emphasized = false,
}: {
  label: string;
  value: string;
  ink: string;
  emphasized?: boolean;
}) {
  return (
    <div className="px-4 py-4">
      <div className="text-[9.5px] uppercase tracking-[0.14em] text-ink-mute">
        {label}
      </div>
      <div
        className="mt-1 tabular-nums tracking-tight"
        style={{
          fontFamily: "var(--font-mono)",
          fontWeight: emphasized ? 500 : 400,
          fontSize: emphasized ? "20px" : "15px",
          color: ink,
        }}
      >
        {value}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Ligne de comparaison transversale                                       */
/* ---------------------------------------------------------------------- */

type CmpValue = {
  key: AlternativeKind;
  text: string;
  meta: AltMeta;
  mono?: boolean;
  italic?: boolean;
};

function ComparisonRow({
  label,
  values,
  isLast = false,
}: {
  label: string;
  values: CmpValue[];
  isLast?: boolean;
}) {
  const borderClass = isLast ? "" : "border-b border-line";
  return (
    <>
      <div
        className={`flex items-center px-5 py-4 text-[12px] uppercase tracking-[0.12em] text-ink-mute ${borderClass} md:bg-[oklch(0.97_0.014_78)]`}
      >
        <span
          className="md:not-italic"
          style={{ fontFamily: "var(--font-display)", fontStyle: "italic", letterSpacing: "0" }}
        >
          {label}
        </span>
      </div>
      {values.map((v) => {
        const useMono = v.mono !== false;
        return (
          <div
            key={`${label}-${v.key}`}
            className={`flex items-center justify-between gap-2 px-5 py-4 ${borderClass}`}
          >
            <span className="md:hidden text-[10px] uppercase tracking-[0.12em] text-ink-mute">
              {v.meta.label}
            </span>
            <span
              className="text-[14px] text-ink"
              style={
                useMono
                  ? {
                      fontFamily: "var(--font-mono)",
                      fontVariantNumeric: "tabular-nums",
                      color: v.meta.accentInk,
                    }
                  : {
                      fontFamily: "var(--font-sans)",
                      fontStyle: v.italic ? "italic" : "normal",
                      color: "var(--ink-soft)",
                    }
              }
            >
              {v.text}
            </span>
          </div>
        );
      })}
    </>
  );
}
