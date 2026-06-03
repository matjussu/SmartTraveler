import { notFound } from "next/navigation";
import { getTripById } from "@/mocks/trips";
import { TopNav } from "@/components/voyage/top-nav";
import { SharedView } from "@/components/voyage/shared-view";

/**
 * /shared/[token] — vue lecture seule d'un voyage partagé.
 *
 * Convention mock : token === trip.id. Pas d'auth, pas de permissions —
 * accès public par convention (mock). `notFound()` si trip introuvable.
 *
 * Pas d'écriture côté store : le switcher d'alternatives dans <SharedView>
 * vit en useState local, jamais persisté.
 */
export default async function SharedTripPage(
  props: PageProps<"/shared/[token]">
) {
  const { token } = await props.params;
  const trip = getTripById(token);
  if (!trip) notFound();

  return (
    <>
      {/* Banner "lecture seule" — au-dessus du TopNav, ne modifie pas le composant partagé.
          Surface opaque bg-card + point gold discret, aucune transparence floutée. */}
      <div className="border-b border-line bg-card">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-2 px-8 py-2.5 text-[11px] uppercase tracking-[0.14em] text-ink-mute">
          <span
            aria-hidden
            className="inline-block h-1.5 w-1.5 rounded-full bg-[oklch(0.78_0.13_75)]"
          />
          <span>Voyage partagé · lecture seule</span>
        </div>
      </div>
      <TopNav />
      <SharedView trip={trip} />
    </>
  );
}
