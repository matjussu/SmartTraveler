"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { FormField, inputClass } from "@/components/voyage/form-field";
import { DraftPreview } from "@/components/voyage/draft-preview";
import { useTripStore } from "@/store/trip-store";
import type { City, Destination } from "@/mocks/trips";

/**
 * /trip/[id]/edit — édition complète d'un voyage existant.
 *
 * Réutilise le pattern <FormField /> + inputClass + <DraftPreview />
 * établis sur /trip/new (pilote cascade). Consolide en 3 sections
 * (infos, destinations, contraintes) ce que les écrans dédiés
 * /destinations et /constraints proposent — ici on est en mode
 * édition rapide, pas un flow linéaire à étapes.
 *
 * Différences clés vs /trip/new :
 *  - pas d'étape indicator (1 sur 3, etc.)
 *  - breadcrumb actif sur "Modifier"
 *  - status badge "Recalcul nécessaire" si trip déjà computed
 *  - CTA "Relancer le calcul" (terracotta plein) au lieu de "Continuer"
 *  - lien secondaire vers /result si déjà calculé
 *  - lien destructive discret "Supprimer ce voyage" en bas
 *  - warning chaleureux si modifs pending
 */

type DestRow = {
  id: string;
  name: string;
  country: string;
  nights: number;
};

// Mini-liste de villes connues (cohérente avec /trip/new + BoardingTicket).
// Pour rester autonome — Claudette consolidera avec /destinations après.
const CITY_DATALIST: { name: string; country: string }[] = [
  { name: "Rome", country: "IT" },
  { name: "Barcelone", country: "ES" },
  { name: "Berlin", country: "DE" },
  { name: "Prague", country: "CZ" },
  { name: "Amsterdam", country: "NL" },
  { name: "Copenhague", country: "DK" },
  { name: "Lisbonne", country: "PT" },
  { name: "Vienne", country: "AT" },
  { name: "Budapest", country: "HU" },
  { name: "Athènes", country: "GR" },
  { name: "Madrid", country: "ES" },
  { name: "Florence", country: "IT" },
  { name: "Venise", country: "IT" },
  { name: "Munich", country: "DE" },
  { name: "Édimbourg", country: "GB" },
  { name: "Dublin", country: "IE" },
  { name: "Stockholm", country: "SE" },
  { name: "Oslo", country: "NO" },
];

function normalizeCityName(raw: string): string {
  const t = raw.trim();
  if (!t) return t;
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function makeCity(raw: string): City {
  const name = normalizeCityName(raw);
  const known = CITY_DATALIST.find(
    (c) => c.name.toLowerCase() === name.toLowerCase()
  );
  return {
    name,
    country: known?.country ?? "FR",
    coordinates: { lat: 0, lng: 0 },
  };
}

function destIdFromName(name: string): string {
  const slug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-");
  return `dest-${slug}-${Date.now().toString(36).slice(-4)}`;
}

export function EditView({ tripId }: { tripId: string }) {
  const router = useRouter();
  const hydrated = useTripStore((s) => s.hydrated);
  const trip = useTripStore((s) => s.getTrip(tripId));
  const updateTrip = useTripStore((s) => s.updateTrip);
  const deleteTrip = useTripStore((s) => s.deleteTrip);

  // États locaux miroirs (initialisés depuis trip une fois hydraté).
  const [name, setName] = useState<string>("");
  const [startCity, setStartCity] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [destinations, setDestinations] = useState<DestRow[]>([]);
  const [newCityInput, setNewCityInput] = useState<string>("");
  const [followInputOrder, setFollowInputOrder] = useState<boolean>(false);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [hasInitialized, setHasInitialized] = useState<boolean>(false);

  // Hydrate les états locaux depuis le trip une fois le store rehydraté.
  // useEffect plutôt qu'un setState pendant le render — évite les warnings
  // React 19 strict mode + garde une dépendance explicite sur (hydrated, trip).
  useEffect(() => {
    if (!hydrated || !trip || hasInitialized) return;
    setName(trip.name);
    setStartCity(trip.startCity.name);
    setStartDate(trip.startDate);
    setEndDate(trip.endDate);
    setDestinations(
      trip.destinations.map((d) => ({
        id: d.id,
        name: d.city.name,
        country: d.city.country,
        nights: d.nights,
      }))
    );
    setHasInitialized(true);
  }, [hydrated, trip, hasInitialized]);

  // Détection modifs pending vs trip d'origine.
  const isDirty = useMemo(() => {
    if (!trip || !hasInitialized) return false;
    if (name.trim() !== trip.name) return true;
    if (normalizeCityName(startCity) !== trip.startCity.name) return true;
    if (startDate !== trip.startDate) return true;
    if (endDate !== trip.endDate) return true;
    if (destinations.length !== trip.destinations.length) return true;
    for (let i = 0; i < destinations.length; i++) {
      if (destinations[i].name !== trip.destinations[i].city.name) return true;
      if (destinations[i].nights !== trip.destinations[i].nights) return true;
    }
    return false;
  }, [trip, hasInitialized, name, startCity, startDate, endDate, destinations]);

  // Erreurs simples — pas de touched gating ici (édition = champs déjà remplis).
  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Le voyage a besoin d'un nom.";
    if (!startCity.trim()) e.startCity = "Une ville de départ est requise.";
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

  // États de chargement / introuvables.
  if (!hydrated) {
    return (
      <main data-route="voyage-dark" className="mx-auto w-full max-w-6xl px-6 pb-24 pt-16">
        <p
          className="text-[15px] text-ink-mute"
          style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
        >
          Préparation de votre voyage…
        </p>
      </main>
    );
  }

  if (!trip) {
    return (
      <main data-route="voyage-dark" className="mx-auto w-full max-w-3xl px-6 pb-24 pt-20">
        <div className="mb-3 text-[11px] uppercase tracking-[0.14em] text-ink-mute">
          Voyage introuvable
        </div>
        <h1
          className="text-[clamp(32px,4.5vw,52px)] leading-[1] tracking-tight text-ink"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Ce voyage <span style={{ fontStyle: "italic" }}>n&apos;existe plus</span>.
        </h1>
        <p
          className="mt-4 max-w-md text-[15px] text-ink-soft"
          style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
        >
          Soit l&apos;identifiant est erroné, soit le voyage a été supprimé.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-[13.5px] font-medium text-[oklch(0.99_0.005_80)] transition-transform duration-200 ease-out hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>Revenir aux itinéraires</span>
          <span aria-hidden>→</span>
        </Link>
      </main>
    );
  }

  // Handlers destinations.
  const handleAddDestination = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = newCityInput.trim();
    if (!raw) return;
    const name = normalizeCityName(raw);
    const known = CITY_DATALIST.find(
      (c) => c.name.toLowerCase() === name.toLowerCase()
    );
    const row: DestRow = {
      id: destIdFromName(name),
      name,
      country: known?.country ?? "FR",
      nights: 3,
    };
    setDestinations((prev) => [...prev, row]);
    setNewCityInput("");
  };

  const handleRemoveDest = (id: string) => {
    setDestinations((prev) => prev.filter((d) => d.id !== id));
  };

  const handleNightsChange = (id: string, nights: number) => {
    setDestinations((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, nights: Math.max(1, Math.min(30, nights)) } : d
      )
    );
  };

  // Action principale : relancer le calcul.
  const handleRecalculate = () => {
    if (!isValid || !isDirty) return;
    const newDestinations: Destination[] = destinations.map((d) => ({
      id: d.id,
      city: makeCity(d.name),
      nights: d.nights,
    }));
    updateTrip(trip.id, {
      name: name.trim(),
      startCity: makeCity(startCity),
      startDate,
      endDate,
      destinations: newDestinations,
      // Le statut passe en "draft" : il faut recalculer les alternatives.
      // (En vrai backend on relancerait l'optim — ici mock pure.)
      status: "draft",
      alternatives: [],
    });
    router.push(`/trip/${trip.id}/result`);
  };

  // Action destructive.
  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      // L'utilisateur doit cliquer une seconde fois pour confirmer.
      // Reset automatique après 5s pour ne pas bloquer la page.
      window.setTimeout(() => setConfirmDelete(false), 5000);
      return;
    }
    deleteTrip(trip.id);
    router.push("/");
  };

  const statusBadge =
    trip.status === "computed"
      ? "Recalcul nécessaire après modifs"
      : trip.status === "draft"
        ? "En cours de composition"
        : trip.status === "saved"
          ? "Sauvegardé"
          : "Partagé";

  const statusBadgeIsGold = trip.status === "computed";

  // DraftPreview attend des destinations { name } — on mappe.
  const previewDestinations = destinations.map((d) => ({ name: d.name }));

  return (
    <main data-route="voyage-dark" className="mx-auto w-full max-w-6xl px-6 pb-32 pt-10">
      {/* Breadcrumb */}
      <nav
        aria-label="Fil d'ariane"
        className="mb-8 flex items-center gap-3 text-[11px] uppercase tracking-[0.14em] text-ink-mute"
      >
        <Link href="/" className="transition-colors hover:text-ink-soft">
          Vos itinéraires
        </Link>
        <span aria-hidden>·</span>
        <Link
          href={`/trip/${trip.id}/result`}
          className="transition-colors hover:text-ink-soft"
        >
          {trip.name}
        </Link>
        <span aria-hidden>·</span>
        <span className="text-ink">Modifier</span>
      </nav>

      {/* Hero */}
      <section className="mb-12">
        <div className="mb-4 inline-flex items-center gap-2">
          <span
            aria-hidden
            className={
              statusBadgeIsGold
                ? "inline-block h-1 w-6 bg-[var(--gold)]"
                : "inline-block h-1 w-6 bg-[var(--terracotta)]"
            }
          />
          <span
            className={[
              "text-[13px]",
              statusBadgeIsGold
                ? "text-[var(--gold)]"
                : "text-ink-mute",
            ].join(" ")}
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
            }}
          >
            {statusBadge}
          </span>
        </div>
        <h1
          className="text-[clamp(40px,6vw,68px)] leading-[0.98] tracking-[-0.015em] text-ink"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Affinez votre{" "}
          <span style={{ fontStyle: "italic" }} className="text-[var(--terracotta-ink)]">
            voyage.
          </span>
        </h1>
        <p
          className="mt-5 max-w-xl text-[16px] leading-[1.55] text-ink-soft"
          style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
        >
          Modifiez ce que vous voulez. Les changements relancent l&apos;optimisation.
        </p>
      </section>

      {/* Grid 12-col : sections 8 / preview 4 */}
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 space-y-7 lg:col-span-8">
          {/* Section 1 — Infos générales */}
          <section
            aria-labelledby="section-infos"
            className="rounded-[18px] border border-line bg-surface p-6 md:p-7"
          >
            <header className="mb-5 flex items-baseline justify-between gap-3">
              <h2
                id="section-infos"
                className="text-[22px] tracking-tight text-ink"
                style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
              >
                Infos générales
              </h2>
              <span className="text-[11px] uppercase tracking-[0.12em] text-ink-mute">
                Cadre du voyage
              </span>
            </header>

            <div className="space-y-6">
              <FormField
                id="edit-name"
                label="Nom du voyage"
                helper="Donnez-lui le nom qui vous parle."
                error={errors.name}
              >
                <input
                  id="edit-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="off"
                  aria-invalid={Boolean(errors.name)}
                  className={inputClass(Boolean(errors.name))}
                />
              </FormField>

              <FormField
                id="edit-start-city"
                label="Ville de départ"
                helper="Point initial du calcul d'itinéraire."
                error={errors.startCity}
              >
                <input
                  id="edit-start-city"
                  type="text"
                  value={startCity}
                  onChange={(e) => setStartCity(e.target.value)}
                  autoComplete="off"
                  list="edit-start-city-suggestions"
                  aria-invalid={Boolean(errors.startCity)}
                  className={inputClass(Boolean(errors.startCity))}
                />
                <datalist id="edit-start-city-suggestions">
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
                  id="edit-start-date"
                  label="Date de départ"
                  helper="Jour où le voyage commence."
                  error={errors.startDate}
                >
                  <input
                    id="edit-start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    aria-invalid={Boolean(errors.startDate)}
                    className={inputClass(Boolean(errors.startDate))}
                  />
                </FormField>

                <FormField
                  id="edit-end-date"
                  label="Date de retour"
                  helper="Doit suivre la date de départ."
                  error={errors.endDate}
                >
                  <input
                    id="edit-end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || undefined}
                    aria-invalid={Boolean(errors.endDate)}
                    className={inputClass(Boolean(errors.endDate))}
                  />
                </FormField>
              </div>
            </div>
          </section>

          {/* Section 2 — Destinations */}
          <section
            aria-labelledby="section-destinations"
            className="rounded-[18px] border border-line bg-surface p-6 md:p-7"
          >
            <header className="mb-5 flex items-baseline justify-between gap-3">
              <h2
                id="section-destinations"
                className="text-[22px] tracking-tight text-ink"
                style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
              >
                Destinations
              </h2>
              <span className="text-[11px] uppercase tracking-[0.12em] text-ink-mute">
                {destinations.length} étape
                {destinations.length > 1 ? "s" : ""}
              </span>
            </header>

            {destinations.length === 0 ? (
              <p
                className="rounded-[12px] border border-dashed border-line bg-background px-4 py-5 text-[14px] text-ink-mute"
                style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
              >
                Aucune destination pour l&apos;instant — ajoutez-en une ci-dessous.
              </p>
            ) : (
              <ul className="space-y-2.5">
                {destinations.map((dest, idx) => {
                  const code = (CITY_DATALIST.find(
                    (c) => c.name.toLowerCase() === dest.name.toLowerCase()
                  )?.name ?? dest.name).slice(0, 3).toUpperCase();
                  return (
                    <li
                      key={dest.id}
                      className="grid grid-cols-12 items-center gap-3 rounded-[14px] border border-line bg-background px-4 py-3 transition-colors duration-180 ease-out hover:border-line-strong"
                    >
                      <div className="col-span-12 flex items-center gap-3 md:col-span-5">
                        <span
                          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--terracotta-soft)] text-[10px] tabular-nums text-[var(--terracotta-ink)]"
                          style={{ fontFamily: "var(--font-mono)" }}
                          aria-hidden
                        >
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <span
                          className="text-[13px] tracking-[0.04em] text-ink-soft tabular-nums"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          {code}
                        </span>
                        <span
                          className="text-[16px] text-ink"
                          style={{
                            fontFamily: "var(--font-display)",
                            fontStyle: "italic",
                          }}
                        >
                          {dest.name}
                        </span>
                        <span className="text-[11.5px] text-ink-mute">
                          · {dest.country}
                        </span>
                      </div>

                      <div className="col-span-7 flex items-center gap-2 md:col-span-5">
                        <label
                          htmlFor={`nights-${dest.id}`}
                          className="text-[12px] text-ink-mute"
                          style={{
                            fontFamily: "var(--font-display)",
                            fontStyle: "italic",
                          }}
                        >
                          Nuits sur place
                        </label>
                        <input
                          id={`nights-${dest.id}`}
                          type="number"
                          min={1}
                          max={30}
                          value={dest.nights}
                          onChange={(e) =>
                            handleNightsChange(
                              dest.id,
                              Number.parseInt(e.target.value, 10) || 1
                            )
                          }
                          className="h-9 w-16 rounded-md border border-line bg-card px-2 text-[13px] tabular-nums text-ink transition-[border-color,box-shadow] duration-180 ease-out hover:border-line-strong focus:border-[var(--terracotta)] focus:shadow-[0_0_0_2px_oklch(0.62_0.155_38_/_0.16)] focus:outline-none"
                          style={{ fontFamily: "var(--font-mono)" }}
                        />
                      </div>

                      <div className="col-span-5 flex justify-end md:col-span-2">
                        <button
                          type="button"
                          onClick={() => handleRemoveDest(dest.id)}
                          className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[12px] text-ink-mute transition-colors duration-180 ease-out hover:bg-[var(--terracotta-soft)] hover:text-[var(--terracotta-ink)] active:scale-[0.97]"
                          aria-label={`Retirer ${dest.name} du voyage`}
                        >
                          <span aria-hidden>−</span>
                          <span>Retirer</span>
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Form ajout — datalist 18 villes connues */}
            <form
              onSubmit={handleAddDestination}
              className="mt-5 flex flex-wrap items-end gap-3 border-t border-line pt-5"
            >
              <div className="flex-1 min-w-[200px]">
                <label
                  htmlFor="edit-add-city"
                  className="mb-2 block text-[13px] text-ink-soft"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontStyle: "italic",
                  }}
                >
                  Ajouter une ville
                </label>
                <input
                  id="edit-add-city"
                  type="text"
                  value={newCityInput}
                  onChange={(e) => setNewCityInput(e.target.value)}
                  placeholder="Rome, Berlin, Lisbonne…"
                  autoComplete="off"
                  list="edit-add-city-suggestions"
                  className={inputClass(false)}
                />
                <datalist id="edit-add-city-suggestions">
                  {CITY_DATALIST.map((c) => (
                    <option key={c.name} value={c.name} />
                  ))}
                </datalist>
              </div>
              <button
                type="submit"
                disabled={!newCityInput.trim()}
                className="inline-flex h-12 items-center gap-2 rounded-full border border-line bg-card px-5 text-[13.5px] text-ink-soft transition-colors duration-180 ease-out hover:border-line-strong hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span aria-hidden>+</span>
                <span>Ajouter</span>
              </button>
            </form>

            {destinations.length > 1 && (
              <div className="mt-4 flex items-center justify-between gap-3 text-[12.5px]">
                <span
                  className="text-ink-mute"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontStyle: "italic",
                  }}
                >
                  L&apos;ordre optimal sera recalculé après modifs.
                </span>
                <button
                  type="button"
                  className="text-ink-soft underline decoration-[var(--gold)] decoration-2 underline-offset-4 transition-colors duration-180 ease-out hover:text-ink"
                  aria-disabled
                  title="Bientôt — édition manuelle de l'ordre"
                >
                  Modifier l&apos;ordre
                </button>
              </div>
            )}
          </section>

          {/* Section 3 — Contraintes (résumé éditable) */}
          <section
            aria-labelledby="section-constraints"
            className="rounded-[18px] border border-line bg-surface p-6 md:p-7"
          >
            <header className="mb-5 flex items-baseline justify-between gap-3">
              <h2
                id="section-constraints"
                className="text-[22px] tracking-tight text-ink"
                style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
              >
                Contraintes
              </h2>
              <Link
                href={`/trip/${trip.id}/constraints`}
                className="text-[12.5px] text-ink-soft underline decoration-[var(--gold)] decoration-2 underline-offset-4 transition-colors duration-180 ease-out hover:text-ink"
              >
                Tout détailler
              </Link>
            </header>

            {/* Toggle ordre */}
            <div className="mb-5 flex items-center justify-between gap-4 rounded-[14px] border border-line bg-background px-4 py-3.5">
              <div>
                <div
                  className="text-[15px] text-ink"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontStyle: "italic",
                  }}
                >
                  {followInputOrder
                    ? "Suivre l'ordre saisi"
                    : "Laisser optimiser"}
                </div>
                <div className="mt-0.5 text-[12px] text-ink-mute">
                  {followInputOrder
                    ? "Les villes seront visitées dans l'ordre listé ci-dessus."
                    : "L'algorithme choisit le meilleur enchaînement."}
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={followInputOrder}
                onClick={() => setFollowInputOrder((v) => !v)}
                className={[
                  "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-200 ease-out",
                  followInputOrder
                    ? "bg-[var(--terracotta)]"
                    : "bg-[var(--line-strong)]",
                ].join(" ")}
              >
                <span
                  aria-hidden
                  className={[
                    "inline-block h-5 w-5 transform rounded-full bg-[oklch(0.99_0.005_80)] shadow-[0_2px_4px_oklch(0.215_0.028_38_/_0.2)] transition-transform duration-200 ease-out",
                    followInputOrder ? "translate-x-6" : "translate-x-1",
                  ].join(" ")}
                />
              </button>
            </div>

            {/* Micro-rows par destination */}
            {destinations.length === 0 ? (
              <p
                className="text-[13px] text-ink-mute"
                style={{
                  fontFamily: "var(--font-display)",
                  fontStyle: "italic",
                }}
              >
                Ajoutez des destinations pour y attacher des contraintes.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {destinations.map((dest, idx) => {
                  // Mock : première étape souple, sinon souple
                  const constraintLabel =
                    idx === 0 ? "première étape" : "souple";
                  return (
                    <li
                      key={dest.id}
                      className="flex items-center justify-between gap-3 px-1 py-2 text-[13.5px]"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span
                          aria-hidden
                          className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--line-strong)]"
                        />
                        <span
                          className="text-ink"
                          style={{
                            fontFamily: "var(--font-display)",
                            fontStyle: "italic",
                          }}
                        >
                          {dest.name}
                        </span>
                        <span
                          className="text-[12px] text-ink-mute"
                          style={{
                            fontFamily: "var(--font-display)",
                            fontStyle: "italic",
                          }}
                        >
                          — {constraintLabel}
                        </span>
                      </div>
                      <Link
                        href={`/trip/${trip.id}/constraints`}
                        className="text-[12px] text-ink-soft underline decoration-[var(--terracotta-soft)] decoration-1 underline-offset-4 transition-colors duration-180 ease-out hover:text-ink hover:decoration-[var(--gold)]"
                      >
                        Modifier
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* CTA bas — bloc d'actions */}
          <div className="space-y-4 border-t border-line pt-7">
            {isDirty && (
              <div
                role="status"
                className="flex items-start gap-2.5 rounded-[12px] border border-[var(--terracotta-soft)] bg-[var(--surface)] px-4 py-3"
              >
                <span
                  aria-hidden
                  className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--terracotta)]"
                />
                <p
                  className="text-[13.5px] text-[var(--terracotta-ink)]"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontStyle: "italic",
                  }}
                >
                  Vous avez des changements non enregistrés.
                </p>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleRecalculate}
                  disabled={!isValid || !isDirty}
                  className={[
                    "inline-flex h-12 items-center gap-2.5 rounded-full px-6 text-[14px] font-medium",
                    "bg-[var(--terracotta)] text-[oklch(0.99_0.005_80)]",
                    "shadow-[0_10px_22px_-12px_oklch(0.42_0.13_35_/_0.5)]",
                    "transition-transform duration-200 ease-out",
                    "hover:not(:disabled):scale-[1.02] active:not(:disabled):scale-[0.98]",
                    "disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none",
                  ].join(" ")}
                >
                  <span
                    aria-hidden
                    className="text-[15px] leading-none"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    ↻
                  </span>
                  <span>Relancer le calcul</span>
                </button>

                {trip.alternatives.length > 0 && (
                  <Link
                    href={`/trip/${trip.id}/result`}
                    className="text-[14px] text-ink-soft underline decoration-[var(--gold)] decoration-2 underline-offset-4 transition-colors duration-180 ease-out hover:text-ink"
                  >
                    Voir l&apos;itinéraire actuel
                  </Link>
                )}
              </div>

              <button
                type="button"
                onClick={handleDelete}
                className={[
                  "text-[12.5px] transition-colors duration-180 ease-out",
                  confirmDelete
                    ? "text-[var(--terracotta-ink)] underline decoration-[var(--terracotta)] decoration-1 underline-offset-4"
                    : "text-ink-mute hover:text-ink-soft",
                ].join(" ")}
                style={{
                  fontFamily: "var(--font-display)",
                  fontStyle: "italic",
                }}
              >
                {confirmDelete
                  ? "Cliquez à nouveau pour confirmer"
                  : "Supprimer ce voyage"}
              </button>
            </div>
          </div>
        </div>

        {/* DraftPreview sticky col-span-4 */}
        <div className="col-span-12 lg:col-span-4">
          <div className="lg:sticky lg:top-24">
            <DraftPreview
              name={name}
              startCity={startCity}
              startDate={startDate}
              endDate={endDate}
              destinations={previewDestinations}
              badge="ÉDITION EN COURS"
              emptyHint="Reflète vos modifications en direct."
            />
            <p
              className="mt-4 px-2 text-[12px] text-ink-mute"
              style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
            >
              Chaque modif rafraîchit l&apos;aperçu — le calcul, lui, attend
              votre signal.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
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
  );
}
