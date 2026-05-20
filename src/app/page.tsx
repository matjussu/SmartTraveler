import { MOCK_TRIPS } from "@/mocks/trips";
import { TopNav } from "@/components/concorde/top-nav";
import { BoardingCard } from "@/components/concorde/boarding-card";

export default function Home() {
  const trips = MOCK_TRIPS;
  const minCost = Math.min(
    ...trips.flatMap((t) => t.alternatives.map((a) => a.totalCostEUR))
  );
  const minCO2 = Math.min(
    ...trips.flatMap((t) => t.alternatives.map((a) => a.totalCo2Kg))
  );

  return (
    <>
      <TopNav />
      <main className="mx-auto max-w-6xl px-6 pt-8 pb-24">
        {/* Hero block */}
        <section className="mb-12">
          <div className="grid grid-cols-12 gap-6 items-end">
            <div className="col-span-12 md:col-span-8">
              <div className="inline-flex items-center gap-2 mb-5 rounded-full glass-soft px-3 py-1">
                <span
                  aria-hidden
                  className="h-1.5 w-1.5 rounded-full bg-aurora shadow-[0_0_8px_2px_oklch(0.74_0.12_235_/_0.7)]"
                />
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-frost-2">
                  Console embarquement · {trips.length} routes
                </span>
              </div>

              <h1 className="text-[62px] leading-[0.95] font-semibold tracking-[-0.02em] text-frost">
                Trois lectures,<br />
                <span className="text-aurora">un même voyage.</span>
              </h1>

              <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-frost-2">
                SmartTraveler optimise vos itinéraires multi-destinations puis
                vous présente l'économique, le rapide et le sobre. À vous
                d'embarquer sur la lecture qui vous ressemble.
              </p>
            </div>

            <div className="col-span-12 md:col-span-4 grid grid-cols-2 gap-3">
              <BigStat
                label="Prix plancher"
                value={`${minCost}€`}
                accent="ember"
              />
              <BigStat
                label="CO₂ plancher"
                value={`${minCO2}kg`}
                accent="lichen"
              />
            </div>
          </div>
        </section>

        {/* Section header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-[22px] font-semibold tracking-tight text-frost">
              Itinéraires en attente d'embarquement
            </h2>
            <p className="text-[13px] text-frost-3 mt-1">
              Cliquez sur une carte pour ouvrir le détail des alternatives.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-frost-3">
            <span>Tri</span>
            <span aria-hidden>·</span>
            <span className="text-frost-2">Mise à jour récente</span>
          </div>
        </div>

        {/* Cards grid */}
        <ul className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {trips.map((trip, i) => (
            <li key={trip.id}>
              <BoardingCard trip={trip} index={i} />
            </li>
          ))}
        </ul>

        {/* CTA composer */}
        <section className="mt-14 rounded-2xl glass-strong px-8 py-10 grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 md:col-span-8">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-aurora">
              Nouveau plan de vol
            </span>
            <h3 className="mt-2 text-[28px] font-semibold tracking-tight text-frost leading-tight">
              Composer un itinéraire complet en moins d'une minute.
            </h3>
            <p className="mt-3 text-[14px] text-frost-2 max-w-xl">
              Renseignez votre ville de départ, ajoutez vos destinations,
              ancrez vos dates. L'optimiseur s'occupe du reste.
            </p>
          </div>
          <div className="col-span-12 md:col-span-4 md:text-right">
            <a
              href="/trip/new"
              className="inline-flex items-center gap-2 rounded-full bg-frost px-5 py-3 text-[14px] font-semibold text-night hover:bg-white transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
            >
              <span aria-hidden>＋</span>
              Démarrer un voyage
            </a>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-frost-3">
              3 destinations min. · contraintes optionnelles
            </p>
          </div>
        </section>
      </main>
    </>
  );
}

function BigStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: "ember" | "helios" | "lichen" | "aurora";
}) {
  const cls =
    accent === "ember"
      ? "text-ember"
      : accent === "helios"
      ? "text-helios"
      : accent === "lichen"
      ? "text-lichen"
      : "text-aurora";
  return (
    <div className="rounded-xl glass-soft px-4 py-3.5">
      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-frost-3">
        {label}
      </div>
      <div
        className={`mt-2 font-mono text-[28px] font-semibold leading-none tabular-nums ${cls}`}
      >
        {value}
      </div>
    </div>
  );
}
