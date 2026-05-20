import Link from "next/link";

export function AppShell({
  children,
  current = "trips",
}: {
  children: React.ReactNode;
  current?: "trips" | "new" | "compare";
}) {
  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr]">
      {/* Sidebar */}
      <aside className="border-r border-stroke-soft bg-bg-elev1/40 backdrop-blur-sm">
        <div className="sticky top-0 flex flex-col h-screen">
          {/* Logo */}
          <div className="px-5 py-5 border-b border-stroke-soft">
            <Link href="/" className="flex items-center gap-2.5 group">
              <span
                aria-hidden
                className="relative inline-flex h-7 w-7 items-center justify-center rounded-md bg-bg-elev3 border border-stroke text-ice font-mono text-[12px] font-semibold"
              >
                ST
                <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-ice shadow-[0_0_6px_1px_oklch(0.85_0.105_215_/_0.7)]" />
              </span>
              <div className="flex flex-col leading-none">
                <span className="text-[13px] font-semibold tracking-tight text-text-1">
                  SmartTraveler
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-3 mt-0.5">
                  Atlas Console
                </span>
              </div>
            </Link>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-0.5">
            <SectionLabel>Navigation</SectionLabel>
            <NavItem href="/" active={current === "trips"} icon="◆" badge="3">
              Itinéraires
            </NavItem>
            <NavItem href="/trip/new" active={current === "new"} icon="＋">
              Nouveau voyage
            </NavItem>
            <NavItem href="#" active={false} icon="≡">
              Contraintes
            </NavItem>

            <div className="h-3" />
            <SectionLabel>Données</SectionLabel>
            <NavItem href="#" active={false} icon="∑">
              Statistiques
            </NavItem>
            <NavItem href="#" active={false} icon="◐">
              Empreinte CO₂
            </NavItem>

            <div className="h-3" />
            <SectionLabel>Partage</SectionLabel>
            <NavItem href="#" active={false} icon="↗">
              Liens partagés
            </NavItem>
          </nav>

          {/* Footer status */}
          <div className="px-3 py-3 border-t border-stroke-soft mt-auto">
            <div className="flex items-center justify-between px-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-3">
                système
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-lime shadow-[0_0_6px_1px_oklch(0.85_0.16_130_/_0.7)]" />
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-2">
                  online
                </span>
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-col min-w-0">
        {/* Top bar */}
        <header className="border-b border-stroke-soft bg-bg-base/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center justify-between px-8 py-3.5">
            <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.14em] text-text-3">
              <span>console</span>
              <span aria-hidden>/</span>
              <span className="text-text-1">itineraires</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-text-3 tabular-nums">
                v0.1.0
              </span>
              <span aria-hidden className="h-3 w-px bg-stroke" />
              <button
                type="button"
                className="inline-flex items-center gap-1.5 h-7 rounded-md border border-stroke bg-bg-elev2 px-2.5 font-mono text-[11px] text-text-2 hover:text-text-1 hover:border-stroke transition-colors"
              >
                <span aria-hidden>⌘K</span>
                Recherche
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 h-7 rounded-md bg-ice px-3 font-medium text-[12px] text-bg-base hover:bg-ice/90 transition-colors"
              >
                <span aria-hidden>＋</span>
                Voyage
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 grid-bg">{children}</div>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-2 pb-1.5 pt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-text-3">
      {children}
    </div>
  );
}

function NavItem({
  href,
  active,
  icon,
  badge,
  children,
}: {
  href: string;
  active: boolean;
  icon: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`group flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] transition-colors ${
        active
          ? "bg-bg-elev2 text-text-1"
          : "text-text-2 hover:bg-bg-elev2/60 hover:text-text-1"
      }`}
    >
      <span
        aria-hidden
        className={`inline-flex w-4 justify-center font-mono text-[11px] ${
          active ? "text-ice" : "text-text-3 group-hover:text-text-2"
        }`}
      >
        {icon}
      </span>
      <span className="flex-1">{children}</span>
      {badge && (
        <span
          className={`inline-flex h-4 min-w-4 items-center justify-center rounded px-1 font-mono text-[10px] tabular-nums ${
            active
              ? "bg-ice/20 text-ice"
              : "bg-bg-elev2 text-text-3 group-hover:text-text-2"
          }`}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}
