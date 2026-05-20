import Link from "next/link";

export type TopNavVariant = "light" | "dark";

type Props = {
  /** "light" = cream voyage-pivot (default, autres routes). "dark" = matte black (home redesign). */
  variant?: TopNavVariant;
};

/**
 * Top navigation sticky.
 *
 * Variantes :
 *  - `light` (default) = palette voyage-pivot cream — bg-background/82 backdrop-blur
 *  - `dark` = matte black coordonné avec la home redesign Split-Flap
 *    (Phase 1 du grand redesign). Subtle border, logo terracotta inchangé pour
 *    rester reconnaissable, texte warm-white #f6f6f4 sur fond #050505.
 *
 * Le variant est passé explicitement par la page (pas auto-détecté via usePathname)
 * pour rester un Server Component léger.
 */
export function TopNav({ variant = "light" }: Props = {}) {
  const isDark = variant === "dark";

  const headerClass = isDark
    ? "sticky top-0 z-30 w-full border-b border-white/[0.06] bg-[#050505]/92"
    : "sticky top-0 z-30 w-full border-b border-line bg-background/82 backdrop-blur-md backdrop-saturate-150";

  const wordmarkColor = isDark ? "text-[#f6f6f4]" : "text-ink";
  const captionColor = isDark ? "text-white/45" : "text-ink-mute";
  const linkColor = isDark
    ? "text-white/70 transition-colors duration-150 hover:text-[#f6f6f4]"
    : "text-ink-soft transition-colors duration-150 hover:text-ink";

  const ctaClass = isDark
    ? "inline-flex items-center gap-2 rounded-full bg-[var(--terracotta)] px-4 py-2 text-[13px] font-medium text-[oklch(0.99_0.005_80)] transition-transform duration-200 ease-out hover:scale-[1.02] active:scale-[0.98]"
    : "inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-[13px] font-medium text-[oklch(0.99_0.005_80)] transition-transform duration-200 ease-out hover:scale-[1.02] active:scale-[0.98]";

  return (
    <header className={headerClass}>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link
          href="/"
          className="group flex items-center gap-2.5"
          aria-label="SmartTraveler — retour à l'accueil"
        >
          <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-full bg-[oklch(0.62_0.155_38)] text-[13px] font-medium text-[oklch(0.99_0.005_80)]">
            <span aria-hidden style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}>
              S
            </span>
          </span>
          <span className="flex flex-col leading-none">
            <span
              className={`text-[15px] tracking-tight ${wordmarkColor}`}
              style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
            >
              SmartTraveler
            </span>
            <span className={`mt-0.5 text-[10px] tracking-[0.08em] ${captionColor}`}>
              voyages composés
            </span>
          </span>
        </Link>

        <nav aria-label="Navigation principale" className="hidden items-center gap-7 text-sm md:flex">
          <Link href="/" className={linkColor}>
            Vos itinéraires
          </Link>
          <Link href="/trip/new" className={linkColor}>
            Nouveau voyage
          </Link>
          <Link href="/" className={linkColor}>
            Inspirations
          </Link>
        </nav>

        <Link href="/trip/new" className={ctaClass}>
          <span>Composer un voyage</span>
          <span aria-hidden className="text-base leading-none">
            →
          </span>
        </Link>
      </div>
    </header>
  );
}
