import { notFound } from "next/navigation";
import Link from "next/link";
import { getTripById } from "@/mocks/trips";
import {
  formatCost,
  formatDateLong,
  statusLabel,
  tripDurationDays,
} from "@/lib/format";
import { TopNav } from "@/components/concorde/top-nav";
import { AlternativeDeck } from "@/components/concorde/alternative-deck";

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
    <>
      <TopNav />
      <main className="mx-auto max-w-6xl px-6 pt-6 pb-24">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-frost-3 mb-6">
          <Link href="/" className="hover:text-frost transition-colors">
            Itinéraires
          </Link>
          <span aria-hidden>›</span>
          <span className="text-frost-2">{trip.name}</span>
          <span aria-hidden>›</span>
          <span className="text-aurora">Embarquement</span>
        </nav>

        {/* Hero glass */}
        <section className="rounded-3xl glass-strong overflow-hidden mb-7 relative">
          {/* Aurora blob */}
          <span
            aria-hidden
            className="absolute -top-20 right-10 h-60 w-60 rounded-full blur-3xl pointer-events-none opacity-50"
            style={{
              background:
                "radial-gradient(circle, oklch(0.74 0.12 235 / 0.5), transparent 65%)",
            }}
          />
          <div className="relative px-8 pt-7 pb-8 flex items-start justify-between gap-6">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-2 rounded-full glass-soft px-3 py-1">
                  <span
                    aria-hidden
                    className="h-1.5 w-1.5 rounded-full bg-lichen shadow-[0_0_8px_2px_oklch(0.76_0.14_155_/_0.7)]"
                  />
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-frost-2">
                    {statusLabel(trip.status)}
                  </span>
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-frost-3">
                  ST · {trip.id.slice(-3).toUpperCase()}
                </span>
              </div>
              <h1 className="text-[48px] font-semibold tracking-[-0.02em] text-frost leading-[0.98]">
                {trip.name}
              </h1>
              <div className="mt-5 flex items-baseline gap-4">
                <span className="font-mono text-[26px] font-semibold tabular-nums tracking-tight text-frost">
                  {trip.startCity.name.slice(0, 3).toUpperCase()}
                </span>
                {trip.destinations.map((d) => (
                  <span key={d.id} className="flex items-baseline gap-4">
                    <span aria-hidden className="text-frost-3">
                      →
                    </span>
                    <span className="font-mono text-[26px] font-semibold tabular-nums tracking-tight text-frost">
                      {d.city.name.slice(0, 3).toUpperCase()}
                    </span>
                  </span>
                ))}
                <span aria-hidden className="text-frost-3">
                  →
                </span>
                <span className="font-mono text-[26px] font-semibold tabular-nums tracking-tight text-frost-2">
                  {trip.startCity.name.slice(0, 3).toUpperCase()}
                </span>
              </div>
              <p className="mt-3 text-[13px] text-frost-3">
                {trip.startCity.name} ·{" "}
                {trip.destinations.map((d) => d.city.name).join(" · ")}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={`/trip/${trip.id}/compare`}
                className="inline-flex items-center gap-1.5 h-9 rounded-full glass-soft px-4 text-[12px] font-medium text-frost hover:bg-white/10 transition-colors"
              >
                Comparer
              </Link>
              <Link
                href={`/trip/${trip.id}/export`}
                className="inline-flex items-center gap-1.5 h-9 rounded-full glass-soft px-4 text-[12px] font-medium text-frost hover:bg-white/10 transition-colors"
              >
                <span aria-hidden>↓</span>
                PDF
              </Link>
              <Link
                href={`/trip/${trip.id}/recap`}
                className="inline-flex items-center gap-1.5 h-9 rounded-full bg-frost px-4 text-[12px] font-semibold text-night hover:bg-white transition-all duration-200 hover:scale-[1.03]"
              >
                Récapituler
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-4 divide-x divide-white/5 border-t border-white/5">
            <Meta label="Départ" value={formatDateLong(trip.startDate)} />
            <Meta label="Retour" value={formatDateLong(trip.endDate)} />
            <Meta label="Durée" value={`${days} jours`} />
            <Meta
              label="À partir de"
              value={formatCost(cheapest.totalCostEUR)}
              accent="ember"
            />
          </div>
        </section>

        {/* Deck */}
        <AlternativeDeck
          startCity={trip.startCity}
          alternatives={trip.alternatives}
          defaultKind="cheapest"
        />
      </main>
    </>
  );
}

function Meta({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "ember";
}) {
  const cls = accent === "ember" ? "text-ember" : "text-frost";
  return (
    <div className="px-6 py-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-frost-3 mb-1.5">
        {label}
      </div>
      <div className={`font-mono text-[15px] tabular-nums font-semibold ${cls}`}>
        {value}
      </div>
    </div>
  );
}
