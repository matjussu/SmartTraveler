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

export function BoardingCard({ trip, index }: Props) {
  const cheapest = trip.alternatives.reduce((a, b) =>
    a.totalCostEUR < b.totalCostEUR ? a : b
  );
  const fastest = trip.alternatives.reduce((a, b) =>
    a.totalDurationMinutes < b.totalDurationMinutes ? a : b
  );
  const eco = trip.alternatives.reduce((a, b) =>
    a.totalCo2Kg < b.totalCo2Kg ? a : b
  );
  const days = tripDurationDays(trip.startDate, trip.endDate);
  const id = String(index + 1).padStart(3, "0");

  // IATA-style codes from city names
  const startCode = trip.startCity.name.slice(0, 3).toUpperCase();
  const endCity = trip.destinations[trip.destinations.length - 1];
  const endCode = endCity.city.name.slice(0, 3).toUpperCase();

  const statusColor =
    trip.status === "computed"
      ? "text-lichen"
      : trip.status === "draft"
      ? "text-helios"
      : "text-aurora";

  return (
    <Link
      href={`/trip/${trip.id}/result`}
      className="group relative block rounded-2xl glass overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:scale-[1.005] hover:bg-white/[0.06]"
    >
      {/* Aurora gradient overlay on hover */}
      <span
        aria-hidden
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 80% 20%, oklch(0.74 0.12 235 / 0.18), transparent 60%)",
        }}
      />

      {/* Header — flight info row */}
      <div className="relative flex items-center justify-between px-5 pt-4 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-frost-3">
            ST · {id}
          </span>
          <span aria-hidden className="h-3 w-px bg-white/10" />
          <span
            className={`inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] ${statusColor}`}
          >
            <span
              aria-hidden
              className={`h-1.5 w-1.5 rounded-full ${
                trip.status === "computed"
                  ? "bg-lichen shadow-[0_0_8px_2px_oklch(0.76_0.14_155_/_0.7)]"
                  : "bg-helios shadow-[0_0_8px_2px_oklch(0.78_0.16_60_/_0.7)]"
              }`}
            />
            {statusLabel(trip.status)}
          </span>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-frost-3 tabular-nums">
          {formatDateShort(trip.startDate)} · {days}j
        </span>
      </div>

      {/* IATA codes — big */}
      <div className="relative flex items-center justify-between px-6 pt-2 pb-5">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-frost-3 mb-1">
            départ
          </div>
          <div className="font-mono text-[34px] font-semibold leading-none text-frost tabular-nums tracking-tight">
            {startCode}
          </div>
          <div className="text-[12px] text-frost-2 mt-1.5">
            {trip.startCity.name}
          </div>
        </div>

        {/* Trajectory ribbon */}
        <div className="flex-1 mx-6 relative flex items-center">
          <span
            aria-hidden
            className="absolute left-0 right-0 h-px"
            style={{
              background:
                "linear-gradient(to right, transparent, oklch(0.74 0.12 235 / 0.4), oklch(0.78 0.16 60 / 0.5), transparent)",
            }}
          />
          <span aria-hidden className="absolute left-0 h-1.5 w-1.5 rounded-full bg-aurora -translate-y-px shadow-[0_0_8px_2px_oklch(0.74_0.12_235_/_0.7)]" />
          <span aria-hidden className="absolute right-0 h-1.5 w-1.5 rounded-full bg-helios -translate-y-px shadow-[0_0_8px_2px_oklch(0.78_0.16_60_/_0.7)]" />
          {/* Stops markers */}
          {trip.destinations.slice(0, -1).map((d, i) => {
            const pct = ((i + 1) / trip.destinations.length) * 100;
            return (
              <span
                key={d.id}
                aria-hidden
                className="absolute h-1 w-1 rounded-full bg-frost-2 -translate-y-px"
                style={{ left: `${pct}%` }}
              />
            );
          })}
          <div className="absolute left-1/2 -translate-x-1/2 top-2.5 text-center">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-frost-3">
              {trip.destinations.length} escales
            </span>
          </div>
        </div>

        <div className="text-right">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-frost-3 mb-1">
            dernière étape
          </div>
          <div className="font-mono text-[34px] font-semibold leading-none text-frost tabular-nums tracking-tight">
            {endCode}
          </div>
          <div className="text-[12px] text-frost-2 mt-1.5">
            {endCity.city.name}
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="relative px-5 pb-3">
        <h2 className="text-[18px] font-semibold text-frost leading-tight tracking-tight">
          {trip.name}
        </h2>
      </div>

      {/* Alternatives chips */}
      <div className="relative grid grid-cols-3 gap-2 px-5 pb-5">
        <Chip
          label="Cheapest"
          value={formatCost(cheapest.totalCostEUR)}
          accent="ember"
        />
        <Chip
          label="Fastest"
          value={formatLongDuration(fastest.totalDurationMinutes)}
          accent="helios"
        />
        <Chip
          label="Eco"
          value={formatCo2(eco.totalCo2Kg)}
          accent="lichen"
        />
      </div>

      {/* Footer rail */}
      <div className="relative flex items-center justify-between px-5 py-3 border-t border-white/5 bg-white/[0.015]">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-frost-3">
          {cheapest.legs.length} segments · 3 alternatives
        </span>
        <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-frost-2 group-hover:text-aurora transition-colors">
          Embarquement
          <span
            aria-hidden
            className="inline-block transition-transform duration-300 group-hover:translate-x-1.5"
          >
            →
          </span>
        </span>
      </div>
    </Link>
  );
}

function Chip({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: "ember" | "helios" | "lichen";
}) {
  const text =
    accent === "ember"
      ? "text-ember"
      : accent === "helios"
      ? "text-helios"
      : "text-lichen";
  const ring =
    accent === "ember"
      ? "ring-ember/30"
      : accent === "helios"
      ? "ring-helios/30"
      : "ring-lichen/30";
  return (
    <div
      className={`rounded-xl bg-white/[0.03] ring-1 ${ring} px-3 py-2.5 transition-colors hover:bg-white/[0.06]`}
    >
      <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-frost-3 mb-1">
        {label}
      </div>
      <div className={`font-mono text-[14px] font-semibold tabular-nums leading-none ${text}`}>
        {value}
      </div>
    </div>
  );
}
