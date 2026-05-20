import { MOCK_TRIPS } from "@/mocks/trips";
import { SiteHeader } from "@/components/compass/site-header";
import { TripCard } from "@/components/compass/trip-card";

export default function Home() {
  const trips = MOCK_TRIPS;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-8 pt-16 pb-24">
        {/* Editorial intro block */}
        <section className="grid grid-cols-12 gap-8 items-end pb-12 border-b border-rule/60">
          <div className="col-span-12 md:col-span-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-copper mb-5">
              Carnet de route · {trips.length} voyages composés
            </p>
            <h1 className="font-display text-[64px] leading-[0.96] font-medium text-ink tracking-tight">
              Composer un voyage,<br />
              <span className="italic font-normal text-ink/80">
                en assembler l’ordre.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-ink-soft">
              SmartTraveler combine vos villes, vos contraintes et vos dates pour
              proposer trois lectures du même voyage&nbsp;: la plus économique,
              la plus rapide, la plus sobre en carbone.
            </p>
          </div>

          <aside className="col-span-12 md:col-span-4 md:pl-8 md:border-l md:border-rule/60">
            <dl className="space-y-4">
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">
                  Édition
                </dt>
                <dd className="font-display text-[20px] text-ink mt-0.5">
                  Été 2026
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">
                  Couverture
                </dt>
                <dd className="font-display text-[20px] text-ink mt-0.5">
                  Europe
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">
                  Méthode
                </dt>
                <dd className="text-[13px] text-ink-soft mt-1 leading-relaxed">
                  Optimisation TSP&nbsp;— contraintes d’ordre partiel et dates
                  ancrées prises en compte.
                </dd>
              </div>
            </dl>
          </aside>
        </section>

        {/* Trip list */}
        <section className="mt-14">
          <div className="flex items-baseline justify-between mb-7">
            <h2 className="font-display text-[22px] font-medium text-ink tracking-tight">
              Itinéraires en cours
            </h2>
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft">
              Tri&nbsp;: récent → ancien
            </span>
          </div>

          <ul className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {trips.map((trip, i) => (
              <li key={trip.id}>
                <TripCard trip={trip} index={i} />
              </li>
            ))}
          </ul>
        </section>

        {/* Editorial footnote */}
        <section className="mt-20 grid grid-cols-12 gap-8 items-start">
          <div className="col-span-12 md:col-span-7">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">
              Note de l’éditeur
            </p>
            <p className="mt-3 font-display text-[20px] leading-snug text-ink/85 italic">
              «&nbsp;Le bon itinéraire n’est pas le plus court. C’est celui qui
              fait sens dans l’ordre où vous l’habitez.&nbsp;»
            </p>
          </div>
          <div className="col-span-12 md:col-span-5 md:pl-8 md:border-l md:border-rule/60">
            <a
              href="/trip/new"
              className="inline-flex items-center gap-2 rounded-md border border-ink/15 bg-card px-4 py-2.5 text-[13px] font-medium text-ink hover:border-ink/30 hover:bg-paper-soft transition-colors"
            >
              <span aria-hidden>＋</span>
              Commencer un nouveau voyage
            </a>
            <p className="mt-3 text-[12px] text-ink-soft leading-relaxed">
              Trois villes minimum, des dates, vos contraintes.
              Le carnet s’occupe du reste.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
