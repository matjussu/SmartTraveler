import { Fragment } from "react";

import type { AlternativeKind, Trip } from "@/mocks/trips";
import {
  formatCost,
  formatLongDuration,
  formatShortDuration,
  formatDateLong,
  formatCo2,
  transportLabel,
  tripDurationDays,
} from "@/lib/format";
import { cityCode } from "@/lib/cities-mock";
import "./boarding-pass-rich.css";

/**
 * Boarding Pass RICHE — port data-driven de claude_design/Boarding Pass.html.
 * Billet papier posé sur les pages noires /result et /recap : itinéraire calculé
 * + 3 tarifs + CO₂ + code-barres. Composant présentation pure (pas de hooks).
 */

const KIND_ORDER: AlternativeKind[] = ["cheapest", "fastest", "eco"];

// Patron de barres déterministe (décoratif) — vertical dans le stub.
const BARS = [
  3, 2, 1, 2, 2, 1, 3, 1, 2, 3, 1, 1, 2, 2, 1, 3, 1, 2, 2, 3, 3, 1, 2, 1, 2, 3,
  1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2, 2, 1, 3, 2, 1, 3, 2, 1, 2, 3, 1, 1, 2, 3, 2,
];
const BARS_TOTAL = BARS.reduce((a, b) => a + b, 0);

export type BoardingPassRichProps = {
  trip: Trip;
  /** Tarif mis en avant (bordure ambre). Optionnel (ex. recap = aucun). */
  activeKind?: AlternativeKind;
};

export function BoardingPassRich({ trip, activeKind }: BoardingPassRichProps) {
  const alts = KIND_ORDER.map((k) =>
    trip.alternatives.find((a) => a.kind === k)
  ).filter((a): a is NonNullable<typeof a> => Boolean(a));

  if (alts.length === 0) return null;

  const active = alts.find((a) => a.kind === activeKind) ?? alts[0];
  const minCost = Math.min(...alts.map((a) => a.totalCostEUR));
  const maxCo2 = Math.max(...alts.map((a) => a.totalCo2Kg));

  // Stops = départ → destinations (ordre de l'alternative active) → retour départ.
  const destById = new Map(trip.destinations.map((d) => [d.id, d]));
  const orderedCities = active.orderedDestinationIds
    .map((id) => destById.get(id)?.city)
    .filter((c): c is NonNullable<typeof c> => Boolean(c));
  const stops = [trip.startCity, ...orderedCities, trip.startCity];
  const legs = active.legs;

  const role = (i: number) =>
    i === 0 ? "Départ" : i === stops.length - 1 ? "Retour" : `Étape ${i}`;

  const tripRef = `${cityCode(trip.startCity.name)} ${trip.destinations.length}E ${Math.round(minCost)}`;
  const days = tripDurationDays(trip.startDate, trip.endDate);

  const tierTag = (kind: AlternativeKind, co2: number) => {
    if (kind === "cheapest") return { label: "Meilleur prix", leaf: false };
    if (kind === "eco") {
      const reduction = maxCo2 > 0 ? Math.round((1 - co2 / maxCo2) * 100) : 0;
      return reduction > 0
        ? { label: `−${reduction}% CO₂`, leaf: true }
        : null;
    }
    return null;
  };

  const tierHint = (legCount: number, modes: string[]) => {
    const uniq = Array.from(new Set(modes));
    return `${legCount} trajet${legCount > 1 ? "s" : ""} · ${uniq.join(", ")}`;
  };

  return (
    <article
      className="bpr"
      role="group"
      aria-label={`Billet voyage ${trip.name}`}
    >
      {/* MAIN */}
      <div className="bpr-main">
        <header className="bpr-header">
          <div>
            <p className="bpr-eyebrow">Itinéraire · {trip.startCity.name}</p>
            <h2 className="bpr-title">{trip.name}</h2>
            <p className="bpr-dates">
              <span>{formatDateLong(trip.startDate)}</span>
              <span className="bpr-sep">·</span>
              <span>
                {days} jour{days > 1 ? "s" : ""}
              </span>
              <span className="bpr-sep">·</span>
              <span>
                {trip.destinations.length} étape
                {trip.destinations.length > 1 ? "s" : ""}
              </span>
            </p>
          </div>
          <div className="bpr-price">
            <span className="bpr-price-label">À partir de</span>
            <span className="bpr-price-value">{formatCost(minCost)}</span>
          </div>
        </header>

        <hr className="bpr-rule" />

        {/* Itinéraire */}
        <section className="bpr-itinerary" aria-label="Itinéraire">
          {stops.map((stop, i) => (
            <Fragment key={i}>
              <div
                className={`bpr-stop${i === 0 || i === stops.length - 1 ? " end" : ""}`}
              >
                <span className="bpr-dot" aria-hidden />
                <span className="bpr-code">{cityCode(stop.name)}</span>
                <span className="bpr-role">{role(i)}</span>
              </div>
              {i < stops.length - 1 && legs[i] && (
                <div className="bpr-leg">
                  <span className="bpr-leg-meta">
                    <span className="bpr-leg-mode">
                      {transportLabel(legs[i].mode)}
                    </span>{" "}
                    · {formatShortDuration(legs[i].durationMinutes)}
                  </span>
                  <span className="bpr-line" aria-hidden />
                </div>
              )}
            </Fragment>
          ))}
        </section>

        <hr className="bpr-rule" />

        {/* Tarifs */}
        <p className="bpr-tiers-label">Choix du voyage</p>
        <div className="bpr-tiers" aria-label="Options de voyage">
          {alts.map((alt) => {
            const tag = tierTag(alt.kind, alt.totalCo2Kg);
            return (
              <div
                key={alt.id}
                className={`bpr-tier${alt.kind === active.kind ? " active" : ""}`}
              >
                <span>
                  <span className="bpr-tier-name">
                    {alt.label}
                    {tag && (
                      <span className={`bpr-tag${tag.leaf ? " leaf" : ""}`}>
                        {tag.label}
                      </span>
                    )}
                  </span>
                  <span className="bpr-tier-hint">
                    {tierHint(
                      alt.legs.length,
                      alt.legs.map((l) => transportLabel(l.mode))
                    )}
                  </span>
                </span>
                <span className="bpr-tier-meta">
                  <span className="bpr-tier-price">
                    {formatCost(alt.totalCostEUR)}
                  </span>
                  <span className="bpr-tier-dur">
                    {formatLongDuration(alt.totalDurationMinutes)}
                  </span>
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer CO₂ */}
        <footer className="bpr-footer">
          <span className="bpr-co2" title="Empreinte carbone — option affichée">
            <span className="bpr-num">{formatCo2(active.totalCo2Kg)}</span>
          </span>
        </footer>
      </div>

      {/* Perforation + STUB */}
      <span className="bpr-perf" aria-hidden />
      <span className="bpr-notch top" aria-hidden />
      <span className="bpr-notch bot" aria-hidden />

      <aside className="bpr-stub" aria-label="Référence du billet">
        <div className="bpr-stub-head">
          <div className="bpr-stub-tag">Boarding Pass</div>
          <div className="bpr-stub-title">{cityCode(trip.startCity.name)} · 2026</div>
        </div>

        <div className="bpr-barcode" aria-hidden>
          <div className="bpr-bars">
            {BARS.map((w, i) => (
              <i
                key={i}
                className={i % 2 === 1 ? "sp" : undefined}
                style={{ flex: `0 0 ${((w / BARS_TOTAL) * 100).toFixed(3)}%` }}
              />
            ))}
          </div>
          <div className="bpr-barcode-code">{tripRef}</div>
        </div>

        <div className="bpr-stub-grid">
          <div className="bpr-field">
            <span className="bpr-k">Départ</span>
            <span className="bpr-v">{trip.startCity.name}</span>
          </div>
          <div className="bpr-field">
            <span className="bpr-k">Durée</span>
            <span className="bpr-v">{days} j</span>
          </div>
          <div className="bpr-field">
            <span className="bpr-k">Étapes</span>
            <span className="bpr-v">{trip.destinations.length}</span>
          </div>
          <div className="bpr-field">
            <span className="bpr-k">Option</span>
            <span className="bpr-v">{active.label}</span>
          </div>
          <div className="bpr-field full">
            <span className="bpr-k">Référence</span>
            <span className="bpr-v">{tripRef}</span>
          </div>
        </div>
      </aside>
    </article>
  );
}
