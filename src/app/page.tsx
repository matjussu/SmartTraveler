import Link from "next/link";

import { TopNav } from "@/components/voyage/top-nav";
import { SplashIntro } from "@/components/splash/splash-intro";

/**
 * Home `/` — Phase 1 du grand redesign SmartTraveler (itération #1546).
 *
 * Architecture finalisée :
 *
 *  - **UN SEUL SplitFlap** géré par `<SplashIntro>` (fixed z-50). Shrinke au scroll
 *    jusqu'à scale 0.5 + translateY -26vh + background fade-out à transparent.
 *  - **Placeholder in-page** `<div className="splash-placeholder">` réserve l'espace
 *    que le SplitFlap mini occupe visuellement au final state. Sans ça, subtitle + CTA
 *    se positionneraient sous le top-nav et seraient superposés visuellement avec
 *    le splash overlay (qui est position:fixed et hors du flow document).
 *  - **Subtitle + CTA** suivent le placeholder dans le flow naturel — donc toujours
 *    SOUS le splash shrinké, jamais superposés ni cachés.
 *  - `min-h-[120vh]` garantit page scrollable pour déclencher la transition.
 *  - data-route="home-redesign" → globals.css scope bg matte black sur cette route
 *    UNIQUEMENT. Autres routes (/trip/*, /shared/*) conservent leur fond cream.
 */
export default function Home() {
  return (
    <main data-route="home-redesign" className="home-redesign relative min-h-[120vh]">
      <SplashIntro
        text="SMART TRAVELER"
        columnLabels={["Flight Number", "Destination"]}
        scrollThreshold={280}
      />
      <TopNav variant="dark" />

      {/* H1 sémantique pour SEO + landmark a11y (le SplitFlap a role="img"). */}
      <h1 className="sr-only">SMART TRAVELER</h1>

      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-10 px-6 pb-24 pt-32 text-center">
        {/*
          Placeholder réservant l'espace du SplitFlap mini final dans le flow.
          Dimensions calées sur la zone visuelle qu'occupe le board scale 0.5 :
          - SplitFlap XL flap-h ≈ 80px * 1.42 + label (16px) + gap (18px) ≈ 148px
          - À scale 0.5 ≈ 74px d'effective height
          - On réserve clamp(96px, 14vh, 160px) pour respiration + label visibility
          Aria-hidden : invisible aux screen readers (le H1 sr-only joue ce rôle).
        */}
        <div
          aria-hidden
          className="splash-placeholder"
          style={{ height: "clamp(96px, 14vh, 160px)", width: "100%" }}
        />

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
