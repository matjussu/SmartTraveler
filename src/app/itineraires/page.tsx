import Link from "next/link";

import { TopNav } from "@/components/voyage/top-nav";
import { BoardingTicketMini } from "@/components/voyage/boarding-ticket-mini";
import { MOCK_TRIPS } from "@/mocks/trips";

/**
 * /itineraires — « Vos itinéraires ».
 *
 * Liste des voyages sous forme de mini billets d'embarquement papier sur la
 * page noire. Server component lisant MOCK_TRIPS (liens fiables côté serveur :
 * /result pour les calculés, /recap pour les brouillons). Les voyages créés en
 * local (store Zustand) pourront s'ajouter plus tard via une vue client.
 */
export default function ItinerairesPage() {
  const trips = MOCK_TRIPS;

  return (
    <main data-route="voyage-dark" className="relative flex min-h-screen flex-col">
      <TopNav variant="dark" />

      <div className="mx-auto w-full max-w-6xl px-6 pb-24 pt-10">
        {/* Hero */}
        <section className="mb-12">
          <div className="mb-4 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-white/45">
            <span aria-hidden className="inline-block h-1 w-6 bg-[#ff7a1a]" />
            <span>
              {trips.length} voyage{trips.length > 1 ? "s" : ""}
            </span>
          </div>
          <h1
            className="text-[clamp(40px,6vw,68px)] leading-[0.98] tracking-[-0.015em] text-[#f6f6f4]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Vos{" "}
            <span style={{  }} className="text-[#ff8a3d]">
              itinéraires.
            </span>
          </h1>
          <p
            className="mt-5 max-w-xl text-[16px] leading-[1.55] text-white/70"
            style={{ fontFamily: "var(--font-jakarta)" }}
          >
            Reprenez un voyage là où vous l&apos;avez laissé, ou composez-en un
            nouveau. Chaque billet ouvre son itinéraire.
          </p>
        </section>

        {/* Grille de billets */}
        <section
          aria-label="Liste des voyages"
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {trips.map((trip) => (
            <BoardingTicketMini key={trip.id} trip={trip} />
          ))}

          {/* Carte « Nouveau voyage » */}
          <Link
            href="/trip/new"
            className="group flex min-h-[180px] flex-col items-center justify-center gap-3 rounded-[14px] border border-dashed border-white/15 bg-white/[0.02] px-6 text-center transition-colors duration-200 hover:border-[#ff7a1a]/50 hover:bg-[#ff7a1a]/[0.04]"
          >
            <span
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[#ff7a1a]/10 text-[20px] text-[#ff7a1a] ring-1 ring-[#ff7a1a]/40 transition-transform duration-200 group-hover:scale-105"
              aria-hidden
            >
              +
            </span>
            <span
              className="text-[15px] text-white/80"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Nouveau voyage
            </span>
          </Link>
        </section>

        <footer className="mt-20 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-6 text-[12px] text-white/40">
          <div className="flex items-center gap-2">
            <span
              style={{ fontFamily: "var(--font-display)" }}
              className="text-[15px] text-white/65"
            >
              SmartTraveler
            </span>
            <span aria-hidden>·</span>
            <span>Compose, compare, choisis.</span>
          </div>
          <div>© 2026 — voyages composés avec soin.</div>
        </footer>
      </div>
    </main>
  );
}
