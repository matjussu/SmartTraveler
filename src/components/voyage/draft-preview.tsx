"use client";

import { formatDateLong, tripDurationDays } from "@/lib/format";

/**
 * Preview live "billet en cours de composition" — sticky côté droit du
 * formulaire de création/édition de voyage. Mini-version du <BoardingTicket />,
 * adaptée à un état brouillon où certains champs peuvent encore manquer.
 *
 * Établi sur /trip/new (pilote cascade). Réutilisé tel quel sur
 * /trip/[id]/destinations, /trip/[id]/constraints, /trip/[id]/edit en
 * étendant via les props optionnelles (destinations, badge, hint).
 *
 * Voice spec : "Votre voyage prend forme ici" / "En cours de composition".
 * Pas de prix, pas d'alternatives — c'est un brouillon, pas un résultat.
 */

export type DraftPreviewProps = {
  /** Nom saisi par l'utilisateur (vide tant qu'il n'a rien tapé). */
  name?: string;
  /** Ville de départ (texte libre, pas encore typé). */
  startCity?: string;
  /** Date de départ ISO YYYY-MM-DD. */
  startDate?: string;
  /** Date de retour ISO YYYY-MM-DD. */
  endDate?: string;
  /**
   * Destinations déjà ajoutées (cascade : sur /destinations on aura des villes).
   * Pour /trip/new ce sera toujours vide.
   */
  destinations?: { name: string }[];
  /**
   * Surcharge du badge "EN COURS DE COMPOSITION" pour les écrans suivants
   * (ex. "DESTINATIONS À CHOISIR", "CONTRAINTES À POSER").
   */
  badge?: string;
  /**
   * Phrase d'aide remplaçant l'état vide quand l'utilisateur n'a pas encore
   * commencé à remplir. Par défaut : "Votre voyage prend forme ici".
   */
  emptyHint?: string;
};

function cityCode(name: string | undefined): string {
  if (!name) return "?";
  const trimmed = name.trim();
  if (!trimmed) return "?";
  // Codes 3 lettres approximatifs (cohérent avec <BoardingTicket />).
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
  // Normalisation : majuscule initiale pour matcher la map
  const normalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
  return map[normalized] ?? trimmed.slice(0, 3).toUpperCase();
}

function datesValid(startDate?: string, endDate?: string): boolean {
  if (!startDate || !endDate) return false;
  const s = new Date(startDate).getTime();
  const e = new Date(endDate).getTime();
  return Number.isFinite(s) && Number.isFinite(e) && e > s;
}

export function DraftPreview({
  name,
  startCity,
  startDate,
  endDate,
  destinations = [],
  badge = "En cours de composition",
  emptyHint = "Votre voyage prend forme ici",
}: DraftPreviewProps) {
  const hasName = Boolean(name && name.trim().length > 0);
  const hasStartCity = Boolean(startCity && startCity.trim().length > 0);
  const validDates = datesValid(startDate, endDate);
  const days = validDates ? tripDurationDays(startDate!, endDate!) : null;
  const stops = destinations.length;

  // Séquence de villes : départ → destinations → retour
  // Si pas de destinations, on affiche [départ, "?", retour] pour signaler
  // l'attente de l'écran suivant.
  const sequence: string[] = hasStartCity
    ? [
        startCity!,
        ...(stops > 0 ? destinations.map((d) => d.name) : ["—"]),
        startCity!,
      ]
    : [];

  return (
    <aside
      aria-label="Aperçu du voyage en cours de composition"
      className="boarding-ticket overflow-hidden"
    >
      {/* Bandeau supérieur — badge brouillon + nom du voyage */}
      <div className="px-6 pt-5 pb-4">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-ink-mute">
          <span
            aria-hidden
            className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--gold)]"
          />
          <span>{badge}</span>
        </div>

        {hasName ? (
          <h3
            className="mt-2 text-[24px] leading-[1.1] text-ink"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {name}
          </h3>
        ) : (
          <p
            className="mt-2 text-[18px] leading-[1.25] text-ink-mute"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {emptyHint}
          </p>
        )}
      </div>

      {/* Route / codes 3 lettres */}
      <div className="px-6 pb-4">
        {hasStartCity ? (
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
            {sequence.map((city, idx) => (
              <span key={`${city}-${idx}`} className="flex items-baseline gap-3">
                <span
                  className={
                    city === "—"
                      ? "text-[22px] tracking-[0.04em] text-ink-mute/70"
                      : "text-[22px] tracking-[0.04em] text-ink"
                  }
                  style={{ fontFamily: "var(--font-mono)", fontWeight: 500 }}
                >
                  {city === "—" ? "?" : cityCode(city)}
                </span>
                {idx < sequence.length - 1 && (
                  <span
                    aria-hidden
                    className="inline-block h-[1px] w-7 text-ink-mute route-line"
                  />
                )}
              </span>
            ))}
          </div>
        ) : (
          <div
            className="text-[15px] text-ink-mute"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Une ville de départ, et le billet s&apos;esquisse.
          </div>
        )}

        {hasStartCity && stops === 0 && (
          <p
            className="mt-2 text-[12px] text-ink-mute"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Les destinations viendront à l&apos;étape suivante.
          </p>
        )}
      </div>

      {/* Perforation */}
      <div className="ticket-perforation mx-6" />

      {/* Bas : dates + durée */}
      <div className="grid grid-cols-12 gap-3 px-6 py-5">
        <div className="col-span-7">
          <div className="text-[10px] uppercase tracking-[0.14em] text-ink-mute">
            Fenêtre de voyage
          </div>
          {validDates ? (
            <>
              <div
                className="mt-1 text-[14px] tracking-tight text-ink tabular-nums"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {formatDateLong(startDate!)}
              </div>
              <div className="text-[12px] text-ink-mute">au</div>
              <div
                className="text-[14px] tracking-tight text-ink tabular-nums"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {formatDateLong(endDate!)}
              </div>
            </>
          ) : (
            <p
              className="mt-1 text-[13px] text-ink-mute"
              style={{ fontFamily: "var(--font-display)" }}
            >
              À renseigner.
            </p>
          )}
        </div>

        <div className="col-span-5 flex flex-col items-end justify-between gap-2 border-l border-line pl-4">
          <div className="w-full text-right">
            <div className="text-[10px] uppercase tracking-[0.14em] text-ink-mute">
              Durée
            </div>
            <div
              className="mt-1 text-[20px] tracking-tight text-ink tabular-nums"
              style={{ fontFamily: "var(--font-mono)", fontWeight: 500 }}
            >
              {days !== null ? `${days} j` : "—"}
            </div>
          </div>
          <span
            className="text-[11px] tracking-[0.08em] text-ink-mute uppercase"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {stops > 0 ? `${stops} étape${stops > 1 ? "s" : ""}` : "à composer"}
          </span>
        </div>
      </div>
    </aside>
  );
}
