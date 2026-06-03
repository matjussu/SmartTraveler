"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { TopNav } from "@/components/voyage/top-nav";
import { FormField, inputClass } from "@/components/voyage/form-field";
import { BoardingPassDraft } from "@/components/voyage/boarding-pass-draft";
import { useTripStore } from "@/store/trip-store";
import type { City, Trip } from "@/mocks/trips";

/**
 * /trip/new — pilote cascade voyage-pivot.
 *
 * Établit :
 *  - le pattern <FormField> (label italic Instrument Serif + helper italic
 *    + état d'erreur terracotta)
 *  - le scaffold preview live <DraftPreview /> sticky col-span-4
 *  - la voice spec B2C ("Composez", "Quelques mots pour commencer",
 *    "Continuer vers les destinations")
 *
 * Pas de validation server-side : tout est côté client, store Zustand
 * persisté localStorage. La sortie redirige vers /trip/[id]/destinations.
 */

type Errors = Partial<{
  name: string;
  startCity: string;
  startDate: string;
  endDate: string;
}>;

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 48);
}

function buildTripId(name: string): string {
  const slug = slugify(name);
  if (!slug) return `trip-${Date.now()}`;
  // On suffixe avec un court timestamp pour éviter les collisions avec les mocks
  return `trip-${slug}-${Date.now().toString(36).slice(-4)}`;
}

function normalizeCityName(raw: string): string {
  const t = raw.trim();
  if (!t) return t;
  return t.charAt(0).toUpperCase() + t.slice(1);
}

// Mapping basique nom→pays pour les villes de départ proposées en mock.
// Hors scope strict : tout autre nom devient { country: "FR" } par défaut.
const KNOWN_START_CITIES: Record<string, City> = {
  Paris: { name: "Paris", country: "FR", coordinates: { lat: 48.8566, lng: 2.3522 } },
  Lyon: { name: "Lyon", country: "FR", coordinates: { lat: 45.764, lng: 4.8357 } },
  Marseille: {
    name: "Marseille",
    country: "FR",
    coordinates: { lat: 43.2965, lng: 5.3698 },
  },
};

function makeStartCity(raw: string): City {
  const name = normalizeCityName(raw);
  return (
    KNOWN_START_CITIES[name] ?? {
      name,
      country: "FR",
      coordinates: { lat: 0, lng: 0 },
    }
  );
}

export default function TripNewPage() {
  const router = useRouter();
  const createTrip = useTripStore((s) => s.createTrip);

  const [name, setName] = useState("");
  const [startCity, setStartCity] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [touched, setTouched] = useState<Record<keyof Errors, boolean>>({
    name: false,
    startCity: false,
    startDate: false,
    endDate: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const errors = useMemo<Errors>(() => {
    const e: Errors = {};
    if (!name.trim()) e.name = "Donnez-lui un nom, même provisoire.";
    if (!startCity.trim())
      e.startCity = "Choisissez la ville d’où le voyage commence.";
    if (!startDate) e.startDate = "Choisissez une date de départ.";
    if (!endDate) e.endDate = "Choisissez une date de retour.";
    if (startDate && endDate) {
      const s = new Date(startDate).getTime();
      const en = new Date(endDate).getTime();
      if (Number.isFinite(s) && Number.isFinite(en) && en <= s) {
        e.endDate = "Le retour doit suivre le départ.";
      }
    }
    return e;
  }, [name, startCity, startDate, endDate]);

  const isValid = Object.keys(errors).length === 0;

  // Helper pour n'afficher l'erreur qu'après interaction (focus ou submit).
  const errorOf = (k: keyof Errors): string | undefined =>
    touched[k] ? errors[k] : undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || submitting) {
      // On marque tout comme "touched" pour révéler les erreurs.
      setTouched({ name: true, startCity: true, startDate: true, endDate: true });
      return;
    }
    setSubmitting(true);
    const id = buildTripId(name);
    const nowIso = new Date().toISOString();
    const draft: Trip = {
      id,
      name: name.trim(),
      status: "draft",
      startCity: makeStartCity(startCity),
      startDate,
      endDate,
      destinations: [],
      alternatives: [],
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    createTrip(draft);
    router.push(`/trip/${id}/destinations`);
  };

  return (
    <main data-route="trip-new" className="relative flex min-h-screen flex-col">
      <TopNav variant="dark" />

      <div className="mx-auto w-full max-w-6xl px-6 pb-24 pt-10">
        {/* Fil d'ariane / progression */}
        <nav
          aria-label="Étapes de composition"
          className="mb-8 flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.14em] text-white/45"
        >
          <Link href="/" className="transition-colors hover:text-white/75">
            Vos itinéraires
          </Link>
          <span aria-hidden>·</span>
          <span className="text-[#f6f6f4]">Nouveau voyage</span>
          <span aria-hidden>·</span>
          <span className="text-white/30">Destinations</span>
          <span aria-hidden>·</span>
          <span className="text-white/30">Contraintes</span>
        </nav>

        {/* Hero éditorial */}
        <section className="mb-12">
          <div className="mb-4 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-white/45">
            <span aria-hidden className="inline-block h-1 w-6 bg-[#ff7a1a]" />
            <span>Étape 1 sur 3</span>
          </div>
          <h1
            className="text-[clamp(40px,6vw,68px)] leading-[0.98] tracking-[-0.015em] text-[#f6f6f4]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Composez un{" "}
            <span style={{ fontStyle: "italic" }} className="text-[#ff8a3d]">
              nouveau voyage.
            </span>
          </h1>
          <p
            className="mt-5 max-w-xl text-[16px] leading-[1.55] text-white/70"
            style={{ fontFamily: "var(--font-jakarta)" }}
          >
            Quelques mots pour commencer. Vous pourrez tout affiner après.
          </p>
        </section>

        {/* Layout 12-col : form 7 / preview 5 */}
        <form onSubmit={handleSubmit} noValidate className="grid grid-cols-12 gap-10">
          <div className="col-span-12 lg:col-span-7">
            <fieldset className="space-y-6">
              <legend className="sr-only">Premiers détails du voyage</legend>

              <FormField
                id="trip-name"
                variant="dark"
                label="Nom du voyage"
                helper="Vous pourrez le modifier plus tard."
                error={errorOf("name")}
              >
                <input
                  id="trip-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                  placeholder="Escapade méditerranéenne, week-end nordique…"
                  autoComplete="off"
                  aria-invalid={Boolean(errorOf("name"))}
                  aria-describedby={
                    errorOf("name") ? "trip-name-error" : "trip-name-helper"
                  }
                  className={inputClass(Boolean(errorOf("name")), "dark")}
                />
              </FormField>

              <FormField
                id="trip-start-city"
                variant="dark"
                label="Ville de départ"
                helper="Sera utilisée comme point initial du calcul."
                error={errorOf("startCity")}
              >
                <input
                  id="trip-start-city"
                  type="text"
                  value={startCity}
                  onChange={(e) => setStartCity(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, startCity: true }))}
                  placeholder="Paris, Lyon, Marseille…"
                  autoComplete="off"
                  list="trip-start-city-suggestions"
                  aria-invalid={Boolean(errorOf("startCity"))}
                  aria-describedby={
                    errorOf("startCity")
                      ? "trip-start-city-error"
                      : "trip-start-city-helper"
                  }
                  className={inputClass(Boolean(errorOf("startCity")), "dark")}
                />
                {/* Mock léger d'autocomplete via datalist natif (a11y + zéro JS). */}
                <datalist id="trip-start-city-suggestions">
                  <option value="Paris" />
                  <option value="Lyon" />
                  <option value="Marseille" />
                  <option value="Bordeaux" />
                  <option value="Toulouse" />
                  <option value="Nantes" />
                </datalist>
              </FormField>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <FormField
                  id="trip-start-date"
                  variant="dark"
                  label="Date de départ"
                  helper="Le jour où le voyage commence."
                  error={errorOf("startDate")}
                >
                  <input
                    id="trip-start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, startDate: true }))}
                    aria-invalid={Boolean(errorOf("startDate"))}
                    aria-describedby={
                      errorOf("startDate")
                        ? "trip-start-date-error"
                        : "trip-start-date-helper"
                    }
                    className={inputClass(Boolean(errorOf("startDate")), "dark")}
                  />
                </FormField>

                <FormField
                  id="trip-end-date"
                  variant="dark"
                  label="Date de retour"
                  helper="Doit être postérieure au départ."
                  error={errorOf("endDate")}
                >
                  <input
                    id="trip-end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, endDate: true }))}
                    min={startDate || undefined}
                    aria-invalid={Boolean(errorOf("endDate"))}
                    aria-describedby={
                      errorOf("endDate")
                        ? "trip-end-date-error"
                        : "trip-end-date-helper"
                    }
                    className={inputClass(Boolean(errorOf("endDate")), "dark")}
                  />
                </FormField>
              </div>
            </fieldset>

            {/* Actions */}
            <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.08] pt-6">
              <Link
                href="/"
                className="text-[14px] text-white/60 underline decoration-[#ff7a1a]/70 decoration-2 underline-offset-4 transition-colors hover:text-[#f6f6f4]"
              >
                Revenir aux itinéraires
              </Link>

              <button
                type="submit"
                disabled={!isValid || submitting}
                className={[
                  "inline-flex h-12 items-center gap-2 rounded-full px-6 text-[14px] font-semibold text-white",
                  "bg-[#ff7a1a]",
                  "shadow-[0_0_38px_-4px_rgba(255,122,26,0.55),0_14px_30px_-14px_rgba(255,122,26,0.7)]",
                  "transition-[transform,background-color,box-shadow] duration-200 ease-out",
                  "hover:not(:disabled):scale-[1.02] hover:not(:disabled):bg-[#ff8a30] active:not(:disabled):scale-[0.98]",
                  "disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none",
                ].join(" ")}
                style={{ fontFamily: "var(--font-jakarta)" }}
              >
                <span>Continuer vers les destinations</span>
                <span aria-hidden className="text-base leading-none">
                  →
                </span>
              </button>
            </div>
          </div>

          {/* Preview sticky col-span-5 */}
          <div className="col-span-12 lg:col-span-5">
            <div className="lg:sticky lg:top-24">
              <BoardingPassDraft
                name={name}
                startCity={startCity}
                startDate={startDate}
                endDate={endDate}
              />
              <p
                className="mt-4 px-2 text-[12px] text-white/45"
                style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
              >
                Cet aperçu se précise à chaque champ rempli.
              </p>
            </div>
          </div>
        </form>

        <footer className="mt-20 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-6 text-[12px] text-white/40">
          <div className="flex items-center gap-2">
            <span
              style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
              className="text-[15px] text-white/65"
            >
              SmartTraveler
            </span>
            <span aria-hidden>·</span>
            <span>Compose, compare, choisis.</span>
          </div>
          <div>© 2026 — voyages composés avec soin.</div>
        </footer>
      </div>
    </main>
  );
}
