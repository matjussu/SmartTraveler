import { MOCK_TRIPS } from "@/mocks/trips";
import { AppShell } from "@/components/atlas/app-shell";
import { TripRow } from "@/components/atlas/trip-row";

export default function Home() {
  const trips = MOCK_TRIPS;

  // Aggregate stats
  const totalTrips = trips.length;
  const totalSegments = trips.reduce(
    (acc, t) => acc + t.alternatives[0].legs.length,
    0
  );
  const minCost = Math.min(
    ...trips.flatMap((t) => t.alternatives.map((a) => a.totalCostEUR))
  );
  const totalCO2Floor = Math.min(
    ...trips.flatMap((t) => t.alternatives.map((a) => a.totalCo2Kg))
  );

  return (
    <AppShell current="trips">
      <main className="px-8 pt-8 pb-16">
        {/* Page header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ice">
                index · console
              </span>
              <span className="h-1 w-1 rounded-full bg-text-3" aria-hidden />
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-text-3 tabular-nums">
                {totalTrips} entrées
              </span>
            </div>
            <h1 className="text-[32px] font-semibold tracking-tight text-text-1 leading-tight">
              Itinéraires
            </h1>
            <p className="mt-1.5 text-[13px] text-text-2 max-w-lg">
              Toutes les optimisations TSP en mémoire. Chaque ligne expose les
              trois alternatives calculées avec le meilleur scorer mis en valeur.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 h-8 rounded-md border border-stroke bg-bg-elev1 px-3 font-mono text-[11px] uppercase tracking-[0.12em] text-text-2 hover:text-text-1 hover:border-stroke transition-colors"
            >
              <span aria-hidden>⇅</span>
              Trier
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 h-8 rounded-md border border-stroke bg-bg-elev1 px-3 font-mono text-[11px] uppercase tracking-[0.12em] text-text-2 hover:text-text-1 hover:border-stroke transition-colors"
            >
              <span aria-hidden>⊞</span>
              Vue
            </button>
          </div>
        </div>

        {/* Stat strip */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          <StatTile
            label="Voyages actifs"
            value={`${totalTrips}`}
            sub="3 calculés · 1 brouillon"
            accent="ice"
          />
          <StatTile
            label="Segments planifiés"
            value={`${totalSegments}`}
            sub="vol · train · bus"
            accent="text-1"
          />
          <StatTile
            label="Prix plancher"
            value={`${minCost}€`}
            sub="cheapest scorer"
            accent="amber"
          />
          <StatTile
            label="Empreinte minimale"
            value={`${totalCO2Floor}kg`}
            sub="eco scorer"
            accent="lime"
          />
        </div>

        {/* List header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-semibold text-text-1">
            Toutes les routes
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-3">
            tri : updated_at desc
          </span>
        </div>

        {/* Trip rows */}
        <ul className="space-y-3">
          {trips.map((trip, i) => (
            <li key={trip.id}>
              <TripRow trip={trip} index={i} />
            </li>
          ))}
        </ul>

        {/* Empty CTA */}
        <div className="mt-10 rounded-lg border border-dashed border-stroke bg-bg-elev1/30 px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-[13px] text-text-1 font-medium">
              Composer un nouvel itinéraire
            </p>
            <p className="text-[12px] text-text-3 mt-0.5">
              Ville de départ + destinations + contraintes → 3 alternatives en
              quelques secondes.
            </p>
          </div>
          <a
            href="/trip/new"
            className="inline-flex items-center gap-1.5 h-8 rounded-md bg-ice px-3.5 text-[12px] font-medium text-bg-base hover:bg-ice/90 transition-colors"
          >
            <span aria-hidden>＋</span>
            Démarrer
          </a>
        </div>
      </main>
    </AppShell>
  );
}

function StatTile({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  accent: "ice" | "amber" | "lime" | "coral" | "text-1";
}) {
  const cls =
    accent === "ice"
      ? "text-ice"
      : accent === "amber"
      ? "text-amber"
      : accent === "lime"
      ? "text-lime"
      : accent === "coral"
      ? "text-coral"
      : "text-text-1";
  return (
    <div className="rounded-lg bg-bg-elev1 ring-1 ring-stroke-soft px-4 py-3">
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-3">
        {label}
      </div>
      <div className={`mt-2 font-mono text-[24px] leading-none font-semibold tabular-nums ${cls}`}>
        {value}
      </div>
      <div className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-text-3">
        {sub}
      </div>
    </div>
  );
}
