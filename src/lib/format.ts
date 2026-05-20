/**
 * Helpers d'affichage pour SmartTraveler — formatage durée / coût / CO2 / dates.
 * Pas de mutation de la donnée mock, juste de la présentation.
 */

const EUR = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const EUR_PRECISE = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

const KG = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 0,
});

const DATE_LONG = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const DATE_SHORT = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
});

const DATE_DAY = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "long",
});

export function formatCost(amountEUR: number): string {
  return EUR.format(amountEUR);
}

export function formatCostPrecise(amountEUR: number): string {
  return EUR_PRECISE.format(amountEUR);
}

export function formatCo2(co2Kg: number): string {
  return `${KG.format(co2Kg)} kg`;
}

/**
 * Format durée minutes → "Xh YY" (ex: 405 → "6h 45") ou "YYmin" sous 60min.
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h}h`;
  return `${h}h ${m.toString().padStart(2, "0")}`;
}

/**
 * Format durée minutes → "Xj Yh" si > 24h, sinon formatDuration.
 */
export function formatLongDuration(minutes: number): string {
  if (minutes < 24 * 60) return formatDuration(minutes);
  const d = Math.floor(minutes / (24 * 60));
  const remaining = minutes - d * 24 * 60;
  const h = Math.floor(remaining / 60);
  if (h === 0) return `${d}j`;
  return `${d}j ${h}h`;
}

export function formatDateLong(iso: string): string {
  return DATE_LONG.format(new Date(iso));
}

export function formatDateShort(iso: string): string {
  return DATE_SHORT.format(new Date(iso));
}

export function formatDateDay(iso: string): string {
  return DATE_DAY.format(new Date(iso));
}

export function formatDateRange(startIso: string, endIso: string): string {
  return `${formatDateShort(startIso)} → ${formatDateShort(endIso)}`;
}

export function tripDurationDays(startIso: string, endIso: string): number {
  const ms = new Date(endIso).getTime() - new Date(startIso).getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export function transportLabel(mode: "plane" | "train" | "bus" | "car"): string {
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

export function alternativeAccent(kind: "cheapest" | "fastest" | "eco"): string {
  switch (kind) {
    case "cheapest":
      return "cheap";
    case "fastest":
      return "fast";
    case "eco":
      return "eco";
  }
}

export function statusLabel(status: "draft" | "computed" | "saved" | "shared"): string {
  switch (status) {
    case "draft":
      return "Brouillon";
    case "computed":
      return "Calculé";
    case "saved":
      return "Sauvegardé";
    case "shared":
      return "Partagé";
  }
}
