import { notFound } from "next/navigation";
import Link from "next/link";
import { getTripById } from "@/mocks/trips";
import {
  formatCost,
  formatDateLong,
  statusLabel,
  tripDurationDays,
} from "@/lib/format";
import { SiteHeader } from "@/components/compass/site-header";
import { AlternativeSwitcher } from "@/components/compass/alternative-switcher";

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
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-8 pt-12 pb-24">
        {/* Breadcrumb + status rail */}
        <nav className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft mb-7">
          <Link href="/" className="hover:text-ink transition-colors">
            Carnet
          </Link>
          <span aria-hidden>·</span>
          <span className="text-ink">{trip.name}</span>
          <span aria-hidden className="ml-3 h-3 w-px bg-rule" />
          <span className="ml-3 inline-flex items-center gap-1.5">
            <span
              aria-hidden
              className="inline-block h-1.5 w-1.5 rounded-full bg-sage"
            />
            {statusLabel(trip.status)}
          </span>
        </nav>

        {/* Hero editorial */}
        <section className="grid grid-cols-12 gap-8 items-end pb-10 border-b border-rule/60 mb-10">
          <header className="col-span-12 md:col-span-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-copper mb-4">
              Itinéraire №{" "}
              {trip.id.split("-").slice(-1)[0]?.slice(0, 3).toUpperCase()}
            </p>
            <h1 className="font-display text-[58px] leading-[0.98] font-medium tracking-tight text-ink">
              {trip.name}
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-ink-soft max-w-xl">
              Depuis{" "}
              <span className="font-medium text-ink">
                {trip.startCity.name}
              </span>{" "}
              vers{" "}
              {trip.destinations.map((d, i) => (
                <span key={d.id}>
                  <span className="font-medium text-ink">{d.city.name}</span>
                  {i < trip.destinations.length - 2
                    ? ", "
                    : i === trip.destinations.length - 2
                    ? " et "
                    : ""}
                </span>
              ))}
              . Trois lectures du même voyage.
            </p>
          </header>

          <aside className="col-span-12 md:col-span-4 md:pl-8 md:border-l md:border-rule/60">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
              <Meta label="départ" value={formatDateLong(trip.startDate)} />
              <Meta label="retour" value={formatDateLong(trip.endDate)} />
              <Meta label="durée" value={`${days} jours`} />
              <Meta
                label="à partir de"
                value={formatCost(cheapest.totalCostEUR)}
                accent
              />
            </dl>
          </aside>
        </section>

        {/* Alternative switcher with map + legs + totals */}
        <AlternativeSwitcher
          startCity={trip.startCity}
          alternatives={trip.alternatives}
          defaultKind="cheapest"
        />

        {/* Footer actions */}
        <section className="mt-12 grid grid-cols-12 gap-8 items-start pt-10 border-t border-rule/60">
          <div className="col-span-12 md:col-span-7">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">
              Suite du carnet
            </p>
            <p className="mt-2 font-display text-[20px] leading-snug text-ink/85 max-w-md">
              Comparez les trois propositions côte à côte, ou figez ce voyage
              dans le carnet.
            </p>
          </div>
          <div className="col-span-12 md:col-span-5 md:pl-8 md:border-l md:border-rule/60 flex flex-wrap items-center gap-2.5">
            <Link
              href={`/trip/${trip.id}/compare`}
              className="inline-flex items-center gap-2 rounded-md border border-ink/15 bg-card px-4 py-2.5 text-[13px] font-medium text-ink hover:border-ink/30 hover:bg-paper-soft transition-colors"
            >
              Comparer les 3
            </Link>
            <Link
              href={`/trip/${trip.id}/export`}
              className="inline-flex items-center gap-2 rounded-md border border-ink/15 bg-card px-4 py-2.5 text-[13px] font-medium text-ink hover:border-ink/30 hover:bg-paper-soft transition-colors"
            >
              Exporter PDF
            </Link>
            <Link
              href={`/trip/${trip.id}/recap`}
              className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2.5 text-[13px] font-medium text-paper hover:bg-ink/90 transition-colors"
            >
              Récapituler
            </Link>
          </div>
        </section>
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
  accent?: boolean;
}) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">
        {label}
      </dt>
      <dd
        className={`font-display text-[18px] leading-tight mt-0.5 ${
          accent ? "text-copper" : "text-ink"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
