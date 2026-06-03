import { formatDateLong, tripDurationDays } from "@/lib/format";
import { cityCode } from "@/lib/cities-mock";
import "./boarding-pass-draft.css";

/**
 * Aperçu live BROUILLON de /trip/new — billet papier posé sur la home noire.
 *
 * Port simplifié de claude_design/Boarding Pass.html : on garde la signature
 * visuelle (eyebrow point ambre, codes mono, perforation, stub, code-barres)
 * mais SANS prix/tarifs/CO₂/itinéraire complet (le voyage n'est pas calculé).
 * Mêmes props que <DraftPreview> → se met à jour à chaque champ rempli.
 */

export type BoardingPassDraftProps = {
  name?: string;
  startCity?: string;
  startDate?: string;
  endDate?: string;
};

// Patron de barres déterministe (repris du mockup) — purement décoratif.
const BARCODE_WIDTHS = [
  3, 2, 1, 2, 2, 1, 3, 1, 2, 3, 1, 1, 2, 2, 1, 3, 1, 2, 2, 3, 3, 1, 2, 1, 2, 3,
  1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2, 2, 1, 3, 2, 1, 3, 2, 1, 2, 3, 1, 1, 2, 3, 2,
  1, 2, 3, 1, 2, 1, 3, 1,
];
const BARCODE_TOTAL = BARCODE_WIDTHS.reduce((a, b) => a + b, 0);

export function BoardingPassDraft({
  name,
  startCity,
  startDate,
  endDate,
}: BoardingPassDraftProps) {
  const trimmedName = name?.trim() ?? "";
  const trimmedCity = startCity?.trim() ?? "";
  const hasBothDates = Boolean(startDate && endDate);

  const startCode = trimmedCity ? cityCode(trimmedCity) : "?";
  const days = hasBothDates ? tripDurationDays(startDate!, endDate!) : 0;

  return (
    <div className="bp-draft" role="group" aria-label="Aperçu du voyage en composition">
      {/* MAIN */}
      <div className="bp-main">
        <p className="bp-eyebrow">En composition</p>

        <h3 className={`bp-title${trimmedName ? "" : " is-placeholder"}`}>
          {trimmedName || "Votre voyage"}
        </h3>

        {hasBothDates ? (
          <p className="bp-dates">
            <span>{formatDateLong(startDate!)}</span>
            <span className="bp-sep">·</span>
            <span>
              {days} jour{days > 1 ? "s" : ""}
            </span>
          </p>
        ) : (
          <p className="bp-dates is-placeholder">Dates à définir</p>
        )}

        <hr className="bp-rule" />

        {/* Itinéraire brouillon : départ → à venir */}
        <div className="bp-itinerary" aria-label="Itinéraire (en cours)">
          <div className="bp-stop">
            <span className="bp-dot" aria-hidden />
            <span className="bp-code">{startCode}</span>
            <span className="bp-role">Départ</span>
          </div>
          <div className="bp-leg">
            <span className="bp-leg-meta">à composer</span>
            <span className="bp-line" aria-hidden />
          </div>
          <div className="bp-stop is-pending">
            <span className="bp-dot" aria-hidden />
            <span className="bp-code">?</span>
            <span className="bp-role">Étape 1</span>
          </div>
        </div>

        <p className="bp-hint">Les destinations viendront à l’étape suivante.</p>
      </div>

      {/* Couture perforée */}
      <div className="bp-seam" aria-hidden>
        <span className="bp-notch left" />
        <span className="bp-notch right" />
      </div>

      {/* STUB */}
      <div className="bp-stub">
        <div className="bp-stub-head">
          <span className="bp-stub-tag">Boarding Pass</span>
          <span className="bp-stub-title">{startCode} · Brouillon</span>
        </div>

        <div className="bp-barcode" aria-hidden>
          <div className="bp-bars">
            {BARCODE_WIDTHS.map((w, i) => (
              <i
                key={i}
                className={i % 2 === 1 ? "bp-sp" : undefined}
                style={{ flex: `0 0 ${((w / BARCODE_TOTAL) * 100).toFixed(3)}%` }}
              />
            ))}
          </div>
        </div>

        <div className="bp-stub-grid">
          <div className="bp-field">
            <span className="bp-k">Départ</span>
            <span className="bp-v">{trimmedCity || "—"}</span>
          </div>
          <div className="bp-field">
            <span className="bp-k">Statut</span>
            <span className="bp-v">Brouillon</span>
          </div>
          <div className="bp-field">
            <span className="bp-k">Du</span>
            <span className="bp-v">{startDate ? formatDateLong(startDate) : "—"}</span>
          </div>
          <div className="bp-field">
            <span className="bp-k">Au</span>
            <span className="bp-v">{endDate ? formatDateLong(endDate) : "—"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
