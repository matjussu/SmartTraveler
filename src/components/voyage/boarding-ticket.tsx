import Link from "next/link";
import type { Trip, Alternative, AlternativeKind } from "@/mocks/trips";
import {
  formatCost,
  formatLongDuration,
  formatDateShort,
  formatCo2,
  tripDurationDays,
} from "@/lib/format";

type AltMeta = {
  label: string;
  short: string;
  dot: string;
  pill: string;
};

const ALT_META: Record<AlternativeKind, AltMeta> = {
  cheapest: {
    label: "Le plus économique",
    short: "À petit prix",
    dot: "bg-[oklch(0.62_0.155_38)]",
    pill: "bg-[oklch(0.93_0.045_50)] text-[oklch(0.42_0.13_35)] border-[oklch(0.85_0.07_45)]",
  },
  fastest: {
    label: "Le plus rapide",
    short: "Express",
    dot: "bg-[oklch(0.55_0.115_235)]",
    pill: "bg-[oklch(0.94_0.025_230)] text-[oklch(0.38_0.11_240)] border-[oklch(0.86_0.045_232)]",
  },
  eco: {
    label: "Empreinte carbone réduite",
    short: "Plus vert",
    dot: "bg-[oklch(0.55_0.078_145)]",
    pill: "bg-[oklch(0.93_0.025_140)] text-[oklch(0.38_0.07_150)] border-[oklch(0.85_0.04_145)]",
  },
};

function cityCode(name: string): string {
  // Codes 3 lettres approximatifs ville pour visuel "boarding pass"
  const map: Record<string, string> = {
    Paris: "PAR",
    Rome: "ROM",
    Barcelone: "BCN",
    Lyon: "LYS",
    Berlin: "BER",
    Prague: "PRG",
    Marseille: "MRS",
    Amsterdam: "AMS",
    Copenhague: "CPH",
  };
  return map[name] ?? name.slice(0, 3).toUpperCase();
}

export function BoardingTicket({ trip }: { trip: Trip }) {
  const cheapest = trip.alternatives.find((a) => a.kind === "cheapest")!;
  const fastest = trip.alternatives.find((a) => a.kind === "fastest")!;
  const eco = trip.alternatives.find((a) => a.kind === "eco")!;

  const lowestCost = Math.min(...trip.alternatives.map((a) => a.totalCostEUR));
  const lowestCo2 = Math.min(...trip.alternatives.map((a) => a.totalCo2Kg));

  const days = tripDurationDays(trip.startDate, trip.endDate);
  const stops = trip.destinations.length;

  // Construire la séquence de villes (départ → destinations → retour)
  const sequence = [
    trip.startCity.name,
    ...cheapest.orderedDestinationIds.map((did) => {
      const d = trip.destinations.find((x) => x.id === did);
      return d?.city.name ?? "";
    }),
    trip.startCity.name,
  ];

  return (
    <Link
      href={`/trip/${trip.id}/result`}
      aria-label={`Ouvrir le détail du voyage ${trip.name}`}
      className="group block boarding-ticket overflow-hidden"
    >
      {/* Bandeau supérieur : nom + dates */}
      <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-ink-mute">
            <span>{StatusLabel(trip.status)}</span>
            <span aria-hidden>·</span>
            <span>
              {formatDateShort(trip.startDate)} — {formatDateShort(trip.endDate)}
            </span>
            <span aria-hidden>·</span>
            <span>
              {days} jours · {stops} étape{stops > 1 ? "s" : ""}
            </span>
          </div>
          <h3
            className="mt-2 text-[28px] leading-[1.05] text-ink"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {trip.name}
          </h3>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-[10px] uppercase tracking-[0.12em] text-ink-mute">À partir de</div>
          <div
            className="mt-0.5 text-[22px] tracking-tight text-ink tabular-nums"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {formatCost(lowestCost)}
          </div>
        </div>
      </div>

      {/* Route villes — codes 3 lettres */}
      <div className="px-6 pb-4">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
          {sequence.map((city, idx) => (
            <span key={`${city}-${idx}`} className="flex items-baseline gap-3">
              <span
                className="text-[26px] tracking-[0.04em] text-ink"
                style={{ fontFamily: "var(--font-mono)", fontWeight: 500 }}
              >
                {cityCode(city)}
              </span>
              {idx < sequence.length - 1 && (
                <span
                  aria-hidden
                  className="inline-block h-[1px] w-8 text-ink-mute route-line"
                />
              )}
            </span>
          ))}
        </div>
        <div className="mt-1.5 text-[12px] text-ink-mute">
          {sequence.join(" → ")}
        </div>
      </div>

      {/* Perforation */}
      <div className="ticket-perforation mx-6" />

      {/* Bas : 3 lectures alt + métadonnées */}
      <div className="grid grid-cols-12 gap-4 px-6 py-5">
        <div className="col-span-12 md:col-span-7">
          <div className="text-[10px] uppercase tracking-[0.14em] text-ink-mute mb-3">
            Trois façons d'arriver là-bas
          </div>
          <ul className="space-y-2.5">
            <AltRow alt={cheapest} highlight={cheapest.totalCostEUR === lowestCost} />
            <AltRow alt={fastest} />
            <AltRow alt={eco} highlight={eco.totalCo2Kg === lowestCo2} />
          </ul>
        </div>
        <div className="col-span-12 md:col-span-5 flex flex-col items-end justify-between gap-3 md:border-l md:border-line md:pl-5">
          <div className="w-full text-right">
            <div className="text-[10px] uppercase tracking-[0.14em] text-ink-mute">
              Empreinte minimale
            </div>
            <div
              className="mt-0.5 text-[18px] tracking-tight text-[oklch(0.38_0.07_150)] tabular-nums"
              style={{ fontFamily: "var(--font-mono)", fontWeight: 500 }}
            >
              {formatCo2(lowestCo2)}
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[13px] text-ink-soft transition-transform duration-200 ease-out group-hover:translate-x-0.5">
            <span>Voir le détail</span>
            <span aria-hidden>→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

function AltRow({ alt, highlight = false }: { alt: Alternative; highlight?: boolean }) {
  const meta = ALT_META[alt.kind];
  return (
    <li className="flex items-center gap-3 text-[13px]">
      <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${meta.dot}`} aria-hidden />
      <span className="min-w-0 flex-1 text-ink-soft">
        {meta.label}
        {highlight && (
          <span
            className="ml-2 text-[10px] uppercase tracking-[0.1em] text-[oklch(0.62_0.13_75)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            choix du moment
          </span>
        )}
      </span>
      <span
        className="shrink-0 tabular-nums text-ink"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {formatCost(alt.totalCostEUR)}
      </span>
      <span className="shrink-0 text-ink-mute text-[12px] tabular-nums w-14 text-right">
        {formatLongDuration(alt.totalDurationMinutes)}
      </span>
    </li>
  );
}

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
