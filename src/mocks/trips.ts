/**
 * Mock data SmartTraveler — 3 voyages × 3 alternatives chacun.
 * Chiffres réalistes : ordres de grandeur prix/durée/CO2 pour vols/trains européens.
 * Coordonnées GPS = centroïdes ville.
 */

export type TransportMode = "plane" | "train" | "bus" | "car";

export type Coordinates = {
  lat: number;
  lng: number;
};

export type City = {
  name: string;
  country: string;
  coordinates: Coordinates;
};

export type Destination = {
  id: string;
  city: City;
  nights: number;
};

export type Leg = {
  from: City;
  to: City;
  mode: TransportMode;
  durationMinutes: number;
  costEUR: number;
  co2Kg: number;
  carrier?: string;
};

export type AlternativeKind = "cheapest" | "fastest" | "eco";

export type Alternative = {
  id: string;
  kind: AlternativeKind;
  label: string;
  totalCostEUR: number;
  totalDurationMinutes: number;
  totalCo2Kg: number;
  orderedDestinationIds: string[];
  legs: Leg[];
};

export type TripStatus = "draft" | "computed" | "saved" | "shared";

export type Trip = {
  id: string;
  name: string;
  status: TripStatus;
  startCity: City;
  startDate: string;
  endDate: string;
  destinations: Destination[];
  alternatives: Alternative[];
  createdAt: string;
  updatedAt: string;
  shareToken?: string;
};

const PARIS: City = { name: "Paris", country: "FR", coordinates: { lat: 48.8566, lng: 2.3522 } };
const ROME: City = { name: "Rome", country: "IT", coordinates: { lat: 41.9028, lng: 12.4964 } };
const BARCELONA: City = { name: "Barcelone", country: "ES", coordinates: { lat: 41.3851, lng: 2.1734 } };

const LYON: City = { name: "Lyon", country: "FR", coordinates: { lat: 45.764, lng: 4.8357 } };
const BERLIN: City = { name: "Berlin", country: "DE", coordinates: { lat: 52.52, lng: 13.405 } };
const PRAGUE: City = { name: "Prague", country: "CZ", coordinates: { lat: 50.0755, lng: 14.4378 } };

const MARSEILLE: City = { name: "Marseille", country: "FR", coordinates: { lat: 43.2965, lng: 5.3698 } };
const AMSTERDAM: City = { name: "Amsterdam", country: "NL", coordinates: { lat: 52.3676, lng: 4.9041 } };
const COPENHAGEN: City = { name: "Copenhague", country: "DK", coordinates: { lat: 55.6761, lng: 12.5683 } };

const ATHENS: City = { name: "Athènes", country: "GR", coordinates: { lat: 37.9838, lng: 23.7275 } };
const ISTANBUL: City = { name: "Istanbul", country: "TR", coordinates: { lat: 41.0082, lng: 28.9784 } };
const VIENNA: City = { name: "Vienne", country: "AT", coordinates: { lat: 48.2082, lng: 16.3738 } };

export const MOCK_TRIPS: Trip[] = [
  {
    id: "trip-mediterranee",
    name: "Tour Méditerranée",
    status: "computed",
    startCity: PARIS,
    startDate: "2026-06-10",
    endDate: "2026-06-22",
    destinations: [
      { id: "dest-rome", city: ROME, nights: 4 },
      { id: "dest-bcn", city: BARCELONA, nights: 4 },
    ],
    createdAt: "2026-05-15T10:30:00Z",
    updatedAt: "2026-05-18T14:12:00Z",
    alternatives: [
      {
        id: "alt-medit-cheap",
        kind: "cheapest",
        label: "Le plus économique",
        totalCostEUR: 218,
        totalDurationMinutes: 410,
        totalCo2Kg: 540,
        orderedDestinationIds: ["dest-rome", "dest-bcn"],
        legs: [
          { from: PARIS, to: ROME, mode: "plane", durationMinutes: 130, costEUR: 79, co2Kg: 220, carrier: "Ryanair" },
          { from: ROME, to: BARCELONA, mode: "plane", durationMinutes: 110, costEUR: 65, co2Kg: 160, carrier: "Vueling" },
          { from: BARCELONA, to: PARIS, mode: "plane", durationMinutes: 130, costEUR: 74, co2Kg: 160, carrier: "easyJet" },
        ],
      },
      {
        id: "alt-medit-fast",
        kind: "fastest",
        label: "Le plus rapide",
        totalCostEUR: 412,
        totalDurationMinutes: 365,
        totalCo2Kg: 540,
        orderedDestinationIds: ["dest-bcn", "dest-rome"],
        legs: [
          { from: PARIS, to: BARCELONA, mode: "plane", durationMinutes: 115, costEUR: 142, co2Kg: 160, carrier: "Air France" },
          { from: BARCELONA, to: ROME, mode: "plane", durationMinutes: 105, costEUR: 138, co2Kg: 160, carrier: "Vueling" },
          { from: ROME, to: PARIS, mode: "plane", durationMinutes: 145, costEUR: 132, co2Kg: 220, carrier: "Air France" },
        ],
      },
      {
        id: "alt-medit-eco",
        kind: "eco",
        label: "Empreinte carbone réduite",
        totalCostEUR: 386,
        totalDurationMinutes: 2030,
        totalCo2Kg: 78,
        orderedDestinationIds: ["dest-bcn", "dest-rome"],
        legs: [
          { from: PARIS, to: BARCELONA, mode: "train", durationMinutes: 405, costEUR: 119, co2Kg: 22, carrier: "TGV inOui" },
          { from: BARCELONA, to: ROME, mode: "train", durationMinutes: 1020, costEUR: 145, co2Kg: 32, carrier: "Renfe + Trenitalia" },
          { from: ROME, to: PARIS, mode: "train", durationMinutes: 605, costEUR: 122, co2Kg: 24, carrier: "Frecciarossa + TGV" },
        ],
      },
    ],
  },
  {
    id: "trip-europe-centrale",
    name: "Boucle Europe centrale",
    status: "computed",
    startCity: LYON,
    startDate: "2026-07-04",
    endDate: "2026-07-14",
    destinations: [
      { id: "dest-berlin", city: BERLIN, nights: 3 },
      { id: "dest-prague", city: PRAGUE, nights: 3 },
    ],
    createdAt: "2026-05-12T09:14:00Z",
    updatedAt: "2026-05-19T17:42:00Z",
    alternatives: [
      {
        id: "alt-ec-cheap",
        kind: "cheapest",
        label: "Le plus économique",
        totalCostEUR: 187,
        totalDurationMinutes: 540,
        totalCo2Kg: 480,
        orderedDestinationIds: ["dest-berlin", "dest-prague"],
        legs: [
          { from: LYON, to: BERLIN, mode: "plane", durationMinutes: 130, costEUR: 68, co2Kg: 190, carrier: "easyJet" },
          { from: BERLIN, to: PRAGUE, mode: "bus", durationMinutes: 270, costEUR: 28, co2Kg: 45, carrier: "FlixBus" },
          { from: PRAGUE, to: LYON, mode: "plane", durationMinutes: 140, costEUR: 91, co2Kg: 245, carrier: "Ryanair" },
        ],
      },
      {
        id: "alt-ec-fast",
        kind: "fastest",
        label: "Le plus rapide",
        totalCostEUR: 358,
        totalDurationMinutes: 405,
        totalCo2Kg: 510,
        orderedDestinationIds: ["dest-berlin", "dest-prague"],
        legs: [
          { from: LYON, to: BERLIN, mode: "plane", durationMinutes: 125, costEUR: 124, co2Kg: 190, carrier: "Air France" },
          { from: BERLIN, to: PRAGUE, mode: "plane", durationMinutes: 80, costEUR: 112, co2Kg: 75, carrier: "Lufthansa" },
          { from: PRAGUE, to: LYON, mode: "plane", durationMinutes: 135, costEUR: 122, co2Kg: 245, carrier: "Lufthansa" },
        ],
      },
      {
        id: "alt-ec-eco",
        kind: "eco",
        label: "Empreinte carbone réduite",
        totalCostEUR: 296,
        totalDurationMinutes: 1610,
        totalCo2Kg: 64,
        orderedDestinationIds: ["dest-berlin", "dest-prague"],
        legs: [
          { from: LYON, to: BERLIN, mode: "train", durationMinutes: 720, costEUR: 109, co2Kg: 28, carrier: "TGV + ICE" },
          { from: BERLIN, to: PRAGUE, mode: "train", durationMinutes: 265, costEUR: 42, co2Kg: 11, carrier: "EuroCity" },
          { from: PRAGUE, to: LYON, mode: "train", durationMinutes: 625, costEUR: 145, co2Kg: 25, carrier: "RailJet + TGV" },
        ],
      },
    ],
  },
  {
    id: "trip-mer-du-nord",
    name: "Cap mer du Nord",
    status: "draft",
    startCity: MARSEILLE,
    startDate: "2026-08-15",
    endDate: "2026-08-26",
    destinations: [
      { id: "dest-ams", city: AMSTERDAM, nights: 3 },
      { id: "dest-cph", city: COPENHAGEN, nights: 4 },
    ],
    createdAt: "2026-05-18T20:08:00Z",
    updatedAt: "2026-05-19T22:55:00Z",
    alternatives: [
      {
        id: "alt-mn-cheap",
        kind: "cheapest",
        label: "Le plus économique",
        totalCostEUR: 254,
        totalDurationMinutes: 470,
        totalCo2Kg: 620,
        orderedDestinationIds: ["dest-ams", "dest-cph"],
        legs: [
          { from: MARSEILLE, to: AMSTERDAM, mode: "plane", durationMinutes: 145, costEUR: 89, co2Kg: 215, carrier: "Transavia" },
          { from: AMSTERDAM, to: COPENHAGEN, mode: "plane", durationMinutes: 95, costEUR: 72, co2Kg: 140, carrier: "KLM" },
          { from: COPENHAGEN, to: MARSEILLE, mode: "plane", durationMinutes: 155, costEUR: 93, co2Kg: 265, carrier: "SAS" },
        ],
      },
      {
        id: "alt-mn-fast",
        kind: "fastest",
        label: "Le plus rapide",
        totalCostEUR: 438,
        totalDurationMinutes: 395,
        totalCo2Kg: 620,
        orderedDestinationIds: ["dest-ams", "dest-cph"],
        legs: [
          { from: MARSEILLE, to: AMSTERDAM, mode: "plane", durationMinutes: 140, costEUR: 156, co2Kg: 215, carrier: "Air France" },
          { from: AMSTERDAM, to: COPENHAGEN, mode: "plane", durationMinutes: 90, costEUR: 138, co2Kg: 140, carrier: "KLM" },
          { from: COPENHAGEN, to: MARSEILLE, mode: "plane", durationMinutes: 165, costEUR: 144, co2Kg: 265, carrier: "Air France" },
        ],
      },
      {
        id: "alt-mn-eco",
        kind: "eco",
        label: "Empreinte carbone réduite",
        totalCostEUR: 412,
        totalDurationMinutes: 2150,
        totalCo2Kg: 92,
        orderedDestinationIds: ["dest-ams", "dest-cph"],
        legs: [
          { from: MARSEILLE, to: AMSTERDAM, mode: "train", durationMinutes: 825, costEUR: 148, co2Kg: 36, carrier: "TGV + Thalys" },
          { from: AMSTERDAM, to: COPENHAGEN, mode: "train", durationMinutes: 680, costEUR: 134, co2Kg: 28, carrier: "ICE + EuroCity" },
          { from: COPENHAGEN, to: MARSEILLE, mode: "train", durationMinutes: 645, costEUR: 130, co2Kg: 28, carrier: "EC + ICE + TGV" },
        ],
      },
    ],
  },
  {
    id: "trip-grand-tour-europe",
    name: "Grand Tour d'Europe",
    status: "computed",
    startCity: PARIS,
    startDate: "2026-09-05",
    endDate: "2026-09-25",
    destinations: [
      { id: "dest-gte-rome", city: ROME, nights: 3 },
      { id: "dest-gte-athens", city: ATHENS, nights: 4 },
      { id: "dest-gte-istanbul", city: ISTANBUL, nights: 4 },
      { id: "dest-gte-vienna", city: VIENNA, nights: 3 },
      { id: "dest-gte-berlin", city: BERLIN, nights: 3 },
    ],
    createdAt: "2026-05-19T11:24:00Z",
    updatedAt: "2026-05-20T09:30:00Z",
    alternatives: [
      {
        id: "alt-gte-cheap",
        kind: "cheapest",
        label: "Le plus économique",
        totalCostEUR: 440,
        totalDurationMinutes: 1255,
        totalCo2Kg: 940,
        orderedDestinationIds: [
          "dest-gte-rome",
          "dest-gte-athens",
          "dest-gte-istanbul",
          "dest-gte-vienna",
          "dest-gte-berlin",
        ],
        legs: [
          { from: PARIS, to: ROME, mode: "plane", durationMinutes: 130, costEUR: 79, co2Kg: 220, carrier: "Ryanair" },
          { from: ROME, to: ATHENS, mode: "plane", durationMinutes: 105, costEUR: 92, co2Kg: 160, carrier: "Aegean" },
          { from: ATHENS, to: ISTANBUL, mode: "plane", durationMinutes: 80, costEUR: 68, co2Kg: 95, carrier: "Pegasus" },
          { from: ISTANBUL, to: VIENNA, mode: "plane", durationMinutes: 140, costEUR: 105, co2Kg: 230, carrier: "Pegasus" },
          { from: VIENNA, to: BERLIN, mode: "bus", durationMinutes: 690, costEUR: 32, co2Kg: 70, carrier: "FlixBus" },
          { from: BERLIN, to: PARIS, mode: "plane", durationMinutes: 110, costEUR: 64, co2Kg: 165, carrier: "Ryanair" },
        ],
      },
      {
        id: "alt-gte-fast",
        kind: "fastest",
        label: "Le plus rapide",
        totalCostEUR: 899,
        totalDurationMinutes: 695,
        totalCo2Kg: 1000,
        orderedDestinationIds: [
          "dest-gte-rome",
          "dest-gte-athens",
          "dest-gte-istanbul",
          "dest-gte-vienna",
          "dest-gte-berlin",
        ],
        legs: [
          { from: PARIS, to: ROME, mode: "plane", durationMinutes: 130, costEUR: 158, co2Kg: 220, carrier: "Air France" },
          { from: ROME, to: ATHENS, mode: "plane", durationMinutes: 120, costEUR: 165, co2Kg: 160, carrier: "Aegean" },
          { from: ATHENS, to: ISTANBUL, mode: "plane", durationMinutes: 95, costEUR: 122, co2Kg: 95, carrier: "Turkish Airlines" },
          { from: ISTANBUL, to: VIENNA, mode: "plane", durationMinutes: 145, costEUR: 178, co2Kg: 230, carrier: "Austrian Airlines" },
          { from: VIENNA, to: BERLIN, mode: "plane", durationMinutes: 95, costEUR: 134, co2Kg: 130, carrier: "Lufthansa" },
          { from: BERLIN, to: PARIS, mode: "plane", durationMinutes: 110, costEUR: 142, co2Kg: 165, carrier: "Air France" },
        ],
      },
      {
        id: "alt-gte-eco",
        kind: "eco",
        label: "Empreinte carbone réduite",
        totalCostEUR: 873,
        totalDurationMinutes: 4475,
        totalCo2Kg: 312,
        orderedDestinationIds: [
          "dest-gte-rome",
          "dest-gte-athens",
          "dest-gte-istanbul",
          "dest-gte-vienna",
          "dest-gte-berlin",
        ],
        legs: [
          { from: PARIS, to: ROME, mode: "train", durationMinutes: 620, costEUR: 175, co2Kg: 32, carrier: "TGV + Frecciarossa" },
          { from: ROME, to: ATHENS, mode: "plane", durationMinutes: 120, costEUR: 145, co2Kg: 160, carrier: "Aegean" },
          { from: ATHENS, to: ISTANBUL, mode: "train", durationMinutes: 1080, costEUR: 92, co2Kg: 28, carrier: "Via Thessalonique" },
          { from: ISTANBUL, to: VIENNA, mode: "train", durationMinutes: 1620, costEUR: 188, co2Kg: 42, carrier: "Balkans EuroNight" },
          { from: VIENNA, to: BERLIN, mode: "train", durationMinutes: 525, costEUR: 95, co2Kg: 22, carrier: "RailJet + ICE" },
          { from: BERLIN, to: PARIS, mode: "train", durationMinutes: 510, costEUR: 178, co2Kg: 28, carrier: "ICE + Thalys" },
        ],
      },
    ],
  },
];

export function getTripById(id: string): Trip | undefined {
  return MOCK_TRIPS.find((t) => t.id === id);
}
