import { MOCK_TRIPS } from "@/mocks/trips";
import { TopNav } from "@/components/voyage/top-nav";
import { BoardingTicket } from "@/components/voyage/boarding-ticket";
import Link from "next/link";
import { formatCost, formatCo2 } from "@/lib/format";

export default function Home() {
  const trips = MOCK_TRIPS;
  const minCost = Math.min(
    ...trips.flatMap((t) => t.alternatives.map((a) => a.totalCostEUR))
  );
  const minCo2 = Math.min(
    ...trips.flatMap((t) => t.alternatives.map((a) => a.totalCo2Kg))
  );

  return (
    <>
      <TopNav />
      <main className="mx-auto w-full max-w-6xl px-6 pb-24 pt-10">
        {/* Hero — chaleureux, évasion */}
        <section className="relative mb-14">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 md:col-span-9">
              <div className="mb-4 inline-flex items-center gap-2 text-[11px] tracking-[0.14em] text-ink-mute uppercase">
                <span
                  aria-hidden
                  className="inline-block h-1 w-6 bg-[oklch(0.62_0.155_38)]"
                />
                <span>L&apos;été 2026 vous attend</span>
              </div>

              <h1
                className="text-[clamp(48px,7vw,82px)] leading-[0.95] tracking-[-0.015em] text-ink"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Composez vos
                <br />
                <span style={{ fontStyle: "italic" }} className="text-[oklch(0.42_0.13_35)]">
                  prochaines vacances.
                </span>
              </h1>

              <p className="mt-7 max-w-xl text-[16px] leading-[1.55] text-ink-soft">
                Choisissez vos villes, posez vos dates. SmartTraveler vous propose
                trois façons d&apos;arriver là-bas — la plus économique, la plus
                rapide, la plus douce pour la planète. À vous de choisir l&apos;histoire
                que vous voulez raconter.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/trip/new"
                  className="inline-flex items-center gap-2 rounded-full bg-[oklch(0.62_0.155_38)] px-5 py-3 text-[14px] font-medium text-[oklch(0.99_0.005_80)] transition-transform duration-200 ease-out hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Commencer un voyage</span>
                  <span aria-hidden>→</span>
                </Link>
                <Link
                  href="#vos-itineraires"
                  className="text-[14px] text-ink-soft underline decoration-[oklch(0.78_0.13_75)] decoration-2 underline-offset-4 transition-colors hover:text-ink"
                >
                  Reprendre un voyage en cours
                </Link>
              </div>
            </div>

            <aside className="col-span-12 md:col-span-3 md:pl-4 md:border-l md:border-line flex flex-col gap-7 md:pt-3">
              <div>
                <div className="text-[10px] uppercase tracking-[0.14em] text-ink-mute">
                  Cet été, à partir de
                </div>
                <div
                  className="mt-1 text-[34px] tracking-tight text-ink tabular-nums"
                  style={{ fontFamily: "var(--font-mono)", fontWeight: 500 }}
                >
                  {formatCost(minCost)}
                </div>
                <div className="mt-1 text-[12px] text-ink-mute">
                  vol aller-retour multi-villes
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.14em] text-ink-mute">
                  Option la plus douce
                </div>
                <div
                  className="mt-1 text-[28px] tracking-tight tabular-nums text-[oklch(0.38_0.07_150)]"
                  style={{ fontFamily: "var(--font-mono)", fontWeight: 500 }}
                >
                  {formatCo2(minCo2)}
                </div>
                <div className="mt-1 text-[12px] text-ink-mute">
                  en train, plutôt qu&apos;en avion
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* Section vos itinéraires */}
        <section id="vos-itineraires" className="mb-14 scroll-mt-24">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2
                className="text-[28px] tracking-tight text-ink"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Vos itinéraires
              </h2>
              <p className="mt-1 text-[13px] text-ink-mute">
                Cliquez sur un billet pour ouvrir le détail des trois alternatives.
              </p>
            </div>
            <div className="hidden items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-ink-mute md:flex">
              <span>{trips.length} voyages composés</span>
            </div>
          </div>

          <ul className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {trips.map((trip) => (
              <li key={trip.id}>
                <BoardingTicket trip={trip} />
              </li>
            ))}
          </ul>
        </section>

        {/* CTA composition */}
        <section className="rounded-[24px] border border-line bg-[oklch(0.96_0.018_70)] px-10 py-12 grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 md:col-span-8">
            <div className="text-[11px] uppercase tracking-[0.14em] text-[oklch(0.42_0.13_35)] mb-3">
              Le voyage commence ici
            </div>
            <h3
              className="text-[36px] leading-[1.05] tracking-tight text-ink"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Un nouveau voyage,
              <br />
              <span style={{ fontStyle: "italic" }}>en moins d&apos;une minute.</span>
            </h3>
            <p className="mt-4 max-w-xl text-[14.5px] leading-[1.55] text-ink-soft">
              Votre ville de départ, deux ou trois destinations qui vous font envie,
              vos dates. On s&apos;occupe du reste — vous avez juste à choisir la version
              du voyage qui vous ressemble.
            </p>
          </div>
          <div className="col-span-12 md:col-span-4 md:text-right">
            <Link
              href="/trip/new"
              className="inline-flex items-center gap-2 rounded-full bg-[oklch(0.62_0.155_38)] px-6 py-3.5 text-[14px] font-medium text-[oklch(0.99_0.005_80)] shadow-[0_10px_22px_-12px_oklch(0.42_0.13_35_/_0.5)] transition-transform duration-200 ease-out hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Composer un voyage</span>
              <span aria-hidden>→</span>
            </Link>
          </div>
        </section>

        <footer className="mt-16 flex flex-wrap items-center justify-between gap-3 text-[12px] text-ink-mute">
          <div className="flex items-center gap-2">
            <span
              style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
              className="text-[15px] text-ink-soft"
            >
              SmartTraveler
            </span>
            <span aria-hidden>·</span>
            <span>Compose, compare, choisis.</span>
          </div>
          <div>© 2026 — voyages composés avec soin.</div>
        </footer>
      </main>
    </>
  );
}
