import Link from "next/link";
import { notFound } from "next/navigation";

import { TopNav } from "@/components/voyage/top-nav";
import { getTripById } from "@/mocks/trips";
import {
  formatDateLong,
  tripDurationDays,
} from "@/lib/format";

/**
 * /trip/[id]/recap — récapitulatif pré-calcul.
 *
 * Étape charnière de la cascade : entre la composition (new → destinations →
 * constraints) et le résultat (result avec ses 3 alternatives). Server
 * component pur, lecture seule sur les MOCK_TRIPS — pas de toggle, donc pas
 * de hydration gate Zustand nécessaire ici. Quand on branchera un vrai
 * backend, on lira via fetch côté server.
 *
 * Pattern visuel hérité du pilote :
 *  - TopNav sticky + breadcrumb + hero éditorial 12-col
 *  - Sections empilées en col-span-8 + aside sticky col-span-4
 *  - CTA principal italique terracotta plein, hauteur 56px (extra-prominent
 *    par rapport aux 48px standards des autres CTAs cascade — c'est *le*
 *    moment où le voyage bascule en calcul)
 *
 * Choix design notables :
 *  - La carte visuelle est volontairement remplacée par une vignette
 *    chaleureuse "À calculer" plutôt qu'une vraie <TripMap /> : on ne ment
 *    pas avec un tracé d'itinéraire qui n'existe pas encore. La carte vient
 *    après le calcul, dans /result.
 *  - Le statut "Déjà calculé" propose une nuance : si trip.status ===
 *    "computed", l'utilisateur peut soit recalculer (le CTA reste), soit
 *    aller directement voir le résultat existant (lien secondaire).
 *  - L'aside terracotta-soft assume sa différence avec la DraftPreview du
 *    pilote (boarding-ticket cream) : ici on n'esquisse plus, on engage.
 */

export default async function TripRecapPage(
  props: PageProps<"/trip/[id]/recap">
) {
  const { id } = await props.params;
  const trip = getTripById(id);
  if (!trip) notFound();

  const days = tripDurationDays(trip.startDate, trip.endDate);
  const destinations = trip.destinations;
  const stops = destinations.length;

  // Complétude — au moins 2 destinations ET des dates valides ET une ville
  // de départ. Si incomplet, on garde le CTA visible mais désactivé,
  // avec un helper qui pointe exactement ce qui manque.
  const missing: string[] = [];
  if (stops < 2) missing.push("Au moins deux destinations");
  if (!trip.startDate || !trip.endDate) missing.push("Une fenêtre de dates");
  if (!trip.startCity?.name) missing.push("Une ville de départ");
  const isComplete = missing.length === 0;

  const alreadyComputed = trip.status === "computed";

  return (
    <>
      <TopNav />
      <main className="mx-auto w-full max-w-6xl px-6 pt-10 pb-24 lg:px-8 lg:pt-12">
        {/* Breadcrumb */}
        <nav
          aria-label="Fil d'ariane"
          className="mb-8 flex items-center gap-3 text-[11px] uppercase tracking-[0.14em] text-ink-mute"
        >
          <Link href="/" className="transition-colors hover:text-ink-soft">
            Vos itinéraires
          </Link>
          <span aria-hidden>·</span>
          <span className="text-ink-soft">{trip.name}</span>
          <span aria-hidden>·</span>
          <span className="text-ink">Récapitulatif</span>
        </nav>

        {/* Hero éditorial */}
        <section className="mb-12">
          <div className="mb-4 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-ink-mute">
            <span
              aria-hidden
              className={`inline-block h-1.5 w-1.5 rounded-full ${
                alreadyComputed
                  ? "bg-[oklch(0.55_0.078_145)]"
                  : "bg-[oklch(0.78_0.13_75)]"
              }`}
            />
            <span>
              {alreadyComputed ? "Déjà calculé" : "En cours de composition"}
            </span>
          </div>
          <h1
            className="text-[clamp(40px,6vw,68px)] leading-[0.98] tracking-[-0.015em] text-ink"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Un dernier{" "}
            <span
              style={{ fontStyle: "italic" }}
              className="text-[oklch(0.42_0.13_35)]"
            >
              coup d&apos;œil.
            </span>
          </h1>
          <p
            className="mt-5 max-w-xl text-[16px] leading-[1.55] text-ink-soft"
            style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
          >
            Vérifiez les éléments. SmartTraveler peut maintenant composer les
            meilleurs itinéraires.
          </p>
        </section>

        {/* Layout 12-col : récap sections (8) / aside CTA (4) */}
        <div className="grid grid-cols-12 gap-8">
          {/* ====================================================== */}
          {/* COLONNE PRINCIPALE — sections récap                    */}
          {/* ====================================================== */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* Section "Le voyage" ----------------------------------- */}
            <section
              aria-labelledby="recap-voyage"
              className="rounded-[18px] border border-line bg-surface px-7 py-6"
            >
              <h2
                id="recap-voyage"
                className="text-[22px] leading-tight text-ink"
                style={{
                  fontFamily: "var(--font-display)",
                  fontStyle: "italic",
                }}
              >
                Le voyage
              </h2>
              <dl className="mt-5 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                <RecapField label="Nom" value={trip.name} />
                <RecapField
                  label="Départ"
                  value={`${trip.startCity.name}, ${trip.startCity.country}`}
                />
                <RecapField
                  label="Fenêtre"
                  value={
                    trip.startDate && trip.endDate
                      ? `du ${formatDateLong(trip.startDate)} au ${formatDateLong(
                          trip.endDate
                        )}`
                      : "À renseigner"
                  }
                />
                <RecapField
                  label="Durée"
                  value={
                    trip.startDate && trip.endDate
                      ? `${days} jours`
                      : "—"
                  }
                  mono
                />
              </dl>
            </section>

            {/* Section "Les villes" ---------------------------------- */}
            <section
              aria-labelledby="recap-villes"
              className="rounded-[18px] border border-line bg-surface px-7 py-6"
            >
              <div className="flex items-baseline justify-between gap-3">
                <h2
                  id="recap-villes"
                  className="text-[22px] leading-tight text-ink"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontStyle: "italic",
                  }}
                >
                  Les villes
                </h2>
                <span className="text-[11px] uppercase tracking-[0.12em] text-ink-mute">
                  {stops} étape{stops > 1 ? "s" : ""}
                </span>
              </div>

              {stops === 0 ? (
                <p
                  className="mt-5 text-[14px] text-ink-mute"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontStyle: "italic",
                  }}
                >
                  Aucune destination ajoutée pour l&apos;instant.
                </p>
              ) : (
                <ol className="mt-5 space-y-3">
                  {destinations.map((dest, idx) => {
                    // Pour le mock : pas de contraintes persistées dans le
                    // schéma Trip. On affiche un badge "souple" par défaut,
                    // sauf si le rang dans la liste signale visuellement la
                    // première / dernière (mais on garde "souple" car c'est
                    // l'utilisateur qui décide en /constraints).
                    return (
                      <li
                        key={dest.id}
                        className="flex items-center gap-4 rounded-[12px] border border-line/70 bg-card px-4 py-3"
                      >
                        <span
                          className="inline-flex h-7 w-9 shrink-0 items-center justify-center rounded text-[11px] tracking-[0.06em] text-ink-soft"
                          style={{
                            fontFamily: "var(--font-mono)",
                            background: "oklch(0.94 0.018 75)",
                          }}
                        >
                          {cityCode(dest.city.name)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div
                            className="text-[16px] leading-tight text-ink"
                            style={{
                              fontFamily: "var(--font-display)",
                              fontStyle: "italic",
                            }}
                          >
                            {dest.city.name}
                          </div>
                          <div className="mt-0.5 text-[12px] text-ink-mute">
                            {dest.city.country}
                            <span aria-hidden> · </span>
                            <span>
                              {dest.nights} nuit{dest.nights > 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>
                        <DestinationBadge
                          kind={badgeKindFor(idx, destinations.length)}
                        />
                      </li>
                    );
                  })}
                </ol>
              )}
            </section>

            {/* Section "Carte visuelle" ------------------------------ */}
            <section
              aria-labelledby="recap-carte"
              className="rounded-[18px] border border-line bg-surface px-7 py-6"
            >
              <h2
                id="recap-carte"
                className="text-[22px] leading-tight text-ink"
                style={{
                  fontFamily: "var(--font-display)",
                  fontStyle: "italic",
                }}
              >
                La carte
              </h2>
              <p
                className="mt-2 text-[13px] text-ink-mute"
                style={{
                  fontFamily: "var(--font-display)",
                  fontStyle: "italic",
                }}
              >
                La carte apparaîtra après le calcul.
              </p>

              <div
                className="mt-5 relative overflow-hidden rounded-[14px] border border-dashed border-line-strong bg-[oklch(0.95_0.012_80)]"
                style={{ minHeight: 220 }}
                role="img"
                aria-label="Aperçu schématique de l'itinéraire à venir"
              >
                {/* Vignette schématique chaleureuse : codes 3 lettres alignés
                    sur une ligne pointillée — pas une vraie carte, juste
                    une promesse visuelle de ce qui suivra. */}
                <div className="absolute inset-0 flex flex-col items-center justify-center px-6 py-8">
                  {stops > 0 ? (
                    <div className="flex flex-wrap items-baseline justify-center gap-x-3 gap-y-2">
                      <CityChip code={cityCode(trip.startCity.name)} muted />
                      <RouteDot />
                      {destinations.map((d, i) => (
                        <span
                          key={d.id}
                          className="flex items-baseline gap-3"
                        >
                          <CityChip code={cityCode(d.city.name)} muted />
                          {i < destinations.length - 1 && <RouteDot />}
                        </span>
                      ))}
                      <RouteDot />
                      <CityChip code={cityCode(trip.startCity.name)} muted />
                    </div>
                  ) : (
                    <p
                      className="text-[14px] text-ink-mute"
                      style={{
                        fontFamily: "var(--font-display)",
                        fontStyle: "italic",
                      }}
                    >
                      Ajoutez quelques villes pour voir l&apos;esquisse.
                    </p>
                  )}
                  <p
                    className="mt-6 text-[11px] uppercase tracking-[0.14em] text-ink-mute"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    À calculer
                  </p>
                </div>
              </div>
            </section>

            {/* Section "Ce que SmartTraveler va optimiser" ----------- */}
            <section
              aria-labelledby="recap-optim"
              className="rounded-[18px] border border-[oklch(0.85_0.07_45)] bg-[oklch(0.96_0.025_55)] px-7 py-6"
            >
              <div className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="inline-block h-1 w-6 bg-[oklch(0.62_0.155_38)]"
                />
                <span className="text-[11px] uppercase tracking-[0.14em] text-[oklch(0.42_0.13_35)]">
                  À calculer
                </span>
              </div>
              <h2
                id="recap-optim"
                className="mt-3 text-[24px] leading-[1.15] text-ink"
                style={{
                  fontFamily: "var(--font-display)",
                  fontStyle: "italic",
                }}
              >
                Ce que SmartTraveler va optimiser
              </h2>

              <ul className="mt-5 space-y-3">
                {OPTIMIZER_PROMISES.map((promise) => (
                  <li
                    key={promise}
                    className="flex items-start gap-3 text-[14.5px] leading-[1.5] text-ink-soft"
                  >
                    <span
                      aria-hidden
                      className="mt-[8px] inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[oklch(0.62_0.155_38)]"
                    />
                    <span>{promise}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* ====================================================== */}
          {/* ASIDE — CTA card sticky                                */}
          {/* ====================================================== */}
          <div className="col-span-12 lg:col-span-4">
            <div className="lg:sticky lg:top-24">
              <aside
                aria-label="Lancer le calcul du voyage"
                className="overflow-hidden rounded-[20px] border border-[oklch(0.85_0.07_45)] bg-[oklch(0.94_0.04_52)]"
                style={{
                  boxShadow:
                    "0 1px 0 0 oklch(1 0 0 / 0.6), 0 12px 28px -18px oklch(0.42 0.13 35 / 0.25)",
                }}
              >
                {/* Mini-stat hero */}
                <div className="px-6 pt-6 pb-4">
                  <div className="text-[10px] uppercase tracking-[0.14em] text-[oklch(0.42_0.13_35)]">
                    Votre voyage
                  </div>
                  <div className="mt-2 flex items-baseline gap-3">
                    <span
                      className="text-[38px] leading-none tracking-tight text-ink tabular-nums"
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontWeight: 500,
                      }}
                    >
                      {stops}
                    </span>
                    <span
                      className="text-[15px] text-ink-soft"
                      style={{
                        fontFamily: "var(--font-display)",
                        fontStyle: "italic",
                      }}
                    >
                      ville{stops > 1 ? "s" : ""}
                    </span>
                    <span aria-hidden className="text-ink-mute">
                      ·
                    </span>
                    <span
                      className="text-[20px] leading-none tracking-tight text-ink tabular-nums"
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontWeight: 500,
                      }}
                    >
                      {trip.startDate && trip.endDate ? days : "—"}
                    </span>
                    <span
                      className="text-[15px] text-ink-soft"
                      style={{
                        fontFamily: "var(--font-display)",
                        fontStyle: "italic",
                      }}
                    >
                      jours
                    </span>
                  </div>
                </div>

                {/* Perforation chaleureuse */}
                <div
                  aria-hidden
                  className="mx-6"
                  style={{
                    height: 1,
                    backgroundImage:
                      "linear-gradient(to right, oklch(0.78 0.07 55) 0, oklch(0.78 0.07 55) 5px, transparent 5px, transparent 10px)",
                    backgroundSize: "10px 1px",
                    backgroundRepeat: "repeat-x",
                  }}
                />

                {/* CTA principal */}
                <div className="px-6 pt-5 pb-6">
                  {!isComplete && (
                    <div className="mb-4 rounded-[12px] border border-[oklch(0.82_0.08_55)] bg-[oklch(0.97_0.02_60)] px-4 py-3">
                      <div
                        className="text-[13.5px] text-ink"
                        style={{
                          fontFamily: "var(--font-display)",
                          fontStyle: "italic",
                        }}
                      >
                        Quelques détails manquent encore.
                      </div>
                      <ul className="mt-2 space-y-1.5">
                        {missing.map((m) => (
                          <li
                            key={m}
                            className="flex items-start gap-2 text-[12.5px] text-ink-soft"
                          >
                            <span
                              aria-hidden
                              className="mt-[7px] inline-block h-1 w-1 shrink-0 rounded-full bg-[oklch(0.62_0.155_38)]"
                            />
                            <span>{m}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {isComplete ? (
                    <Link
                      href={`/trip/${trip.id}/result`}
                      className={[
                        "group inline-flex w-full items-center justify-center gap-2 rounded-full",
                        "h-14 px-6 text-[16px]",
                        "bg-[oklch(0.62_0.155_38)] text-[oklch(0.99_0.005_80)]",
                        "shadow-[0_14px_28px_-14px_oklch(0.42_0.13_35_/_0.55)]",
                        "transition-[transform,box-shadow] duration-200 ease-out",
                        "hover:scale-[1.015] hover:shadow-[0_18px_36px_-14px_oklch(0.42_0.13_35_/_0.6)]",
                        "active:scale-[0.985]",
                      ].join(" ")}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-display)",
                          fontStyle: "italic",
                        }}
                      >
                        Calculer mon voyage
                      </span>
                      <span
                        aria-hidden
                        className="text-[18px] leading-none transition-transform duration-200 ease-out group-hover:translate-x-0.5"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        →
                      </span>
                    </Link>
                  ) : (
                    <button
                      type="button"
                      disabled
                      aria-disabled="true"
                      className={[
                        "inline-flex w-full items-center justify-center gap-2 rounded-full",
                        "h-14 px-6 text-[16px]",
                        "bg-[oklch(0.62_0.155_38)] text-[oklch(0.99_0.005_80)]",
                        "cursor-not-allowed opacity-50 shadow-none",
                      ].join(" ")}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-display)",
                          fontStyle: "italic",
                        }}
                      >
                        Calculer mon voyage
                      </span>
                      <span
                        aria-hidden
                        className="text-[18px] leading-none"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        →
                      </span>
                    </button>
                  )}

                  <p
                    className="mt-3 text-center text-[12px] text-ink-mute"
                    style={{
                      fontFamily: "var(--font-display)",
                      fontStyle: "italic",
                    }}
                  >
                    Cela prend quelques secondes. Vous pourrez ajuster après.
                  </p>

                  <div className="mt-5 flex flex-col items-center gap-2 border-t border-[oklch(0.85_0.07_45)] pt-4">
                    <Link
                      href={`/trip/${trip.id}/edit`}
                      className="text-[13px] text-ink-soft underline decoration-[oklch(0.78_0.13_75)] decoration-2 underline-offset-4 transition-colors hover:text-ink"
                    >
                      Modifier d&apos;abord
                    </Link>
                    {alreadyComputed && (
                      <Link
                        href={`/trip/${trip.id}/result`}
                        className="text-[12px] text-ink-mute transition-colors hover:text-ink-soft"
                      >
                        Voir le résultat déjà calculé
                      </Link>
                    )}
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>

        {/* Footer ---------------------------------------------------- */}
        <footer className="mt-20 flex flex-wrap items-center justify-between gap-3 text-[12px] text-ink-mute">
          <div className="flex items-center gap-2">
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontStyle: "italic",
              }}
              className="text-[15px] text-ink-soft"
            >
              SmartTraveler
            </span>
            <span aria-hidden>·</span>
            <span>Compose, compare, choisis.</span>
          </div>
          <div>© 2026 — voyages composés avec soin.</div>
        </footer>
      </main>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Helpers locaux                                                              */
/* -------------------------------------------------------------------------- */

const OPTIMIZER_PROMISES = [
  "Trois itinéraires alternatifs (économique / rapide / sobre)",
  "Coût total, durée totale, empreinte carbone par alternative",
  "Ordre optimal des destinations (sauf si vous l'avez fixé)",
  "Carte interactive avec étapes",
];

/** Mini-mapping local cohérent avec ce qui existe dans boarding-ticket et
 * cities-mock. On reste local plutôt que d'importer `cityCode()` de
 * cities-mock pour ne pas créer de dépendance sur un fichier qui pourrait
 * évoluer côté autocomplete. */
function cityCode(name: string | undefined): string {
  if (!name) return "?";
  const map: Record<string, string> = {
    Paris: "PAR",
    Rome: "ROM",
    Barcelone: "BCN",
    Lyon: "LYS",
    Berlin: "BER",
    Prague: "PRG",
    Marseille: "MRS",
    Amsterdam: "AMS",
    Copenhague: "CPH",
    Bordeaux: "BOD",
    Toulouse: "TLS",
    Nantes: "NTE",
  };
  return map[name] ?? name.slice(0, 3).toUpperCase();
}

/**
 * Pour le mock : on n'a pas de constraints persistées dans Trip — donc
 * tout est "souple" par défaut. La signature reste prête à évoluer si
 * Matteo décide plus tard de persister DestinationConstraint dans Trip.
 */
type BadgeKind = "souple";
function badgeKindFor(_idx: number, _total: number): BadgeKind {
  return "souple";
}

function DestinationBadge({ kind }: { kind: BadgeKind }) {
  // Le mapping reste prêt à accueillir "première" / "dernière" plus tard.
  const styles: Record<
    "souple" | "première" | "dernière",
    { bg: string; ink: string; border: string }
  > = {
    souple: {
      bg: "oklch(0.94 0.018 75)",
      ink: "oklch(0.48 0.025 48)",
      border: "oklch(0.85 0.024 70)",
    },
    première: {
      bg: "oklch(0.93 0.045 50)",
      ink: "oklch(0.42 0.13 35)",
      border: "oklch(0.85 0.07 45)",
    },
    dernière: {
      bg: "oklch(0.94 0.025 230)",
      ink: "oklch(0.38 0.11 240)",
      border: "oklch(0.86 0.045 232)",
    },
  };
  const s = styles[kind];
  return (
    <span
      className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10.5px] uppercase tracking-[0.1em]"
      style={{
        background: s.bg,
        color: s.ink,
        borderColor: s.border,
      }}
    >
      {kind}
    </span>
  );
}

function RecapField({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-[0.14em] text-ink-mute">
        {label}
      </dt>
      <dd
        className={`mt-1 text-[15px] leading-snug text-ink ${
          mono ? "tabular-nums" : ""
        }`}
        style={
          mono
            ? { fontFamily: "var(--font-mono)" }
            : {
                fontFamily: "var(--font-display)",
                fontStyle: value === "—" || value === "À renseigner"
                  ? "italic"
                  : "normal",
                color:
                  value === "—" || value === "À renseigner"
                    ? "var(--ink-mute)"
                    : "var(--ink)",
              }
        }
      >
        {value}
      </dd>
    </div>
  );
}

function CityChip({ code, muted = false }: { code: string; muted?: boolean }) {
  return (
    <span
      className={`text-[20px] tracking-[0.04em] ${
        muted ? "text-ink-soft" : "text-ink"
      }`}
      style={{ fontFamily: "var(--font-mono)", fontWeight: 500 }}
    >
      {code}
    </span>
  );
}

function RouteDot() {
  return (
    <span
      aria-hidden
      className="inline-block h-[1px] w-7 text-ink-mute route-line"
    />
  );
}
