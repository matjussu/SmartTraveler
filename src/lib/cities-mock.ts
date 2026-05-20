/**
 * Catalogue mock de villes pour la sélection ville de départ / destinations.
 *
 * Utilisé par /trip/new (ville de départ) et /trip/[id]/destinations
 * (autocomplete + résolution ville saisie vers un City complet).
 *
 * Couverture : ~70 villes — EU élargie + Asie + Amériques + Afrique + Océanie.
 * Pour les villes hors catalogue, on fallback sur { country: "??",
 * coordinates: 0,0 } — c'est un mock, pas une vraie API geocoding.
 *
 * Code 3 lettres (IATA quand existant, sinon proxy mémorisable) — exposé
 * pour rester cohérent avec <BoardingTicket /> et <DraftPreview />.
 */

import type { City } from "@/mocks/trips";

export type CityMockEntry = {
  city: City;
  /** Code 3 lettres affiché en mono uppercase (style boarding pass). */
  code: string;
};

/**
 * Catalogue. Coordonnées = centroïde ville approximatif.
 */
export const CITY_CATALOG: CityMockEntry[] = [
  // ─────────── Europe — Ouest ──────────────────────────────────────────────
  { code: "PAR", city: { name: "Paris", country: "FR", coordinates: { lat: 48.8566, lng: 2.3522 } } },
  { code: "LYS", city: { name: "Lyon", country: "FR", coordinates: { lat: 45.764, lng: 4.8357 } } },
  { code: "MRS", city: { name: "Marseille", country: "FR", coordinates: { lat: 43.2965, lng: 5.3698 } } },
  { code: "BOD", city: { name: "Bordeaux", country: "FR", coordinates: { lat: 44.8378, lng: -0.5792 } } },
  { code: "NCE", city: { name: "Nice", country: "FR", coordinates: { lat: 43.7102, lng: 7.262 } } },
  { code: "BRU", city: { name: "Bruxelles", country: "BE", coordinates: { lat: 50.8503, lng: 4.3517 } } },
  { code: "AMS", city: { name: "Amsterdam", country: "NL", coordinates: { lat: 52.3676, lng: 4.9041 } } },
  { code: "LON", city: { name: "Londres", country: "GB", coordinates: { lat: 51.5074, lng: -0.1278 } } },
  { code: "EDI", city: { name: "Édimbourg", country: "GB", coordinates: { lat: 55.9533, lng: -3.1883 } } },
  { code: "MAN", city: { name: "Manchester", country: "GB", coordinates: { lat: 53.4808, lng: -2.2426 } } },
  { code: "DUB", city: { name: "Dublin", country: "IE", coordinates: { lat: 53.3498, lng: -6.2603 } } },
  { code: "GVA", city: { name: "Genève", country: "CH", coordinates: { lat: 46.2044, lng: 6.1432 } } },
  { code: "ZRH", city: { name: "Zurich", country: "CH", coordinates: { lat: 47.3769, lng: 8.5417 } } },
  { code: "BSL", city: { name: "Bâle", country: "CH", coordinates: { lat: 47.5596, lng: 7.5886 } } },

  // ─────────── Europe — Sud ────────────────────────────────────────────────
  { code: "ROM", city: { name: "Rome", country: "IT", coordinates: { lat: 41.9028, lng: 12.4964 } } },
  { code: "FLR", city: { name: "Florence", country: "IT", coordinates: { lat: 43.7696, lng: 11.2558 } } },
  { code: "VCE", city: { name: "Venise", country: "IT", coordinates: { lat: 45.4408, lng: 12.3155 } } },
  { code: "NAP", city: { name: "Naples", country: "IT", coordinates: { lat: 40.8518, lng: 14.2681 } } },
  { code: "MIL", city: { name: "Milan", country: "IT", coordinates: { lat: 45.4642, lng: 9.19 } } },
  { code: "BCN", city: { name: "Barcelone", country: "ES", coordinates: { lat: 41.3851, lng: 2.1734 } } },
  { code: "MAD", city: { name: "Madrid", country: "ES", coordinates: { lat: 40.4168, lng: -3.7038 } } },
  { code: "SVQ", city: { name: "Séville", country: "ES", coordinates: { lat: 37.3891, lng: -5.9845 } } },
  { code: "VLC", city: { name: "Valence", country: "ES", coordinates: { lat: 39.4699, lng: -0.3763 } } },
  { code: "LIS", city: { name: "Lisbonne", country: "PT", coordinates: { lat: 38.7223, lng: -9.1393 } } },
  { code: "OPO", city: { name: "Porto", country: "PT", coordinates: { lat: 41.1579, lng: -8.6291 } } },
  { code: "ATH", city: { name: "Athènes", country: "GR", coordinates: { lat: 37.9838, lng: 23.7275 } } },

  // ─────────── Europe — Centre / Est ───────────────────────────────────────
  { code: "BER", city: { name: "Berlin", country: "DE", coordinates: { lat: 52.52, lng: 13.405 } } },
  { code: "MUC", city: { name: "Munich", country: "DE", coordinates: { lat: 48.1351, lng: 11.582 } } },
  { code: "HAM", city: { name: "Hambourg", country: "DE", coordinates: { lat: 53.5511, lng: 9.9937 } } },
  { code: "FRA", city: { name: "Francfort", country: "DE", coordinates: { lat: 50.1109, lng: 8.6821 } } },
  { code: "VIE", city: { name: "Vienne", country: "AT", coordinates: { lat: 48.2082, lng: 16.3738 } } },
  { code: "PRG", city: { name: "Prague", country: "CZ", coordinates: { lat: 50.0755, lng: 14.4378 } } },
  { code: "BUD", city: { name: "Budapest", country: "HU", coordinates: { lat: 47.4979, lng: 19.0402 } } },
  { code: "WAW", city: { name: "Varsovie", country: "PL", coordinates: { lat: 52.2297, lng: 21.0122 } } },
  { code: "KRK", city: { name: "Cracovie", country: "PL", coordinates: { lat: 50.0647, lng: 19.945 } } },
  { code: "IST", city: { name: "Istanbul", country: "TR", coordinates: { lat: 41.0082, lng: 28.9784 } } },

  // ─────────── Europe — Nord ───────────────────────────────────────────────
  { code: "CPH", city: { name: "Copenhague", country: "DK", coordinates: { lat: 55.6761, lng: 12.5683 } } },
  { code: "STO", city: { name: "Stockholm", country: "SE", coordinates: { lat: 59.3293, lng: 18.0686 } } },
  { code: "OSL", city: { name: "Oslo", country: "NO", coordinates: { lat: 59.9139, lng: 10.7522 } } },
  { code: "HEL", city: { name: "Helsinki", country: "FI", coordinates: { lat: 60.1699, lng: 24.9384 } } },
  { code: "REK", city: { name: "Reykjavik", country: "IS", coordinates: { lat: 64.1466, lng: -21.9426 } } },

  // ─────────── Asie ────────────────────────────────────────────────────────
  { code: "TYO", city: { name: "Tokyo", country: "JP", coordinates: { lat: 35.6762, lng: 139.6503 } } },
  { code: "KIX", city: { name: "Kyoto", country: "JP", coordinates: { lat: 35.0116, lng: 135.7681 } } },
  { code: "SEL", city: { name: "Séoul", country: "KR", coordinates: { lat: 37.5665, lng: 126.978 } } },
  { code: "BKK", city: { name: "Bangkok", country: "TH", coordinates: { lat: 13.7563, lng: 100.5018 } } },
  { code: "SIN", city: { name: "Singapour", country: "SG", coordinates: { lat: 1.3521, lng: 103.8198 } } },
  { code: "DPS", city: { name: "Bali", country: "ID", coordinates: { lat: -8.3405, lng: 115.092 } } },
  { code: "HKG", city: { name: "Hong Kong", country: "HK", coordinates: { lat: 22.3193, lng: 114.1694 } } },
  { code: "SHA", city: { name: "Shanghai", country: "CN", coordinates: { lat: 31.2304, lng: 121.4737 } } },
  { code: "PEK", city: { name: "Pékin", country: "CN", coordinates: { lat: 39.9042, lng: 116.4074 } } },
  { code: "BOM", city: { name: "Bombay", country: "IN", coordinates: { lat: 19.076, lng: 72.8777 } } },
  { code: "DEL", city: { name: "Delhi", country: "IN", coordinates: { lat: 28.6139, lng: 77.209 } } },
  { code: "DXB", city: { name: "Dubaï", country: "AE", coordinates: { lat: 25.2048, lng: 55.2708 } } },
  { code: "TLV", city: { name: "Tel-Aviv", country: "IL", coordinates: { lat: 32.0853, lng: 34.7818 } } },

  // ─────────── Amériques — Nord ────────────────────────────────────────────
  { code: "NYC", city: { name: "New York", country: "US", coordinates: { lat: 40.7128, lng: -74.006 } } },
  { code: "BOS", city: { name: "Boston", country: "US", coordinates: { lat: 42.3601, lng: -71.0589 } } },
  { code: "LAX", city: { name: "Los Angeles", country: "US", coordinates: { lat: 34.0522, lng: -118.2437 } } },
  { code: "SFO", city: { name: "San Francisco", country: "US", coordinates: { lat: 37.7749, lng: -122.4194 } } },
  { code: "YMQ", city: { name: "Montréal", country: "CA", coordinates: { lat: 45.5017, lng: -73.5673 } } },
  { code: "YTO", city: { name: "Toronto", country: "CA", coordinates: { lat: 43.6532, lng: -79.3832 } } },
  { code: "YVR", city: { name: "Vancouver", country: "CA", coordinates: { lat: 49.2827, lng: -123.1207 } } },
  { code: "MEX", city: { name: "Mexico", country: "MX", coordinates: { lat: 19.4326, lng: -99.1332 } } },

  // ─────────── Amériques — Sud ─────────────────────────────────────────────
  { code: "SAO", city: { name: "São Paulo", country: "BR", coordinates: { lat: -23.5505, lng: -46.6333 } } },
  { code: "RIO", city: { name: "Rio de Janeiro", country: "BR", coordinates: { lat: -22.9068, lng: -43.1729 } } },
  { code: "BUE", city: { name: "Buenos Aires", country: "AR", coordinates: { lat: -34.6037, lng: -58.3816 } } },
  { code: "LIM", city: { name: "Lima", country: "PE", coordinates: { lat: -12.0464, lng: -77.0428 } } },

  // ─────────── Afrique ─────────────────────────────────────────────────────
  { code: "CAI", city: { name: "Le Caire", country: "EG", coordinates: { lat: 30.0444, lng: 31.2357 } } },
  { code: "RAK", city: { name: "Marrakech", country: "MA", coordinates: { lat: 31.6295, lng: -7.9811 } } },
  { code: "CAS", city: { name: "Casablanca", country: "MA", coordinates: { lat: 33.5731, lng: -7.5898 } } },
  { code: "CPT", city: { name: "Le Cap", country: "ZA", coordinates: { lat: -33.9249, lng: 18.4241 } } },
  { code: "DKR", city: { name: "Dakar", country: "SN", coordinates: { lat: 14.7167, lng: -17.4677 } } },
  { code: "NBO", city: { name: "Nairobi", country: "KE", coordinates: { lat: -1.2921, lng: 36.8219 } } },

  // ─────────── Océanie ─────────────────────────────────────────────────────
  { code: "SYD", city: { name: "Sydney", country: "AU", coordinates: { lat: -33.8688, lng: 151.2093 } } },
  { code: "MEL", city: { name: "Melbourne", country: "AU", coordinates: { lat: -37.8136, lng: 144.9631 } } },
  { code: "AKL", city: { name: "Auckland", country: "NZ", coordinates: { lat: -36.8485, lng: 174.7633 } } },
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
