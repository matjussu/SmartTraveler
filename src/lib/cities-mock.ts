/**
 * Catalogue mock de villes européennes pour la sélection de destinations.
 *
 * Utilisé par /trip/[id]/destinations (autocomplete + résolution
 * d'une ville saisie vers un City complet). Pour les villes hors
 * catalogue, on fallback sur { country: "??", coordinates: 0,0 }
 * — c'est un mock, pas une vraie API geocoding.
 *
 * Le code IATA-like (3 lettres) est aussi exposé pour rester cohérent
 * avec <BoardingTicket /> et <DraftPreview /> sur l'affichage "billet".
 */

import type { City } from "@/mocks/trips";

export type CityMockEntry = {
  city: City;
  /** Code 3 lettres affiché en mono uppercase (style boarding pass). */
  code: string;
};

/**
 * 20 villes européennes — couverture représentative pour un mock B2C.
 * Coordonnées = centroïde ville approximatif.
 */
export const CITY_CATALOG: CityMockEntry[] = [
  {
    code: "PAR",
    city: { name: "Paris", country: "FR", coordinates: { lat: 48.8566, lng: 2.3522 } },
  },
  {
    code: "ROM",
    city: { name: "Rome", country: "IT", coordinates: { lat: 41.9028, lng: 12.4964 } },
  },
  {
    code: "BCN",
    city: { name: "Barcelone", country: "ES", coordinates: { lat: 41.3851, lng: 2.1734 } },
  },
  {
    code: "MAD",
    city: { name: "Madrid", country: "ES", coordinates: { lat: 40.4168, lng: -3.7038 } },
  },
  {
    code: "LIS",
    city: { name: "Lisbonne", country: "PT", coordinates: { lat: 38.7223, lng: -9.1393 } },
  },
  {
    code: "BER",
    city: { name: "Berlin", country: "DE", coordinates: { lat: 52.52, lng: 13.405 } },
  },
  {
    code: "MUC",
    city: { name: "Munich", country: "DE", coordinates: { lat: 48.1351, lng: 11.582 } },
  },
  {
    code: "VIE",
    city: { name: "Vienne", country: "AT", coordinates: { lat: 48.2082, lng: 16.3738 } },
  },
  {
    code: "PRG",
    city: { name: "Prague", country: "CZ", coordinates: { lat: 50.0755, lng: 14.4378 } },
  },
  {
    code: "BUD",
    city: { name: "Budapest", country: "HU", coordinates: { lat: 47.4979, lng: 19.0402 } },
  },
  {
    code: "AMS",
    city: { name: "Amsterdam", country: "NL", coordinates: { lat: 52.3676, lng: 4.9041 } },
  },
  {
    code: "BRU",
    city: { name: "Bruxelles", country: "BE", coordinates: { lat: 50.8503, lng: 4.3517 } },
  },
  {
    code: "CPH",
    city: { name: "Copenhague", country: "DK", coordinates: { lat: 55.6761, lng: 12.5683 } },
  },
  {
    code: "STO",
    city: { name: "Stockholm", country: "SE", coordinates: { lat: 59.3293, lng: 18.0686 } },
  },
  {
    code: "ATH",
    city: { name: "Athènes", country: "GR", coordinates: { lat: 37.9838, lng: 23.7275 } },
  },
  {
    code: "IST",
    city: { name: "Istanbul", country: "TR", coordinates: { lat: 41.0082, lng: 28.9784 } },
  },
  {
    code: "MRS",
    city: { name: "Marseille", country: "FR", coordinates: { lat: 43.2965, lng: 5.3698 } },
  },
  {
    code: "LYS",
    city: { name: "Lyon", country: "FR", coordinates: { lat: 45.764, lng: 4.8357 } },
  },
  {
    code: "BOD",
    city: { name: "Bordeaux", country: "FR", coordinates: { lat: 44.8378, lng: -0.5792 } },
  },
  {
    code: "EDI",
    city: { name: "Édimbourg", country: "GB", coordinates: { lat: 55.9533, lng: -3.1883 } },
  },
];

/**
 * Index nom → entry pour résolution rapide (insensitive au cassing
 * et aux accents — l'utilisateur tape librement).
 */
function normalizeKey(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

const INDEX = new Map<string, CityMockEntry>(
  CITY_CATALOG.map((entry) => [normalizeKey(entry.city.name), entry])
);

/**
 * Résout un nom saisi en City complet.
 * Si la ville est connue → retourne le catalogue.
 * Sinon → fallback minimal (pays "??", coordonnées 0,0).
 */
export function resolveCity(rawName: string): City {
  const key = normalizeKey(rawName);
  const found = INDEX.get(key);
  if (found) return found.city;
  // Capitalisation simple pour conserver le nom saisi proprement
  const display = rawName.trim().charAt(0).toUpperCase() + rawName.trim().slice(1);
  return {
    name: display,
    country: "??",
    coordinates: { lat: 0, lng: 0 },
  };
}

/**
 * Code 3 lettres d'une ville (catalogue si connue, sinon 3 premières
 * lettres en uppercase).
 */
export function cityCode(name: string): string {
  const key = normalizeKey(name);
  const found = INDEX.get(key);
  if (found) return found.code;
  return name.trim().slice(0, 3).toUpperCase();
}
