import Link from "next/link";
import {
  formatCost,
  formatDateShort,
  formatLongDuration,
  formatCo2,
  statusLabel,
  tripDurationDays,
} from "@/lib/format";
import type { Trip } from "@/mocks/trips";

type Props = {
  trip: Trip;
  index: number;
};

export function TripRow({ trip, index }: Props) {
  const cheapest = trip.alternatives.find((a) => a.kind === "cheapest")!;
  const fastest = trip.alternatives.find((a) => a.kind === "fastest")!;
  const eco = trip.alternatives.find((a) => a.kind === "eco")!;
  const days = tripDurationDays(trip.startDate, trip.endDate);
  const id = String(index + 1).padStart(3, "0");

  const statusDotColor =
    trip.status === "computed"
      ? "bg-lime shadow-[0_0_6px_1px_oklch(0.85_0.16_130_/_0.7)]"
      : trip.status === "draft"
      ? "bg-amber shadow-[0_0_6px_1px_oklch(0.85_0.13_80_/_0.6)]"
      : "bg-ice";

  return (
    <Link
      href={`/trip/${trip.id}/result`}
      className="group block relative rounded-lg bg-bg-elev1 ring-1 ring-stroke-soft hover:ring-stroke transition-all duration-200 hover:bg-bg-elev2 hover:-translate-y-px"
    >
      {/* Header row */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-stroke-soft">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-3 tabular-nums">
            TR-{id}
          </span>
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-text-2">
            <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${statusDotColor}`} />
            {statusLabel(trip.status)}
          </span>
        </div>
        <span className="font-mono text-[11px] text-text-3 tabular-nums">
          {formatDateShort(trip.startDate)} → {formatDateShort(trip.endDate)}
        </span>
      </div>

      {/* Title block */}
      <div className="px-5 pt-4 pb-4">
        <h2 className="text-[20px] font-semibold tracking-tight text-text-1 leading-tight">
          {trip.name}
        </h2>
        <p className="mt-1.5 text-[12px] text-text-3">
          <span className="font-mono text-text-2">{trip.startCity.name}</span>
          <span aria-hidden className="mx-1.5 text-text-3">→</span>
          {trip.destinations.map((d, i) => (
            <span key={d.id}>
              <span className="font-mono text-text-2">{d.city.name}</span>
              {i < trip.destinations.length - 1 && (
                <span aria-hidden className="mx-1.5 text-text-3">→</span>
              )}
            </span>
          ))}
          <span aria-hidden className="mx-1.5 text-text-3">→</span>
          <span className="font-mono text-text-2">{trip.startCity.name}</span>
        </p>
      </div>

      {/* KPI grid 3 cols */}
      <div className="grid grid-cols-3 border-t border-stroke-soft">
        <KPI
          label="cheapest"
          value={formatCost(cheapest.totalCostEUR)}
          accent="amber"
          rank={cheapest.totalCostEUR === Math.min(cheapest.totalCostEUR, fastest.totalCostEUR, eco.totalCostEUR) ? "min" : undefined}
        />
        <KPI
          label="fastest"
          value={formatLongDuration(fastest.totalDurationMinutes)}
          accent="coral"
          rank={fastest.totalDurationMinutes === Math.min(cheapest.totalDurationMinutes, fastest.totalDurationMinutes, eco.totalDurationMinutes) ? "min" : undefined}
        />
        <KPI
          label="eco"
          value={formatCo2(eco.totalCo2Kg)}
          accent="lime"
          rank={eco.totalCo2Kg === Math.min(cheapest.totalCo2Kg, fastest.totalCo2Kg, eco.totalCo2Kg) ? "min" : undefined}
        />
      </div>

      {/* Footer rail */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-stroke-soft bg-bg-base/40">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-3">
          {days}j · {cheapest.legs.length} segments
        </span>
        <span className="inline-flex items-center gap-1 text-[12px] font-medium text-text-2 group-hover:text-ice transition-colors">
          Ouvrir
          <span
            aria-hidden
            className="inline-block transition-transform duration-200 group-hover:translate-x-1"
          >
            →
          </span>
        </span>
      </div>
    </Link>
  );
}

function KPI({
  label,
  value,
  accent,
  rank,
}: {
  label: string;
  value: string;
  accent: "amber" | "coral" | "lime" | "ice";
  rank?: "min" | "max";
}) {
  const text =
    accent === "amber"
      ? "text-amber"
      : accent === "coral"
      ? "text-coral"
      : accent === "lime"
      ? "text-lime"
      : "text-ice";

  return (
    <div className="px-5 py-3.5 border-r border-stroke-soft last:border-r-0">
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-3">
          {label}
        </span>
        {rank === "min" && (
          <span
            className={`font-mono text-[9px] uppercase tracking-[0.12em] ${text}`}
          >
            ★
          </span>
        )}
      </div>
      <div
        className={`mt-1.5 font-mono text-[18px] font-medium leading-none tabular-nums ${text}`}
      >
        {value}
      </div>
    </div>
  );
}
