import Link from "next/link";

import { TopNav } from "@/components/voyage/top-nav";
import { SplashIntro } from "@/components/splash/splash-intro";
import { SplitFlap } from "@/components/splash/split-flap";

/**
 * Home `/` — Phase 1 du grand redesign SmartTraveler.
 *
 * Bascule de la direction voyage-pivot (cream éditorial italique) vers une
 * identité tableau Solari authentique noire :
 *
 *  - <SplashIntro /> en overlay fixed z-50 qui couvre tout au mount. Split-Flap
 *    XL "SMART TRAVELER" animation L→R (cf split-flap.css). Scroll-driven
 *    shrink + fade-out (useScrollProgress(320)). À CHAQUE arrivée sur `/`,
 *    pas de flag localStorage — c'est une démo, le splash rejoue.
 *  - <main> minimaliste fond noir contient le H1 mini Split-Flap "in place"
 *    qui reprend visuellement le splash quand l'overlay disparaît à scroll=1.
 *  - Subtitle Plus Jakarta Sans sobre (PAS italique Instrument Serif — le
 *    Split-Flap fait déjà tout le wow visuel).
 *  - UN seul CTA terracotta "Nouveau voyage" (l'ancien "Reprendre un voyage en
 *    cours" est supprimé, les TripCards "Vos itinéraires" sont retirés
 *    temporairement de cette home — réapparaîtront dans une itération future).
 *  - Top-nav variant="dark" — bg matte black coordonné.
 *  - data-route="home-redesign" sur le main → globals.css force body bg #050505
 *    UNIQUEMENT pour cette route. Les autres routes (/trip/*, /shared/*)
 *    conservent leur fond cream voyage-pivot intact.
 */
export default function Home() {
  return (
    <main data-route="home-redesign" className="home-redesign flex flex-col">
      <SplashIntro text="SMART TRAVELER" />
      <TopNav variant="dark" />

      <div className="mx-auto w-full max-w-6xl px-6 pb-24 pt-16 md:pt-24">
        {/* Hero — Split-Flap mini in-place + subtitle sobre + 1 CTA terracotta */}
        <section className="flex min-h-[78vh] flex-col items-center justify-center gap-10 text-center">
          <div className="flex flex-col items-center gap-5">
            <div className="inline-flex items-center gap-2.5 text-[10.5px] uppercase tracking-[0.22em] text-white/45">
              <span aria-hidden className="splash-intro-dot" />
              <span>Smart Traveler</span>
            </div>

            {/* H1 — Split-Flap mini, reprend visuellement le splash en mode shrinked */}
            <h1 className="sr-only">SMART TRAVELER</h1>
            <SplitFlap text="SMART TRAVELER" size="mini" />
          </div>

          <p
            className="max-w-xl text-[15.5px] leading-[1.6] text-white/65"
            style={{ fontFamily: "var(--font-jakarta)" }}
          >
            Organiser vos prochaines vacances. Composez un voyage, choisissez sa
            forme — la plus économique, la plus rapide, la plus douce — et embarquez.
          </p>

          <Link
            href="/trip/new"
            className="inline-flex items-center gap-2.5 rounded-full bg-[var(--terracotta)] px-6 py-3.5 text-[14px] font-medium text-[oklch(0.99_0.005_80)] shadow-[0_18px_36px_-18px_oklch(0.62_0.155_38_/_0.65)] transition-transform duration-200 ease-out hover:scale-[1.02] active:scale-[0.98]"
            style={{ fontFamily: "var(--font-jakarta)" }}
          >
            <span>Nouveau voyage</span>
            <span aria-hidden className="text-base leading-none">
              →
            </span>
          </Link>
        </section>

        <footer className="mt-20 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-6 text-[12px] text-white/40">
          <div className="flex items-center gap-2">
            <span
              style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
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
