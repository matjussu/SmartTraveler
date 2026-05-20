import Link from "next/link";

export function TopNav() {
  return (
    <header className="sticky top-0 z-40 px-6 pt-5 pb-3">
      <div className="mx-auto max-w-6xl flex items-center justify-between rounded-2xl glass px-5 py-2.5">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span
            aria-hidden
            className="relative inline-flex h-7 w-7 items-center justify-center rounded-full bg-aurora/20 ring-1 ring-aurora/40 text-aurora font-mono text-[11px] font-semibold"
          >
            ST
            <span className="absolute inset-0 rounded-full bg-aurora/30 blur-md -z-10" />
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-[15px] font-semibold tracking-tight text-frost">
              SmartTraveler
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-frost-3">
              Concorde
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className="px-3 py-1.5 rounded-full text-[13px] font-medium text-frost hover:bg-white/5 transition-colors"
          >
            Itinéraires
          </Link>
          <Link
            href="/trip/new"
            className="px-3 py-1.5 rounded-full text-[13px] text-frost-2 hover:text-frost hover:bg-white/5 transition-colors"
          >
            Nouveau voyage
          </Link>
          <Link
            href="#"
            className="px-3 py-1.5 rounded-full text-[13px] text-frost-2 hover:text-frost hover:bg-white/5 transition-colors"
          >
            Partages
          </Link>
          <span aria-hidden className="mx-1.5 h-4 w-px bg-white/10" />
          <Link
            href="/trip/new"
            className="ml-0.5 inline-flex items-center gap-1.5 rounded-full bg-frost px-3.5 py-1.5 text-[13px] font-semibold text-night hover:bg-white transition-colors"
          >
            <span aria-hidden>＋</span>
            Composer
          </Link>
        </nav>
      </div>
    </header>
  );
}
