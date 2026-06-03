/**
 * Types contraintes voyage-pivot — extension non-invasive du type Trip.
 *
 * Le mock Trip (src/mocks/trips.ts) n'inclut pas encore de champ `constraints`
 * — c'est volontaire, la cascade frontend les stocke en local pour ce mock,
 * sans toucher au schéma central.
 *
 * Voice spec :
 *  - "ordre" = ordre des destinations (peut être fixé ou laissé libre)
 *  - "pinned" = bloquer une ville en première OU dernière étape
 *  - dates "fixes" = ancrages explicites ; vide = SmartTraveler optimise.
 */

export type DestinationPin = "first" | "last" | null;

export type DestinationConstraint = {
  /** id de la destination dans Trip.destinations */
  destinationId: string;
  /** Date d'arrivée fixe (ISO YYYY-MM-DD). Vide = libre. */
  arrivalDate?: string;
  /** Date de départ fixe (ISO YYYY-MM-DD). Vide = libre. */
  departureDate?: string;
  /** Position fixée : première étape, dernière étape, ou souple. */
  pinned?: DestinationPin;
};

export type TripConstraints = {
  /**
   * true  = l'utilisateur veut conserver l'ordre saisi sur l'écran précédent.
   * false = SmartTraveler peut réordonner pour optimiser coût/temps/CO₂.
   */
  strictOrder: boolean;
  perDestination: DestinationConstraint[];
};

/**
 * Construit un état initial vide à partir des destinations existantes du trip.
 * Toutes les villes démarrent en "Souple", sans dates fixées.
 */
export function buildInitialConstraints(
  destinationIds: string[]
): TripConstraints {
  return {
    strictOrder: true,
    perDestination: destinationIds.map((id) => ({
      destinationId: id,
      arrivalDate: undefined,
      departureDate: undefined,
      pinned: null,
    })),
  };
}

/**
 * true si aucune contrainte stricte n'est posée (pas de pin, pas de date).
 * Utilisé pour afficher l'empty state "Aucune contrainte stricte".
 */
export function hasNoStrictConstraints(c: TripConstraints): boolean {
  return c.perDestination.every(
    (d) => !d.arrivalDate && !d.departureDate && !d.pinned
  );
}

/**
 * Compte le nombre de contraintes posées (utile pour le badge DraftPreview).
 */
export function countConstraints(c: TripConstraints): number {
  return c.perDestination.reduce((acc, d) => {
    let n = 0;
    if (d.arrivalDate) n += 1;
    if (d.departureDate) n += 1;
    if (d.pinned) n += 1;
    return acc + n;
  }, 0);
}
