import Link from "next/link";

export function TopNav() {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-line bg-background/82 backdrop-blur-md backdrop-saturate-150">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link
          href="/"
          className="group flex items-center gap-2.5 text-ink"
          aria-label="SmartTraveler — retour à l'accueil"
        >
          <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-full bg-[oklch(0.62_0.155_38)] text-[13px] font-medium text-[oklch(0.99_0.005_80)]">
            <span aria-hidden style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}>
              S
            </span>
          </span>
          <span className="flex flex-col leading-none">
            <span
              className="text-[15px] tracking-tight text-ink"
              style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
            >
              SmartTraveler
            </span>
            <span className="mt-0.5 text-[10px] tracking-[0.08em] text-ink-mute">
              voyages composés
            </span>
          </span>
        </Link>

        <nav aria-label="Navigation principale" className="hidden items-center gap-7 text-sm md:flex">
          <Link
            href="/"
            className="text-ink-soft transition-colors duration-150 hover:text-ink"
          >
            Vos itinéraires
          </Link>
          <Link
            href="/trip/new"
            className="text-ink-soft transition-colors duration-150 hover:text-ink"
          >
            Nouveau voyage
          </Link>
          <Link
            href="/"
            className="text-ink-soft transition-colors duration-150 hover:text-ink"
          >
            Inspirations
          </Link>
        </nav>

        <Link
          href="/trip/new"
          className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-[13px] font-medium text-[oklch(0.99_0.005_80)] transition-transform duration-200 ease-out hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>Composer un voyage</span>
          <span aria-hidden className="text-base leading-none">
            →
          </span>
        </Link>
      </div>
    </header>
  );
}
