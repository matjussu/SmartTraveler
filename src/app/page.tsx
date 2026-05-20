import Link from "next/link";

import { TopNav } from "@/components/voyage/top-nav";
import { SplashIntro } from "@/components/splash/splash-intro";

/**
 * Home `/` — Phase 1 du grand redesign SmartTraveler (itération bug-fix #1530).
 *
 * Bascule de la direction voyage-pivot (cream éditorial italique) vers une
 * identité tableau Solari authentique noire. Architecture :
 *
 *  - **UN SEUL SplitFlap** géré par `<SplashIntro>` (overlay fixed z-50).
 *    Au scroll, il shrinke (scale + translateY vers haut) MAIS reste opacity 1
 *    — il devient le "H1" visuel final, pas un overlay qui disparaît.
 *  - Le main contient subtitle + CTA positionnés via `pt-[42vh]` pour qu'ils
 *    soient visibles SOUS le splash shrinké dès que la transition est complète.
 *  - `min-h-[130vh]` sur la zone scroll garantit que la page est suffisamment
 *    longue pour que user puisse scroller les 280px nécessaires à la transition.
 *  - Labels colonnes "Flight Number" / "Destination" portés par le SplitFlap
 *    (port direct du mock Claude Design `claude_design/Split Flap Board.html`).
 *  - data-route="home-redesign" sur le main → globals.css force bg matte black
 *    UNIQUEMENT pour cette route. Autres routes (/trip/*, /shared/*) intactes.
 */
export default function Home() {
  return (
    <main data-route="home-redesign" className="home-redesign relative">
      <SplashIntro
        text="SMART TRAVELER"
        columnLabels={["Flight Number", "Destination"]}
        scrollThreshold={280}
      />
      <TopNav variant="dark" />

      {/* H1 sémantique pour SEO + landmark a11y (le SplitFlap a role="img"). */}
      <h1 className="sr-only">SMART TRAVELER</h1>

      {/* Hero : subtitle + CTA positionnés SOUS la position finale du splash.
          pt-[42vh] = laisse de la place au splash shrinké en haut du viewport. */}
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-8 px-6 pb-24 pt-[42vh] text-center min-h-[130vh]">
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

        <footer className="mt-auto flex flex-wrap items-center justify-between gap-3 self-stretch border-t border-white/[0.06] pt-6 text-[12px] text-white/40">
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
