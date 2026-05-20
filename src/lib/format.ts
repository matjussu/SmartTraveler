/**
 * Helpers d'affichage SmartTraveler.
 * Format français — voyage chaleureux B2C.
 */

import type { TransportMode } from "@/mocks/trips";

export function formatCost(eur: number): string {
  return `${Math.round(eur)} €`;
}

export function formatLongDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m.toString().padStart(2, "0")}min`;
}

export function formatShortDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h${m.toString().padStart(2, "0")}`;
}

const MONTHS_FR = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];

export function formatDateLong(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDateShort(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS_FR[d.getMonth()].slice(0, 4)}.`;
}

export function tripDurationDays(start: string, end: string): number {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  return Math.round((e - s) / (1000 * 60 * 60 * 24));
}

export function transportLabel(mode: TransportMode): string {
  switch (mode) {
    case "plane":
      return "Avion";
    case "train":
      return "Train";
    case "bus":
      return "Bus";
    case "car":
      return "Voiture";
  }
}

export function formatCo2(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)} t CO₂`;
  return `${Math.round(kg)} kg CO₂`;
}
