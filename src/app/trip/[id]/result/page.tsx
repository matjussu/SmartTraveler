import { notFound } from "next/navigation";
import Link from "next/link";
import { getTripById } from "@/mocks/trips";
import {
  formatCost,
  formatDateLong,
  statusLabel,
  tripDurationDays,
} from "@/lib/format";
import { AppShell } from "@/components/atlas/app-shell";
import { AlternativeConsole } from "@/components/atlas/alternative-console";

export default async function TripResultPage(
  props: PageProps<"/trip/[id]/result">
) {
  const { id } = await props.params;
  const trip = getTripById(id);
  if (!trip) notFound();

  const cheapest = trip.alternatives.reduce((a, b) =>
    a.totalCostEUR < b.totalCostEUR ? a : b
  );
  const days = tripDurationDays(trip.startDate, trip.endDate);

  return (
    <AppShell current="trips">
      <main className="px-8 pt-7 pb-16">
        {/* Breadcrumb console */}
        <nav className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-text-3 mb-6">
          <Link href="/" className="hover:text-text-1 transition-colors">
            itineraires
          </Link>
          <span aria-hidden>/</span>
          <span className="text-text-2">{trip.id}</span>
          <span aria-hidden>/</span>
          <span className="text-ice">result</span>
        </nav>

        {/* Hero block */}
        <section className="rounded-lg bg-bg-elev1 ring-1 ring-stroke-soft overflow-hidden mb-6">
          <div className="px-6 pt-5 pb-5 flex items-start justify-between gap-6">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-3">
                  TR · {trip.id.toUpperCase()}
                </span>
                <span aria-hidden className="h-3 w-px bg-stroke" />
                <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-text-2">
                  <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-lime shadow-[0_0_6px_1px_oklch(0.85_0.16_130_/_0.7)]" />
                  {statusLabel(trip.status)}
                </span>
              </div>
              <h1 className="text-[34px] font-semibold tracking-tight text-text-1 leading-none">
                {trip.name}
              </h1>
              <p className="mt-3 text-[13px] text-text-2 max-w-xl">
                <span className="font-mono text-text-1">
                  {trip.startCity.name}
                </span>{" "}
                →{" "}
                {trip.destinations.map((d, i) => (
                  <span key={d.id}>
                    <span className="font-mono text-text-1">
                      {d.city.name}
                    </span>
                    {i < trip.destinations.length - 1 && (
                      <span aria-hidden className="mx-1 text-text-3">→</span>
                    )}
                  </span>
                ))}{" "}
                <span aria-hidden className="mx-1 text-text-3">→</span>
                <span className="font-mono text-text-1">
                  {trip.startCity.name}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={`/trip/${trip.id}/compare`}
                className="inline-flex items-center gap-1.5 h-8 rounded-md border border-stroke bg-bg-elev2 px-3 font-mono text-[11px] uppercase tracking-[0.12em] text-text-2 hover:text-text-1 hover:border-stroke transition-colors"
              >
                <span aria-hidden>⊟</span>
                Comparer
              </Link>
              <Link
                href={`/trip/${trip.id}/export`}
                className="inline-flex items-center gap-1.5 h-8 rounded-md border border-stroke bg-bg-elev2 px-3 font-mono text-[11px] uppercase tracking-[0.12em] text-text-2 hover:text-text-1 hover:border-stroke transition-colors"
              >
                <span aria-hidden>↓</span>
                Export PDF
              </Link>
              <Link
                href={`/trip/${trip.id}/recap`}
                className="inline-flex items-center gap-1.5 h-8 rounded-md bg-ice px-3.5 font-medium text-[12px] text-bg-base hover:bg-ice/90 transition-colors"
              >
                Récapituler
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>

          {/* Meta row */}
          <div className="grid grid-cols-4 divide-x divide-stroke-soft border-t border-stroke-soft">
            <MetaCell label="départ" value={formatDateLong(trip.startDate)} />
            <MetaCell label="retour" value={formatDateLong(trip.endDate)} />
            <MetaCell label="durée" value={`${days} jours`} />
            <MetaCell
              label="prix plancher"
              value={formatCost(cheapest.totalCostEUR)}
              accent="amber"
            />
          </div>
        </section>

        {/* Console */}
        <AlternativeConsole
          startCity={trip.startCity}
          alternatives={trip.alternatives}
          defaultKind="cheapest"
        />
      </main>
    </AppShell>
  );
}

function MetaCell({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "amber" | "ice";
}) {
  const cls = accent === "amber" ? "text-amber" : accent === "ice" ? "text-ice" : "text-text-1";
  return (
    <div className="px-5 py-3">
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-3 mb-1">
        {label}
      </div>
      <div className={`font-mono text-[14px] tabular-nums ${cls}`}>{value}</div>
    </div>
  );
}
