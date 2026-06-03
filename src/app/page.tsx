import Link from "next/link";

import { TopNav } from "@/components/voyage/top-nav";
import { SplashIntro } from "@/components/splash/splash-intro";
import { GlobeMount } from "@/components/globe/globe-mount";

/**
 * Home `/` — Phase 1 du grand redesign SmartTraveler.
 *
 * Architecture :
 *
 *  - **<SplashIntro>** : overlay `position: fixed inset-0 z-50` qui shrinke au
 *    scroll (scale 1→0.5, translateY 0→-26vh, bg opaque→transparent).
 *  - **<TopNav variant="dark">** : sticky z-30 (sous le splash visuellement —
 *    splash z-50). Reste affiché en permanence pour navigation.
 *  - **Spacer flex-1** : pousse le contenu (subtitle + CTA + footer) vers le
 *    bas de main. Pattern hero scroll-driven : au scroll initial le contenu est
 *    sous le fold (masqué par le splash opaque), puis remonte naturellement à
 *    mesure que l'utilisateur scroll, et atterrit SOUS le splash mini final
 *    (viewport-y ~145-285) et SOUS le TopNav. Sans flex-1, le contenu se
 *    positionne en haut de main et chevauche splash mini + topnav au max-scroll
 *    (bug visuel observé après fix scroll #1602).
 *  - Page scrollable garantie par `min-height: calc(100vh + 400px)` dans
 *    globals.css scoped sur `main[data-route="home-redesign"]`. Ne pas remettre
 *    `min-h-[120vh]` Tailwind sur ce <main> : le CSS scoped a une specificity
 *    supérieure (attribute+type selector bat la class) et l'écraserait.
 *  - data-route="home-redesign" → globals.css scope bg matte black sur cette
 *    route UNIQUEMENT. Autres routes conservent leur fond cream voyage-pivot.
 */
export default function Home() {
  return (
    <main
      data-route="home-redesign"
      className="home-redesign relative flex flex-col"
    >
      <SplashIntro
        text="SMART TRAVELER"
        columnLabels={["Flight Number", "Destination"]}
        scrollThreshold={280}
      />
      <TopNav variant="dark" />

      {/* H1 sémantique pour SEO + landmark a11y (le SplitFlap a role="img"). */}
      <h1 className="sr-only">SMART TRAVELER</h1>

      {/*
        Layout en DEUX ÉCRANS pour résoudre le mauvais placement du globe :

        Le splash est `position: fixed` (hors flow) → si on centrait le globe dans
        un conteneur flex-1 plein-hauteur, sa position absolue tombait pile où le
        titre mini se fige (~24vh) après shrink → chevauchement en haut de page.

        Solution : un spacer d'intro pousse la vraie composition SOUS le fold.
        - Écran 1 (spacer h-[78vh]) : occupé visuellement par le splash opaque.
        - Écran 2 (section min-h-screen, contenu centré) : révélé au scroll une
          fois le titre rétréci en mini-board fixe en haut. Le globe y est centré
          dans la vue, donc clairement SOUS le titre mini, jamais superposé.

        `h-[78vh]` est le bouton de réglage : ↑ = composition plus bas / révélée
        plus tard, ↓ = plus haut / révélée plus tôt.
      */}
      <div aria-hidden className="h-[78vh] shrink-0" />

      <section className="flex min-h-screen flex-col items-center px-6">
        {/*
          Placement du globe ROBUSTE à la hauteur d'écran.

          Problème résolu : le titre est `position: fixed` (ancré au viewport) et
          le contenu est en flux (ancré au scroll) → centrer le globe le rendait
          dépendant de la hauteur de viewport ET de la hauteur du groupe texte, si
          bien qu'à une taille d'écran différente (prod ≠ local) il remontait sous
          le titre.

          Solution : un spacer réserve la zone du titre mini (qui se fige autour
          de ~24-35vh après shrink), et le globe commence TOUJOURS juste en dessous,
          quelle que soit la hauteur d'écran. Le texte est poussé en bas (mt-auto).

          `h-[60vh]` est l'unique levier vertical : ↑ = globe plus bas, ↓ = plus haut.
        */}
        <div aria-hidden className="h-[60vh] shrink-0" />

        <div aria-hidden>
          <GlobeMount />
        </div>

        <div className="mt-auto flex w-full max-w-3xl flex-col items-center gap-7 pb-[9vh] text-center">
          <p
            className="max-w-xl text-[17px] font-medium leading-[1.55] text-white/85"
            style={{ fontFamily: "var(--font-jakarta)" }}
          >
            Organisez vos prochaines vacances en quelques minutes. Composez un
            voyage, comparez trois façons d&apos;arriver là-bas, puis choisissez
            la vôtre.
          </p>

          <Link
            href="/trip/new"
            className="inline-flex items-center gap-2.5 rounded-full bg-[#ff7a1a] px-6 py-3.5 text-[14px] font-semibold text-white shadow-[0_0_38px_-4px_rgba(255,122,26,0.55),0_14px_30px_-14px_rgba(255,122,26,0.7)] transition-[transform,background-color,box-shadow] duration-200 ease-out hover:scale-[1.02] hover:bg-[#ff8a30] hover:shadow-[0_0_52px_-2px_rgba(255,138,48,0.7),0_16px_34px_-14px_rgba(255,138,48,0.8)] active:scale-[0.98]"
            style={{ fontFamily: "var(--font-jakarta)" }}
          >
            <span>Nouveau voyage</span>
            <span aria-hidden className="text-base leading-none">
              →
            </span>
          </Link>
        </div>
      </section>

      <footer className="mx-auto flex w-full max-w-3xl flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] px-6 pb-10 pt-6 text-[12px] text-white/40">
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
    </main>
  );
}
