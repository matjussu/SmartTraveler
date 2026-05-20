import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-rule/60 bg-paper/80 backdrop-blur-md sticky top-0 z-40">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-5">
        <Link href="/" className="flex items-baseline gap-3 group">
          <span
            aria-hidden
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border-[1.5px] border-ink text-ink font-display text-[15px] font-semibold leading-none"
          >
            S
          </span>
          <span className="flex items-baseline gap-2">
            <span className="font-display text-[19px] font-medium tracking-tight text-ink">
              SmartTraveler
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft pt-0.5">
              · Compass
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 text-[13px]">
          <Link
            href="/"
            className="px-3 py-1.5 font-medium text-ink hover:bg-paper-soft rounded-md transition-colors"
          >
            Carnet
          </Link>
          <Link
            href="/trip/new"
            className="px-3 py-1.5 text-ink-soft hover:text-ink hover:bg-paper-soft rounded-md transition-colors"
          >
            Nouveau voyage
          </Link>
          <span aria-hidden className="mx-2 h-4 w-px bg-rule/60" />
          <Link
            href="/trip/new"
            className="ml-1 inline-flex items-center gap-1.5 rounded-md bg-ink px-3.5 py-1.5 font-medium text-paper hover:bg-ink/90 transition-colors"
          >
            <span aria-hidden>+</span>
            Composer
          </Link>
        </nav>
      </div>
    </header>
  );
}
