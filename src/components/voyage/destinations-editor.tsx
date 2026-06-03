"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { TopNav } from "@/components/voyage/top-nav";
import { FormField, inputClass } from "@/components/voyage/form-field";
import { DraftPreview } from "@/components/voyage/draft-preview";
import { useTripStore } from "@/store/trip-store";
import { CITY_CATALOG, cityCode, resolveCity } from "@/lib/cities-mock";
import type { Destination } from "@/mocks/trips";

/**
 * /trip/[id]/destinations — étape 2 sur 3 de la cascade.
 *
 * Le brouillon créé sur /trip/new (Zustand persist) est ré-hydraté ici.
 * L'utilisateur compose sa liste de villes (autocomplete datalist + bouton
 * "Ajouter"), règle les nuits sur place, peut supprimer une destination.
 *
 * Voice spec : "Composez votre itinéraire", "Ajouter une ville",
 * "Nuits sur place", "Minimum deux destinations pour optimiser".
 *
 * Le drag-handle visuel n'est PAS fonctionnel (mock B2C) — il signale
 * l'intention de réorganisation à venir mais ne déclenche rien.
 */

type Props = {
  tripId: string;
};

/**
 * Génère un id de destination déterministe-ish à partir du nom de la
 * ville + timestamp court — évite les collisions avec les mocks.
 */
function buildDestId(cityName: string): string {
  const slug = cityName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 24);
  return `dest-${slug || "city"}-${Date.now().toString(36).slice(-4)}`;
}

export function DestinationsEditor({ tripId }: Props) {
  const router = useRouter();
  const hydrated = useTripStore((s) => s.hydrated);
  const trip = useTripStore((s) => s.getTrip(tripId));
  const updateTrip = useTripStore((s) => s.updateTrip);

  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  const destinations = useMemo(() => trip?.destinations ?? [], [trip]);

  // États dérivés voice / a11y
  const canContinue = destinations.length >= 2;

  // ─── Actions store ────────────────────────────────────────────────────
  const addDestination = (rawName: string) => {
    const name = rawName.trim();
    if (!name) {
      setFeedback("Tapez une ville avant de l'ajouter.");
      return;
    }
    if (!trip) return;
    // Empêche les doublons (par nom normalisé)
    const norm = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const exists = destinations.some(
      (d) =>
        d.city.name
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "") === norm
    );
    if (exists) {
      setFeedback("Cette ville est déjà dans votre itinéraire.");
      return;
    }
    const city = resolveCity(name);
    const newDest: Destination = {
      id: buildDestId(city.name),
      city,
      nights: 2,
    };
    updateTrip(tripId, { destinations: [...destinations, newDest] });
    setInput("");
    setFeedback(null);
  };

  const removeDestination = (destId: string) => {
    if (!trip) return;
    updateTrip(tripId, {
      destinations: destinations.filter((d) => d.id !== destId),
    });
  };

  const updateNights = (destId: string, nights: number) => {
    if (!trip) return;
    const clamped = Math.max(1, Math.min(30, Math.round(nights)));
    updateTrip(tripId, {
      destinations: destinations.map((d) =>
        d.id === destId ? { ...d, nights: clamped } : d
      ),
    });
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addDestination(input);
  };

  const handleContinue = () => {
    if (!canContinue) return;
    router.push(`/trip/${tripId}/constraints`);
  };

  // ─── Hydration gate ───────────────────────────────────────────────────
  if (!hydrated) {
    return (
      <>
        <TopNav variant="dark" />
        <main data-route="voyage-dark" className="mx-auto w-full max-w-6xl px-6 pb-24 pt-10">
          <p
            className="text-[15px] text-ink-mute"
            style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
          >
            Préparation de votre brouillon…
          </p>
        </main>
      </>
    );
  }

  if (!trip) {
    return (
      <>
        <TopNav variant="dark" />
        <main data-route="voyage-dark" className="mx-auto w-full max-w-6xl px-6 pb-24 pt-10">
          <div className="mx-auto max-w-xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-ink-mute">
              <span
                aria-hidden
                className="inline-block h-1 w-6 bg-[var(--terracotta)]"
              />
              <span>Voyage introuvable</span>
            </div>
            <h1
              className="text-[clamp(32px,5vw,52px)] leading-[1.05] tracking-tight text-ink"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Ce brouillon n&apos;existe{" "}
              <span style={{ fontStyle: "italic" }} className="text-[var(--terracotta-ink)]">
                plus.
              </span>
            </h1>
            <p
              className="mt-5 text-[15px] text-ink-soft"
              style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
            >
              Il a peut-être été supprimé, ou jamais créé sur cet appareil.
            </p>
            <Link
              href="/"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--terracotta)] px-5 py-3 text-[14px] font-medium text-[oklch(0.99_0.005_80)] transition-transform duration-200 ease-out hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Revenir à vos itinéraires</span>
              <span aria-hidden>→</span>
            </Link>
          </div>
        </main>
      </>
    );
  }

  // ─── Render principal ─────────────────────────────────────────────────
  return (
    <>
      <TopNav variant="dark" />
      <main data-route="voyage-dark" className="mx-auto w-full max-w-6xl px-6 pb-24 pt-10">
        {/* Breadcrumb */}
        <nav
          aria-label="Étapes de composition"
          className="mb-8 flex items-center gap-3 text-[11px] uppercase tracking-[0.14em] text-ink-mute"
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
          <span className="text-ink" aria-current="step">
            Destinations
          </span>
          <span aria-hidden>·</span>
          <span className="text-ink-mute/70">Contraintes</span>
        </nav>

        {/* Indicator + hero éditorial */}
        <section className="mb-12">
          <div className="mb-4 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-ink-mute">
            <span
              aria-hidden
              className="inline-block h-1 w-6 bg-[var(--terracotta)]"
            />
            <span>Étape 2 sur 3</span>
          </div>
          <h1
            className="text-[clamp(40px,6vw,68px)] leading-[0.98] tracking-[-0.015em] text-ink"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Composez votre{" "}
            <span style={{ fontStyle: "italic" }} className="text-[var(--terracotta-ink)]">
              itinéraire.
            </span>
          </h1>
          <p
            className="mt-5 max-w-xl text-[16px] leading-[1.55] text-ink-soft"
            style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
          >
            Choisissez les villes que vous voulez visiter. Au moins deux pour que
            SmartTraveler ait quelque chose à optimiser.
          </p>
        </section>

        {/* Layout 12-col : form 8 / preview 4 */}
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-8">
            {/* Section ajout destination */}
            <form onSubmit={handleAddSubmit} noValidate className="mb-10">
              <FormField
                id="dest-search"
                label="Ajouter une ville"
                helper="Tapez pour rechercher, validez avec Entrée."
                error={feedback ?? undefined}
              >
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    id="dest-search"
                    type="text"
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      if (feedback) setFeedback(null);
                    }}
                    placeholder="Rome, Barcelone, Lisbonne…"
                    autoComplete="off"
                    list="dest-city-suggestions"
                    aria-describedby="dest-search-helper"
                    className={`${inputClass(Boolean(feedback))} sm:flex-1`}
                  />
                  <datalist id="dest-city-suggestions">
                    {CITY_CATALOG.map((entry) => (
                      <option key={entry.code} value={entry.city.name} />
                    ))}
                  </datalist>
                  <button
                    type="submit"
                    className={[
                      "inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full px-6 text-[14px] font-medium",
                      "bg-[var(--terracotta)] text-[oklch(0.99_0.005_80)]",
                      "shadow-[0_10px_22px_-12px_oklch(0.42_0.13_35_/_0.5)]",
                      "transition-transform duration-200 ease-out",
                      "hover:scale-[1.02] active:scale-[0.98]",
                    ].join(" ")}
                  >
                    <span>Ajouter</span>
                    <span
                      aria-hidden
                      className="text-base leading-none"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      +
                    </span>
                  </button>
                </div>
              </FormField>
            </form>

            {/* Liste destinations OU empty state */}
            {destinations.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-3">
                <div className="flex items-baseline justify-between gap-3 px-1">
                  <h2
                    className="text-[15px] text-ink-soft"
                    style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
                  >
                    Votre itinéraire pour l&apos;instant
                  </h2>
                  <span className="text-[11px] uppercase tracking-[0.12em] text-ink-mute">
                    {destinations.length} ville
                    {destinations.length > 1 ? "s" : ""}
                  </span>
                </div>
                <ul className="space-y-3">
                  {destinations.map((dest, idx) => (
                    <DestinationCard
                      key={dest.id}
                      destination={dest}
                      index={idx}
                      total={destinations.length}
                      onRemove={() => removeDestination(dest.id)}
                      onNightsChange={(n) => updateNights(dest.id, n)}
                    />
                  ))}
                </ul>
              </div>
            )}

            {/* CTA bas de form */}
            <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
              <Link
                href="/trip/new"
                className="text-[14px] text-ink-soft underline decoration-[var(--gold)] decoration-2 underline-offset-4 transition-colors hover:text-ink"
              >
                ← Retour aux infos
              </Link>

              <div className="flex flex-col items-end gap-2">
                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={!canContinue}
                  className={[
                    "inline-flex h-12 items-center gap-2 rounded-full px-6 text-[14px] font-medium",
                    "bg-[var(--terracotta)] text-[oklch(0.99_0.005_80)]",
                    "shadow-[0_10px_22px_-12px_oklch(0.42_0.13_35_/_0.5)]",
                    "transition-transform duration-200 ease-out",
                    "hover:not(:disabled):scale-[1.02] active:not(:disabled):scale-[0.98]",
                    "disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none",
                  ].join(" ")}
                  aria-describedby={!canContinue ? "continue-helper" : undefined}
                >
                  <span>Continuer vers les contraintes</span>
                  <span
                    aria-hidden
                    className="text-base leading-none"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    →
                  </span>
                </button>
                {!canContinue && (
                  <p
                    id="continue-helper"
                    className="text-[12px] text-[var(--terracotta-ink)]"
                    style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
                  >
                    Minimum deux destinations pour optimiser.
                  </p>
                )}
              </div>
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
                destinations={destinations.map((d) => ({ name: d.city.name }))}
                badge="Destinations à choisir"
                emptyHint="Ajoutez vos villes à gauche, le billet se compose ici."
              />
              <p
                className="mt-4 px-2 text-[12px] text-ink-mute"
                style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
              >
                L&apos;ordre des étapes sera optimisé à l&apos;étape suivante.
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
          <div>© 2026 — voyages composés avec soin.</div>
        </footer>
      </main>
    </>
  );
}

// ─── Sous-composants internes ──────────────────────────────────────────────

type CardProps = {
  destination: Destination;
  index: number;
  total: number;
  onRemove: () => void;
  onNightsChange: (n: number) => void;
};

function DestinationCard({
  destination,
  index,
  total,
  onRemove,
  onNightsChange,
}: CardProps) {
  const code = cityCode(destination.city.name);
  const positionLabel = `Étape ${index + 1} sur ${total}`;

  return (
    <li
      className={[
        "dest-card group flex items-center gap-4 rounded-lg border border-line bg-card p-4",
        "transition-[border-color,box-shadow] duration-180 ease-out",
        "hover:border-line-strong",
      ].join(" ")}
      aria-label={`${destination.city.name}, ${positionLabel}`}
    >
      {/* Drag handle visuel (non fonctionnel — affordance future) */}
      <button
        type="button"
        aria-label="Réorganiser (à venir)"
        title="Réorganisation à venir"
        tabIndex={-1}
        className="flex h-9 w-5 shrink-0 cursor-grab items-center justify-center text-ink-mute/60 hover:text-ink-mute"
      >
        <span
          aria-hidden
          className="text-[18px] leading-none tracking-[-0.05em]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          ⋮⋮
        </span>
      </button>

      {/* Code 3 lettres + nom */}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-3">
          <span
            className="text-[22px] tracking-[0.04em] text-ink"
            style={{ fontFamily: "var(--font-mono)", fontWeight: 500 }}
          >
            {code}
          </span>
          <span
            className="truncate text-[20px] leading-tight text-ink"
            style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
          >
            {destination.city.name}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-ink-mute">
          <span style={{ fontFamily: "var(--font-mono)" }}>
            {destination.city.country}
          </span>
          <span aria-hidden>·</span>
          <span>{positionLabel}</span>
        </div>
      </div>

      {/* Stepper nuits sur place */}
      <NightsStepper
        value={destination.nights}
        onChange={onNightsChange}
        id={`nights-${destination.id}`}
      />

      {/* Trash */}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Retirer ${destination.city.name} de l'itinéraire`}
        className={[
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line text-ink-mute",
          "transition-[color,border-color,background-color,transform] duration-180 ease-out",
          "hover:border-[oklch(0.42_0.13_35_/_0.5)] hover:bg-[var(--terracotta-soft)] hover:text-[var(--terracotta-ink)]",
          "active:scale-[0.94]",
        ].join(" ")}
      >
        <TrashIcon />
      </button>
    </li>
  );
}

type StepperProps = {
  id: string;
  value: number;
  onChange: (n: number) => void;
};

function NightsStepper({ id, value, onChange }: StepperProps) {
  return (
    <div className="flex shrink-0 flex-col items-end gap-1">
      <label
        htmlFor={id}
        className="text-[10px] uppercase tracking-[0.12em] text-ink-mute"
      >
        Nuits sur place
      </label>
      <div className="inline-flex items-center gap-1">
        <button
          type="button"
          onClick={() => onChange(value - 1)}
          disabled={value <= 1}
          aria-label="Une nuit de moins"
          className={[
            "flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink",
            "transition-[color,border-color,background-color,transform] duration-180 ease-out",
            "hover:not(:disabled):border-line-strong hover:not(:disabled):bg-[var(--surface)]",
            "active:not(:disabled):scale-[0.94]",
            "disabled:cursor-not-allowed disabled:opacity-40",
          ].join(" ")}
        >
          <span
            aria-hidden
            className="text-[18px] leading-none"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            −
          </span>
        </button>
        <input
          id={id}
          type="number"
          min={1}
          max={30}
          value={value}
          onChange={(e) => {
            const n = parseInt(e.target.value, 10);
            if (Number.isFinite(n)) onChange(n);
          }}
          aria-label="Nombre de nuits sur place"
          className={[
            "h-8 w-12 rounded-md border border-line bg-card text-center text-[15px] text-ink tabular-nums",
            "transition-[border-color,box-shadow] duration-180 ease-out",
            "focus:outline-none focus:border-[var(--terracotta)]",
            "focus:shadow-[0_0_0_3px_oklch(0.62_0.155_38_/_0.16)]",
            // Cache les spinners natifs (on a notre propre stepper)
            "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
          ].join(" ")}
          style={{ fontFamily: "var(--font-mono)" }}
        />
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          disabled={value >= 30}
          aria-label="Une nuit de plus"
          className={[
            "flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink",
            "transition-[color,border-color,background-color,transform] duration-180 ease-out",
            "hover:not(:disabled):border-line-strong hover:not(:disabled):bg-[var(--surface)]",
            "active:not(:disabled):scale-[0.94]",
            "disabled:cursor-not-allowed disabled:opacity-40",
          ].join(" ")}
        >
          <span
            aria-hidden
            className="text-[18px] leading-none"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            +
          </span>
        </button>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      className={[
        "rounded-[18px] border border-dashed border-line-strong bg-[var(--surface)]",
        "px-6 py-12 text-center",
      ].join(" ")}
    >
      <div
        aria-hidden
        className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--terracotta-soft)] text-[var(--terracotta-ink)]"
      >
        <span
          className="text-[18px] leading-none"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          ?
        </span>
      </div>
      <p
        className="text-[18px] leading-[1.3] text-ink"
        style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
      >
        Aucune destination pour l&apos;instant.
      </p>
      <p
        className="mt-2 text-[13px] text-ink-mute"
        style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
      >
        Commencez par taper une ville au-dessus.
      </p>
    </div>
  );
}

function TrashIcon() {
  // Trash inline (évite la dep lucide-react juste pour une icône)
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M2.5 4h11" />
      <path d="M6 4V2.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V4" />
      <path d="M3.5 4l.7 9.1A1 1 0 0 0 5.2 14h5.6a1 1 0 0 0 1-.9L12.5 4" />
      <path d="M6.5 7v4" />
      <path d="M9.5 7v4" />
    </svg>
  );
}
