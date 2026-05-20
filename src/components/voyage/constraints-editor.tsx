"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { TopNav } from "@/components/voyage/top-nav";
import { FormField, inputClass } from "@/components/voyage/form-field";
import { DraftPreview } from "@/components/voyage/draft-preview";
import { useTripStore } from "@/store/trip-store";
import {
  buildInitialConstraints,
  countConstraints,
  hasNoStrictConstraints,
  type DestinationConstraint,
  type DestinationPin,
  type TripConstraints,
} from "@/lib/constraints";

/**
 * /trip/[id]/constraints — éditeur de contraintes voyage-pivot.
 *
 * Étape 3 sur 3 de la cascade. L'utilisateur peut :
 *  - fixer l'ordre des destinations (ou laisser SmartTraveler optimiser)
 *  - poser des dates d'arrivée/départ par ville (toutes optionnelles)
 *  - épingler une ville en première étape OU dernière étape (max 1 de chaque)
 *
 * Toutes les contraintes sont optionnelles : le CTA "Voir le récapitulatif"
 * est toujours actif. Si rien n'est posé, on affiche un empty state chaleureux
 * "Aucune contrainte stricte — SmartTraveler aura les coudées franches".
 *
 * Stockage : state local React (les contraintes ne sont pas persistées dans
 * le store Zustand pour ce mock — c'est volontaire, le schéma Trip central
 * reste inchangé).
 */

type Props = { tripId: string };

const FOOTER_NOTE = "© 2026 — voyages composés avec soin.";

export function ConstraintsEditor({ tripId }: Props) {
  const hydrated = useTripStore((s) => s.hydrated);
  const trip = useTripStore((s) => s.getTrip(tripId));

  // ---- Hydratation gate ----
  if (!hydrated) {
    return (
      <>
        <TopNav />
        <main
          className="mx-auto w-full max-w-6xl px-6 pt-10 pb-24"
          aria-busy="true"
        >
          <p
            className="text-[14px] text-ink-mute"
            style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
          >
            Chargement de votre voyage…
          </p>
        </main>
      </>
    );
  }

  // ---- Trip absent OU sans destinations ----
  if (!trip) {
    return (
      <>
        <TopNav />
        <main className="mx-auto w-full max-w-3xl px-6 pt-20 pb-24 text-center">
          <h1
            className="text-[36px] leading-[1.05] text-ink"
            style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
          >
            Voyage introuvable.
          </h1>
          <p
            className="mt-4 text-[15px] text-ink-soft"
            style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
          >
            Ce voyage n&apos;existe plus, ou n&apos;a jamais existé.
          </p>
          <Link
            href="/trip/new"
            className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-[oklch(0.62_0.155_38)] px-6 text-[14px] font-medium text-[oklch(0.99_0.005_80)]"
          >
            <span>Composer un voyage</span>
            <span aria-hidden>→</span>
          </Link>
        </main>
      </>
    );
  }

  if (trip.destinations.length === 0) {
    return (
      <>
        <TopNav />
        <main className="mx-auto w-full max-w-3xl px-6 pt-20 pb-24 text-center">
          <h1
            className="text-[36px] leading-[1.05] text-ink"
            style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
          >
            Définissez d&apos;abord vos destinations.
          </h1>
          <p
            className="mt-4 text-[15px] text-ink-soft"
            style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
          >
            Les contraintes se posent ville par ville — il faut donc des villes
            avant tout.
          </p>
          <Link
            href={`/trip/${tripId}/destinations`}
            className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-[oklch(0.62_0.155_38)] px-6 text-[14px] font-medium text-[oklch(0.99_0.005_80)] transition-transform duration-200 ease-out hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Revenir aux destinations</span>
            <span aria-hidden className="text-base leading-none">
              →
            </span>
          </Link>
        </main>
      </>
    );
  }

  // Trip valide + destinations présentes → éditeur complet.
  return <ConstraintsEditorBody trip={trip} />;
}

/* -------------------------------------------------------------------------- */
/*  Corps de l'éditeur (séparé pour éviter le useState avant les guards)      */
/* -------------------------------------------------------------------------- */

function ConstraintsEditorBody({
  trip,
}: {
  trip: NonNullable<ReturnType<typeof useTripStore.getState>["trips"][number]>;
}) {
  const destinationIds = useMemo(
    () => trip.destinations.map((d) => d.id),
    [trip.destinations]
  );

  const [constraints, setConstraints] = useState<TripConstraints>(() =>
    buildInitialConstraints(destinationIds)
  );

  // Min/Max sur les <input type="date"> = bornes du voyage.
  const tripMin = trip.startDate;
  const tripMax = trip.endDate;

  /* ----- Helpers de mutation ----- */

  const setStrictOrder = (v: boolean) =>
    setConstraints((c) => ({ ...c, strictOrder: v }));

  const updateDest = (
    destId: string,
    patch: Partial<DestinationConstraint>
  ) => {
    setConstraints((c) => ({
      ...c,
      perDestination: c.perDestination.map((d) =>
        d.destinationId === destId ? { ...d, ...patch } : d
      ),
    }));
  };

  /**
   * Toggle "pinned" avec garde d'unicité :
   *  - max 1 destination "first"
   *  - max 1 destination "last"
   *  - cliquer le pin déjà actif → repasse en "souple" (null)
   *  - choisir "first" sur une autre ville pendant qu'une autre est déjà
   *    "first" → libère l'ancienne (passe en null).
   */
  const setPin = (destId: string, next: DestinationPin) => {
    setConstraints((c) => ({
      ...c,
      perDestination: c.perDestination.map((d) => {
        if (d.destinationId === destId) {
          return { ...d, pinned: next };
        }
        // Si on attribue first/last à une autre, on dé-pin celles qui le
        // portaient déjà (unicité).
        if (next && d.pinned === next) {
          return { ...d, pinned: null };
        }
        return d;
      }),
    }));
  };

  /* ----- Dérivés pour rendu ----- */

  const noStrict = hasNoStrictConstraints(constraints);
  const nbConstraints = countConstraints(constraints);

  const previewDestinations = useMemo(
    () => trip.destinations.map((d) => ({ name: d.city.name })),
    [trip.destinations]
  );

  return (
    <>
      <TopNav />
      <main className="mx-auto w-full max-w-6xl px-6 pt-10 pb-24">
        {/* Fil d'ariane / progression */}
        <nav
          aria-label="Étapes de composition"
          className="mb-8 flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.14em] text-ink-mute"
        >
          <Link href="/" className="transition-colors hover:text-ink-soft">
            Vos itinéraires
          </Link>
          <span aria-hidden>·</span>
          <Link
            href="/trip/new"
            className="transition-colors hover:text-ink-soft"
          >
            Nouveau voyage
          </Link>
          <span aria-hidden>·</span>
          <Link
            href={`/trip/${trip.id}/destinations`}
            className="transition-colors hover:text-ink-soft"
          >
            Destinations
          </Link>
          <span aria-hidden>·</span>
          <span className="text-ink">Contraintes</span>
        </nav>

        {/* Hero éditorial */}
        <section className="mb-12">
          <div className="mb-4 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-ink-mute">
            <span
              aria-hidden
              className="inline-block h-1 w-6 bg-[oklch(0.62_0.155_38)]"
            />
            <span>Étape 3 sur 3</span>
          </div>
          <h1
            className="text-[clamp(40px,6vw,68px)] leading-[0.98] tracking-[-0.015em] text-ink"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Vos{" "}
            <span
              style={{ fontStyle: "italic" }}
              className="text-[oklch(0.42_0.13_35)]"
            >
              contraintes
            </span>
            , vos envies.
          </h1>
          <p
            className="mt-5 max-w-xl text-[16px] leading-[1.55] text-ink-soft"
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
            }}
          >
            Bloquez les dates qui comptent, libérez les autres. SmartTraveler
            optimisera autour.
          </p>
        </section>

        {/* Layout 12-col : form 8 / preview 4 */}
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-8 space-y-10">
            {/* === Section ordre === */}
            <OrderSection
              strictOrder={constraints.strictOrder}
              onChange={setStrictOrder}
            />

            {/* === Section contraintes par ville === */}
            <PerCitySection
              trip={trip}
              constraints={constraints}
              tripMin={tripMin}
              tripMax={tripMax}
              onUpdate={updateDest}
              onPin={setPin}
            />

            {/* === Empty state si zéro contrainte stricte === */}
            {noStrict && <NoConstraintCard />}

            {/* === CTA bas de form === */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
              <Link
                href={`/trip/${trip.id}/destinations`}
                className="text-[14px] text-ink-soft underline decoration-[oklch(0.78_0.13_75)] decoration-2 underline-offset-4 transition-colors hover:text-ink"
              >
                ← Retour aux destinations
              </Link>

              <Link
                href={`/trip/${trip.id}/recap`}
                className={[
                  "inline-flex h-12 items-center gap-2 rounded-full px-6 text-[14px] font-medium",
                  "bg-[oklch(0.62_0.155_38)] text-[oklch(0.99_0.005_80)]",
                  "shadow-[0_10px_22px_-12px_oklch(0.42_0.13_35_/_0.5)]",
                  "transition-transform duration-200 ease-out",
                  "hover:scale-[1.02] active:scale-[0.98]",
                ].join(" ")}
              >
                <span>Voir le récapitulatif</span>
                <span
                  aria-hidden
                  className="text-base leading-none"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  →
                </span>
              </Link>
            </div>
          </div>

          {/* Preview sticky col-span-4 */}
          <div className="col-span-12 lg:col-span-4">
            <div className="lg:sticky lg:top-24">
              <DraftPreview
                name={trip.name}
                startCity={trip.startCity.name}
                startDate={trip.startDate}
                endDate={trip.endDate}
                destinations={previewDestinations}
                badge="Contraintes"
                emptyHint="Vos choix se reflètent ici."
              />
              <p
                className="mt-4 px-2 text-[12px] text-ink-mute"
                style={{
                  fontFamily: "var(--font-display)",
                  fontStyle: "italic",
                }}
              >
                {nbConstraints === 0
                  ? "Aucune contrainte posée — SmartTraveler optimisera librement."
                  : `${nbConstraints} contrainte${nbConstraints > 1 ? "s" : ""} posée${nbConstraints > 1 ? "s" : ""}.`}
              </p>
            </div>
          </div>
        </div>

        <footer className="mt-20 flex flex-wrap items-center justify-between gap-3 text-[12px] text-ink-mute">
          <div className="flex items-center gap-2">
            <span
              style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
              className="text-[15px] text-ink-soft"
            >
              SmartTraveler
            </span>
            <span aria-hidden>·</span>
            <span>Compose, compare, choisis.</span>
          </div>
          <div>{FOOTER_NOTE}</div>
        </footer>
      </main>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Section ordre — radio cards "fixe" vs "optimisé"                          */
/* -------------------------------------------------------------------------- */

function OrderSection({
  strictOrder,
  onChange,
}: {
  strictOrder: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <section
      aria-labelledby="order-heading"
      className="rounded-2xl border border-line bg-card p-6"
    >
      <h2
        id="order-heading"
        className="text-[22px] leading-[1.15] text-ink"
        style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
      >
        Voulez-vous fixer l&apos;ordre&nbsp;?
      </h2>
      <p
        className="mt-2 text-[13px] text-ink-mute"
        style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
      >
        L&apos;optimisation peut réordonner les villes pour gagner en
        coût/temps.
      </p>

      <div
        role="radiogroup"
        aria-labelledby="order-heading"
        className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2"
      >
        <OrderCard
          checked={strictOrder}
          onSelect={() => onChange(true)}
          title="Suivre l’ordre saisi"
          desc="L'ordre de votre liste de destinations sera respecté."
        />
        <OrderCard
          checked={!strictOrder}
          onSelect={() => onChange(false)}
          title="Laisser SmartTraveler optimiser"
          desc="Le moteur réordonne les étapes pour un trajet plus fluide."
        />
      </div>
    </section>
  );
}

function OrderCard({
  checked,
  onSelect,
  title,
  desc,
}: {
  checked: boolean;
  onSelect: () => void;
  title: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={onSelect}
      className={[
        "group relative flex flex-col items-start gap-1.5 rounded-xl border p-4 text-left",
        "transition-[border-color,background-color,box-shadow,transform] duration-180 ease-out",
        "active:scale-[0.99]",
        checked
          ? "border-[oklch(0.62_0.155_38)] bg-[oklch(0.93_0.045_50_/_0.55)] shadow-[0_0_0_3px_oklch(0.62_0.155_38_/_0.14)]"
          : "border-line bg-surface hover:border-line-strong",
      ].join(" ")}
    >
      <span className="flex w-full items-center justify-between gap-3">
        <span
          className="text-[15px] text-ink"
          style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
        >
          {title}
        </span>
        <span
          aria-hidden
          className={[
            "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
            "transition-[background-color,border-color] duration-180 ease-out",
            checked
              ? "border-[oklch(0.62_0.155_38)] bg-[oklch(0.62_0.155_38)]"
              : "border-line-strong bg-surface group-hover:border-ink-mute",
          ].join(" ")}
        >
          {checked && (
            <span className="block h-2 w-2 rounded-full bg-[oklch(0.99_0.005_80)]" />
          )}
        </span>
      </span>
      <span className="text-[12.5px] text-ink-mute">{desc}</span>
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*  Section contraintes par ville                                             */
/* -------------------------------------------------------------------------- */

function PerCitySection({
  trip,
  constraints,
  tripMin,
  tripMax,
  onUpdate,
  onPin,
}: {
  trip: NonNullable<ReturnType<typeof useTripStore.getState>["trips"][number]>;
  constraints: TripConstraints;
  tripMin: string;
  tripMax: string;
  onUpdate: (id: string, patch: Partial<DestinationConstraint>) => void;
  onPin: (id: string, next: DestinationPin) => void;
}) {
  return (
    <section aria-labelledby="cities-heading" className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h2
          id="cities-heading"
          className="text-[22px] leading-[1.15] text-ink"
          style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
        >
          Contraintes par ville
        </h2>
        <span
          className="text-[11px] uppercase tracking-[0.14em] text-ink-mute"
          style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
        >
          {trip.destinations.length} étape
          {trip.destinations.length > 1 ? "s" : ""}
        </span>
      </div>

      <ul className="space-y-4">
        {trip.destinations.map((dest) => {
          const c =
            constraints.perDestination.find(
              (d) => d.destinationId === dest.id
            ) ?? null;
          return (
            <li key={dest.id}>
              <CityConstraintCard
                code={cityCode(dest.city.name)}
                cityName={dest.city.name}
                country={dest.city.country}
                constraint={c}
                tripMin={tripMin}
                tripMax={tripMax}
                onUpdate={(patch) => onUpdate(dest.id, patch)}
                onPin={(next) => onPin(dest.id, next)}
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function CityConstraintCard({
  code,
  cityName,
  country,
  constraint,
  tripMin,
  tripMax,
  onUpdate,
  onPin,
}: {
  code: string;
  cityName: string;
  country: string;
  constraint: DestinationConstraint | null;
  tripMin: string;
  tripMax: string;
  onUpdate: (patch: Partial<DestinationConstraint>) => void;
  onPin: (next: DestinationPin) => void;
}) {
  const arrivalId = `arr-${slug(cityName)}`;
  const departureId = `dep-${slug(cityName)}`;
  const arrival = constraint?.arrivalDate ?? "";
  const departure = constraint?.departureDate ?? "";
  const pinned = constraint?.pinned ?? null;

  // Erreur soft si dates incohérentes (départ avant arrivée).
  const dateError =
    arrival && departure && new Date(departure) < new Date(arrival)
      ? "Le départ ne peut pas précéder l’arrivée."
      : undefined;

  return (
    <article className="group rounded-2xl border border-line bg-card p-5 transition-[border-color,box-shadow] duration-180 ease-out hover:border-line-strong">
      <div className="flex items-start gap-4">
        {/* Drag handle visuel — non fonctionnel mais signale l'ordre */}
        <span
          aria-hidden
          className="mt-1.5 inline-flex h-6 w-3 flex-col items-center justify-center gap-[3px] text-ink-mute/60"
          title="Position dans l'itinéraire"
        >
          <span className="h-[2px] w-3 rounded-full bg-current" />
          <span className="h-[2px] w-3 rounded-full bg-current" />
          <span className="h-[2px] w-3 rounded-full bg-current" />
        </span>

        <div className="min-w-0 flex-1">
          {/* En-tête ville */}
          <div className="flex items-baseline gap-3">
            <span
              className="text-[22px] tracking-[0.04em] text-ink"
              style={{ fontFamily: "var(--font-mono)", fontWeight: 500 }}
            >
              {code}
            </span>
            <span
              className="text-[20px] leading-[1.1] text-ink"
              style={{
                fontFamily: "var(--font-display)",
                fontStyle: "italic",
              }}
            >
              {cityName}
            </span>
            <span className="text-[11px] uppercase tracking-[0.12em] text-ink-mute">
              {country}
            </span>
          </div>

          {/* Champs dates */}
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              id={arrivalId}
              label="Date d'arrivée (si fixe)"
              helper="Laissez vide pour que SmartTraveler choisisse."
              optional
            >
              <input
                id={arrivalId}
                type="date"
                value={arrival}
                min={tripMin}
                max={tripMax}
                onChange={(e) =>
                  onUpdate({ arrivalDate: e.target.value || undefined })
                }
                className={inputClass(false)}
              />
            </FormField>

            <FormField
              id={departureId}
              label="Date de départ (si fixe)"
              helper="Doit suivre la date d’arrivée."
              error={dateError}
              optional
            >
              <input
                id={departureId}
                type="date"
                value={departure}
                min={arrival || tripMin}
                max={tripMax}
                onChange={(e) =>
                  onUpdate({ departureDate: e.target.value || undefined })
                }
                aria-invalid={Boolean(dateError)}
                className={inputClass(Boolean(dateError))}
              />
            </FormField>
          </div>

          {/* Pin position */}
          <fieldset className="mt-4">
            <legend className="sr-only">
              Position de {cityName} dans l’itinéraire
            </legend>
            <div
              role="radiogroup"
              aria-label={`Position de ${cityName}`}
              className="flex flex-wrap gap-2"
            >
              <PinChip
                checked={pinned === "first"}
                onSelect={() =>
                  onPin(pinned === "first" ? null : "first")
                }
                label="Première étape"
              />
              <PinChip
                checked={pinned === null}
                onSelect={() => onPin(null)}
                label="Souple"
              />
              <PinChip
                checked={pinned === "last"}
                onSelect={() => onPin(pinned === "last" ? null : "last")}
                label="Dernière étape"
              />
            </div>
          </fieldset>

          <p
            className="mt-3 text-[12px] text-ink-mute"
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
            }}
          >
            Laissez vide pour que SmartTraveler choisisse les dates idéales.
          </p>
        </div>
      </div>
    </article>
  );
}

function PinChip({
  checked,
  onSelect,
  label,
}: {
  checked: boolean;
  onSelect: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={onSelect}
      className={[
        "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[12.5px]",
        "transition-[background-color,border-color,color,transform] duration-180 ease-out",
        "active:scale-[0.97]",
        checked
          ? "border-[oklch(0.62_0.155_38)] bg-[oklch(0.93_0.045_50)] text-[oklch(0.42_0.13_35)]"
          : "border-line bg-surface text-ink-soft hover:border-line-strong hover:text-ink",
      ].join(" ")}
      style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
    >
      <span
        aria-hidden
        className={[
          "inline-block h-1.5 w-1.5 rounded-full",
          checked ? "bg-[oklch(0.62_0.155_38)]" : "bg-ink-mute/50",
        ].join(" ")}
      />
      <span>{label}</span>
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*  Empty state — aucune contrainte stricte                                   */
/* -------------------------------------------------------------------------- */

function NoConstraintCard() {
  return (
    <aside
      aria-label="État sans contrainte"
      className="rounded-2xl border border-dashed border-[oklch(0.82_0.07_60)] bg-[oklch(0.97_0.018_75)] p-6"
    >
      <div className="flex items-baseline gap-3">
        <span
          aria-hidden
          className="inline-block h-1.5 w-1.5 rounded-full bg-[oklch(0.78_0.13_75)]"
        />
        <h3
          className="text-[18px] text-ink"
          style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
        >
          Aucune contrainte stricte
        </h3>
      </div>
      <p
        className="mt-2 text-[14px] leading-[1.55] text-ink-soft"
        style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
      >
        SmartTraveler aura les coudées franches pour optimiser.
      </p>
    </aside>
  );
}

/* -------------------------------------------------------------------------- */
/*  Utils                                                                     */
/* -------------------------------------------------------------------------- */

function cityCode(name: string): string {
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
  };
  return map[name] ?? name.slice(0, 3).toUpperCase();
}

function slug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
