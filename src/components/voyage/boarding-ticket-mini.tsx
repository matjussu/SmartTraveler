import { Fragment } from "react";
import Link from "next/link";

import type { Trip } from "@/mocks/trips";
import { formatCost, formatDateShort } from "@/lib/format";
import { cityCode } from "@/lib/cities-mock";
import "./boarding-ticket-mini.css";

/**
 * Mini billet d'embarquement — carte de voyage pour la liste /itineraires.
 * Présentation pure. Lien vers le résultat (voyage calculé) ou le récap (brouillon).
 */

const STATUS_LABEL: Record<Trip["status"], string> = {
  draft: "Brouillon",
  computed: "Itinéraire prêt",
  saved: "Sauvegardé",
  shared: "Partagé",
};

export function BoardingTicketMini({ trip }: { trip: Trip }) {
  const isDraft = trip.alternatives.length === 0;
  const minCost = isDraft
    ? null
    : Math.min(...trip.alternatives.map((a) => a.totalCostEUR));

  // Itinéraire compact : départ + destinations (codes 3 lettres).
  const codes = [
    trip.startCity.name,
    ...trip.destinations.map((d) => d.city.name),
  ].map(cityCode);

  const href = isDraft
    ? `/trip/${trip.id}/recap`
    : `/trip/${trip.id}/result`;

  return (
    <Link href={href} className="btm" aria-label={`Voyage ${trip.name}`}>
      <div className="btm-top">
        <span className="btm-eyebrow">{STATUS_LABEL[trip.status]}</span>
        {minCost !== null ? (
          <span className="btm-price">
            <span className="btm-from">dès</span>
            {formatCost(minCost)}
          </span>
        ) : (
          <span className="btm-price draft">À composer</span>
        )}
      </div>

      <h3 className="btm-title">{trip.name}</h3>

      <div className="btm-route" aria-label="Itinéraire">
        {codes.map((code, i) => (
          <Fragment key={i}>
            {i > 0 && (
              <span className="btm-arrow" aria-hidden>
                →
              </span>
            )}
            <span>{code}</span>
          </Fragment>
        ))}
      </div>

      <div className="btm-rule" aria-hidden />

      <div className="btm-foot">
        <span>
          {trip.destinations.length} étape
          {trip.destinations.length > 1 ? "s" : ""} ·{" "}
          {formatDateShort(trip.startDate)}
        </span>
        <span className="btm-go">
          Ouvrir
          <span aria-hidden>→</span>
        </span>
      </div>
    </Link>
  );
}
