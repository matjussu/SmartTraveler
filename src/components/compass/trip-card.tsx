import Link from "next/link";
import {
  formatCost,
  formatDateRange,
  formatLongDuration,
  statusLabel,
  tripDurationDays,
} from "@/lib/format";
import type { Trip } from "@/mocks/trips";

type Props = {
  trip: Trip;
  index: number;
};

export function TripCard({ trip, index }: Props) {
  const cheapest = trip.alternatives.reduce((a, b) =>
    a.totalCostEUR < b.totalCostEUR ? a : b
  );
  const stops = trip.destinations.map((d) => d.city.name).join(" · ");
  const days = tripDurationDays(trip.startDate, trip.endDate);
  const ordinal = String(index + 1).padStart(2, "0");

  return (
    <Link
      href={`/trip/${trip.id}/result`}
      className="group relative block rounded-xl bg-card ring-1 ring-rule/70 overflow-hidden transition-all duration-300 hover:ring-ink/30 hover:-translate-y-0.5 hover:shadow-[var(--shadow-paper-lift)]"
    >
      {/* Top rail : index + status */}
      <div className="flex items-baseline justify-between gap-4 px-6 pt-5 pb-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft">
          № {ordinal} · {statusLabel(trip.status)}
        </span>
        <span className="font-mono text-[11px] text-ink-soft">
          {formatDateRange(trip.startDate, trip.endDate)}
        </span>
      </div>

      {/* Title block */}
      <div className="px-6 pb-4">
        <h2 className="font-display text-[28px] leading-[1.1] font-medium text-ink tracking-tight">
          {trip.name}
        </h2>
        <p className="mt-1 text-[13px] text-ink-soft">
          Depuis{" "}
          <span className="font-medium text-ink">{trip.startCity.name}</span>
          {" — "}
          {stops}
        </p>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-3 border-t border-rule/60 divide-x divide-rule/60">
        <Stat label="à partir de" value={formatCost(cheapest.totalCostEUR)} accent />
        <Stat label="durée" value={`${days}j`} />
        <Stat
          label="legs"
          value={`${cheapest.legs.length}`}
          suffix="trajets"
        />
      </div>

      {/* CTA rail */}
      <div className="flex items-center justify-between px-6 py-3.5 bg-paper-soft/60 border-t border-rule/60">
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
          3 alternatives calculées
        </span>
        <span className="inline-flex items-center gap-1 text-[13px] font-medium text-ink group-hover:text-copper transition-colors">
          Voir l’itinéraire
          <span
            aria-hidden
            className="inline-block transition-transform duration-300 group-hover:translate-x-1"
          >
            →
          </span>
        </span>
      </div>
    </Link>
  );
}

function Stat({
  label,
  value,
  suffix,
  accent,
}: {
  label: string;
  value: string;
  suffix?: string;
  accent?: boolean;
}) {
  return (
    <div className="px-6 py-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
        {label}
      </div>
      <div className="mt-1.5 flex items-baseline gap-1.5">
        <span
          className={`font-display text-[22px] leading-none text-tabular ${
            accent ? "text-copper" : "text-ink"
          }`}
        >
          {value}
        </span>
        {suffix && (
          <span className="text-[11px] text-ink-soft">{suffix}</span>
        )}
      </div>
    </div>
  );
}
