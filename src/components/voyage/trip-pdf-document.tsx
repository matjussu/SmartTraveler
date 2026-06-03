"use client";

/**
 * Document PDF SmartTraveler — composé avec @react-pdf/renderer.
 *
 * Stratégie typographique : fonts built-in uniquement (Helvetica + Courier).
 * `Font.register` sur Instrument Serif ajouterait ~250kB de bundle pour un rendu
 * de récapitulatif d'1 page — l'investissement n'en vaut pas la chandelle.
 * Helvetica-Oblique (via fontStyle:'italic') donne déjà du caractère aux titres.
 */

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { Trip, Alternative, AlternativeKind } from "@/mocks/trips";
import {
  formatCost,
  formatLongDuration,
  formatCo2,
  formatDateLong,
  transportLabel,
  tripDurationDays,
} from "@/lib/format";

/* ---------------------------------------------------------------------------
   Palette voyage-pivot (transcrite en hex — @react-pdf ne lit pas oklch)
   Cible visuelle : `globals.css` :root tokens.
--------------------------------------------------------------------------- */
const PALETTE = {
  // Fond crème lever-de-soleil
  cream: "#FAF4EC",
  surface: "#FCF8F1",
  // Encre terre brûlée
  ink: "#2A1C12",
  inkSoft: "#5A4838",
  inkMute: "#8A7868",
  // Lignes warm sand
  line: "#E4D9C8",
  lineStrong: "#D2C2A8",
  // Accents
  terracotta: "#B05B2C",
  terracottaSoft: "#F2DCC8",
  terracottaInk: "#7A3F18",
  ocean: "#3A6E94",
  oceanInk: "#27506F",
  sage: "#5C8466",
  sageInk: "#3D5C45",
} as const;

const ALT_META: Record<
  AlternativeKind,
  { label: string; tagline: string; accent: string; accentInk: string }
> = {
  cheapest: {
    label: "Le plus économique",
    tagline: "Pour voyager léger sans alléger son envie.",
    accent: PALETTE.terracotta,
    accentInk: PALETTE.terracottaInk,
  },
  fastest: {
    label: "Le plus rapide",
    tagline: "Pour gagner une journée sur place.",
    accent: PALETTE.ocean,
    accentInk: PALETTE.oceanInk,
  },
  eco: {
    label: "Empreinte carbone réduite",
    tagline: "Pour que le voyage commence en gare.",
    accent: PALETTE.sage,
    accentInk: PALETTE.sageInk,
  },
};

/* ---------------------------------------------------------------------------
   StyleSheet — tokens transposés du design web
--------------------------------------------------------------------------- */
const s = StyleSheet.create({
  page: {
    backgroundColor: PALETTE.cream,
    color: PALETTE.ink,
    paddingTop: 44,
    paddingBottom: 44,
    paddingHorizontal: 48,
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.45,
  },

  /* Header */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 18,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
  },
  brandMark: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: PALETTE.terracotta,
    color: "#FAF4EC",
    fontFamily: "Helvetica-Oblique",
    fontSize: 12,
    textAlign: "center",
    paddingTop: 4,
    marginRight: 8,
  },
  brandText: {
    flexDirection: "column",
  },
  brandName: {
    fontFamily: "Helvetica-Oblique",
    fontSize: 14,
    color: PALETTE.ink,
    letterSpacing: -0.2,
  },
  brandSub: {
    fontSize: 7.5,
    color: PALETTE.inkMute,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginTop: 1,
  },
  headerMeta: {
    fontSize: 9,
    color: PALETTE.inkMute,
    textAlign: "right",
    fontFamily: "Helvetica-Oblique",
  },

  rule: {
    borderBottomWidth: 0.6,
    borderBottomColor: PALETTE.line,
    marginBottom: 26,
  },

  /* Title section */
  eyebrow: {
    fontSize: 8,
    color: PALETTE.inkMute,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  title: {
    fontFamily: "Helvetica-Oblique",
    fontSize: 30,
    color: PALETTE.ink,
    letterSpacing: -0.4,
    lineHeight: 1.05,
  },
  titleAccent: {
    color: PALETTE.terracottaInk,
  },
  subtitle: {
    fontSize: 11,
    color: PALETTE.inkSoft,
    marginTop: 8,
    lineHeight: 1.45,
  },

  /* Sections */
  section: {
    marginTop: 24,
  },
  sectionEyebrow: {
    fontSize: 8,
    color: PALETTE.inkMute,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: "Helvetica-Oblique",
    fontSize: 16,
    color: PALETTE.ink,
    letterSpacing: -0.2,
    marginBottom: 12,
  },

  /* Infos voyage */
  infoCard: {
    backgroundColor: PALETTE.surface,
    borderWidth: 0.6,
    borderColor: PALETTE.line,
    borderRadius: 10,
    padding: 14,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  infoLabel: {
    width: 110,
    fontSize: 9,
    color: PALETTE.inkMute,
    textTransform: "uppercase",
    letterSpacing: 0.9,
  },
  infoValue: {
    fontSize: 11,
    color: PALETTE.ink,
    flex: 1,
  },
  infoValueItalic: {
    fontFamily: "Helvetica-Oblique",
    fontSize: 11.5,
    color: PALETTE.ink,
    flex: 1,
  },

  /* Itinéraire choisi */
  altHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  altDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  altLabel: {
    fontFamily: "Helvetica-Oblique",
    fontSize: 14,
    letterSpacing: -0.2,
  },
  altTagline: {
    fontFamily: "Helvetica-Oblique",
    fontSize: 10,
    color: PALETTE.inkSoft,
    marginTop: 2,
    marginLeft: 16,
  },

  legList: {
    marginTop: 8,
    borderWidth: 0.6,
    borderColor: PALETTE.line,
    borderRadius: 10,
    backgroundColor: PALETTE.surface,
    overflow: "hidden",
  },
  legRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: PALETTE.line,
  },
  legRowLast: {
    borderBottomWidth: 0,
  },
  legIdx: {
    width: 22,
    fontSize: 9,
    fontFamily: "Courier",
    color: PALETTE.inkMute,
  },
  legMain: {
    flex: 1.6,
  },
  legCities: {
    fontSize: 11,
    color: PALETTE.ink,
    fontFamily: "Helvetica-Oblique",
  },
  legMeta: {
    fontSize: 9,
    color: PALETTE.inkMute,
    marginTop: 1.5,
  },
  legNumCol: {
    flex: 0.9,
    flexDirection: "column",
    alignItems: "flex-end",
  },
  legNumLabel: {
    fontSize: 7.5,
    color: PALETTE.inkMute,
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  legNum: {
    fontSize: 10.5,
    fontFamily: "Courier",
    color: PALETTE.ink,
    marginTop: 1,
  },

  /* Total bar */
  totalBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  totalLabel: {
    fontSize: 9,
    color: PALETTE.inkMute,
    letterSpacing: 0.9,
    textTransform: "uppercase",
  },
  totalValues: {
    flexDirection: "row",
    gap: 18,
  },
  totalValue: {
    fontSize: 12,
    fontFamily: "Courier",
  },

  /* Comparatif 3 alternatives */
  compareTable: {
    borderWidth: 0.6,
    borderColor: PALETTE.line,
    borderRadius: 10,
    backgroundColor: PALETTE.surface,
    overflow: "hidden",
  },
  compareHead: {
    flexDirection: "row",
    backgroundColor: PALETTE.cream,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: PALETTE.line,
  },
  compareHeadCell: {
    fontSize: 8,
    color: PALETTE.inkMute,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  compareRow: {
    flexDirection: "row",
    paddingVertical: 11,
    paddingHorizontal: 12,
    alignItems: "center",
    borderBottomWidth: 0.5,
    borderBottomColor: PALETTE.line,
  },
  compareRowLast: {
    borderBottomWidth: 0,
  },
  compareName: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  compareDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 7,
  },
  compareLabel: {
    fontFamily: "Helvetica-Oblique",
    fontSize: 11,
    color: PALETTE.ink,
  },
  compareCell: {
    flex: 1,
    fontFamily: "Courier",
    fontSize: 10.5,
    color: PALETTE.ink,
    textAlign: "right",
  },

  /* Footer */
  footer: {
    position: "absolute",
    left: 48,
    right: 48,
    bottom: 26,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7.5,
    color: PALETTE.inkMute,
    fontFamily: "Courier",
  },
  footerBrand: {
    fontFamily: "Helvetica-Oblique",
    fontSize: 8.5,
    color: PALETTE.inkMute,
  },
});

/* ---------------------------------------------------------------------------
   Helpers locaux
--------------------------------------------------------------------------- */
function pickPrimaryAlternative(trip: Trip): Alternative | undefined {
  if (trip.status === "computed" && trip.alternatives.length > 0) {
    return (
      trip.alternatives.find((a) => a.kind === "cheapest") ??
      trip.alternatives[0]
    );
  }
  return trip.alternatives[0];
}

function todayFr(): string {
  const d = new Date();
  return formatDateLong(d.toISOString());
}

/* ---------------------------------------------------------------------------
   Composant principal
--------------------------------------------------------------------------- */
export function TripPdfDocument({ trip }: { trip: Trip }) {
  const primary = pickPrimaryAlternative(trip);
  const primaryMeta = primary ? ALT_META[primary.kind] : null;
  const days = tripDurationDays(trip.startDate, trip.endDate);

  const destinationNames = trip.destinations.map((d) => d.city.name);
  const itineraryPath = [trip.startCity.name, ...destinationNames, trip.startCity.name].join(
    " → "
  );

  return (
    <Document
      title={`SmartTraveler — ${trip.name}`}
      author="SmartTraveler"
      creator="SmartTraveler web"
      producer="SmartTraveler"
      subject={`Récapitulatif de voyage — ${trip.name}`}
    >
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <View style={s.brand}>
            <Text style={s.brandMark}>S</Text>
            <View style={s.brandText}>
              <Text style={s.brandName}>SmartTraveler</Text>
              <Text style={s.brandSub}>Voyages composés</Text>
            </View>
          </View>
          <Text style={s.headerMeta}>Édité le {todayFr()}</Text>
        </View>
        <View style={s.rule} />

        {/* Titre */}
        <Text style={s.eyebrow}>Votre récapitulatif</Text>
        <Text style={s.title}>
          {trip.name}
          <Text style={s.titleAccent}>.</Text>
        </Text>
        <Text style={s.subtitle}>
          Du {formatDateLong(trip.startDate)} au {formatDateLong(trip.endDate)} ·{" "}
          {days} jours · {trip.destinations.length} destination
          {trip.destinations.length > 1 ? "s" : ""}.
        </Text>

        {/* Le voyage — récap infos */}
        <View style={s.section}>
          <Text style={s.sectionEyebrow}>Le voyage</Text>
          <View style={s.infoCard}>
            <View style={s.infoRow}>
              <Text style={s.infoLabel}>Départ</Text>
              <Text style={s.infoValue}>
                {trip.startCity.name} ({trip.startCity.country})
              </Text>
            </View>
            <View style={s.infoRow}>
              <Text style={s.infoLabel}>Destinations</Text>
              <Text style={s.infoValueItalic}>{itineraryPath}</Text>
            </View>
            <View style={s.infoRow}>
              <Text style={s.infoLabel}>Durée</Text>
              <Text style={s.infoValue}>
                {days} jours · {trip.destinations.reduce((acc, d) => acc + d.nights, 0)} nuits
                sur place
              </Text>
            </View>
            <View style={[s.infoRow, { marginBottom: 0 }]}>
              <Text style={s.infoLabel}>Statut</Text>
              <Text style={s.infoValue}>{statusLabel(trip.status)}</Text>
            </View>
          </View>
        </View>

        {/* Itinéraire choisi */}
        {primary && primaryMeta ? (
          <View style={s.section}>
            <Text style={s.sectionEyebrow}>Itinéraire choisi</Text>
            <View style={s.altHeader}>
              <View style={[s.altDot, { backgroundColor: primaryMeta.accent }]} />
              <Text style={[s.altLabel, { color: primaryMeta.accentInk }]}>
                {primaryMeta.label}
              </Text>
            </View>
            <Text style={s.altTagline}>{primaryMeta.tagline}</Text>

            <View style={s.legList}>
              {primary.legs.map((leg, idx) => {
                const isLast = idx === primary.legs.length - 1;
                return (
                  <View
                    key={`${leg.from.name}-${leg.to.name}-${idx}`}
                    style={[s.legRow, isLast ? s.legRowLast : null].filter(Boolean) as never}
                  >
                    <Text style={s.legIdx}>{String(idx + 1).padStart(2, "0")}</Text>
                    <View style={s.legMain}>
                      <Text style={s.legCities}>
                        {leg.from.name} → {leg.to.name}
                      </Text>
                      <Text style={s.legMeta}>
                        {transportLabel(leg.mode)}
                        {leg.carrier ? ` · ${leg.carrier}` : ""}
                      </Text>
                    </View>
                    <View style={s.legNumCol}>
                      <Text style={s.legNumLabel}>Durée</Text>
                      <Text style={s.legNum}>
                        {formatLongDuration(leg.durationMinutes)}
                      </Text>
                    </View>
                    <View style={s.legNumCol}>
                      <Text style={s.legNumLabel}>Prix</Text>
                      <Text style={s.legNum}>{formatCost(leg.costEUR)}</Text>
                    </View>
                    <View style={s.legNumCol}>
                      <Text style={s.legNumLabel}>CO₂</Text>
                      <Text style={s.legNum}>{formatCo2(leg.co2Kg)}</Text>
                    </View>
                  </View>
                );
              })}
            </View>

            <View
              style={[
                s.totalBar,
                {
                  backgroundColor: tint(primaryMeta.accent),
                  borderWidth: 0.6,
                  borderColor: primaryMeta.accent,
                },
              ]}
            >
              <Text style={[s.totalLabel, { color: primaryMeta.accentInk }]}>Total</Text>
              <View style={s.totalValues}>
                <Text style={[s.totalValue, { color: primaryMeta.accentInk }]}>
                  {formatCost(primary.totalCostEUR)}
                </Text>
                <Text style={[s.totalValue, { color: primaryMeta.accentInk }]}>
                  {formatLongDuration(primary.totalDurationMinutes)}
                </Text>
                <Text style={[s.totalValue, { color: primaryMeta.accentInk }]}>
                  {formatCo2(primary.totalCo2Kg)}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={s.section}>
            <Text style={s.sectionEyebrow}>Itinéraire choisi</Text>
            <View style={s.infoCard}>
              <Text style={s.infoValueItalic}>
                À calculer — votre voyage est encore au stade brouillon.
              </Text>
            </View>
          </View>
        )}

        {/* Trois façons d'arriver là-bas */}
        {trip.alternatives.length > 1 ? (
          <View style={s.section}>
            <Text style={s.sectionEyebrow}>Trois façons d&apos;arriver là-bas</Text>
            <View style={s.compareTable}>
              <View style={s.compareHead}>
                <Text style={[s.compareHeadCell, { flex: 2 }]}>Alternative</Text>
                <Text style={[s.compareHeadCell, { flex: 1, textAlign: "right" }]}>
                  Prix
                </Text>
                <Text style={[s.compareHeadCell, { flex: 1, textAlign: "right" }]}>
                  Durée
                </Text>
                <Text style={[s.compareHeadCell, { flex: 1, textAlign: "right" }]}>
                  CO₂
                </Text>
              </View>
              {trip.alternatives.map((alt, idx) => {
                const meta = ALT_META[alt.kind];
                const isLast = idx === trip.alternatives.length - 1;
                return (
                  <View
                    key={alt.id}
                    style={[
                      s.compareRow,
                      isLast ? s.compareRowLast : null,
                    ].filter(Boolean) as never}
                  >
                    <View style={s.compareName}>
                      <View style={[s.compareDot, { backgroundColor: meta.accent }]} />
                      <Text style={[s.compareLabel, { color: meta.accentInk }]}>
                        {meta.label}
                      </Text>
                    </View>
                    <Text style={s.compareCell}>{formatCost(alt.totalCostEUR)}</Text>
                    <Text style={s.compareCell}>
                      {formatLongDuration(alt.totalDurationMinutes)}
                    </Text>
                    <Text style={s.compareCell}>{formatCo2(alt.totalCo2Kg)}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        ) : null}

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerBrand}>
            Composé avec SmartTraveler · smart-traveler.app
          </Text>
          <Text>{trip.id}</Text>
        </View>
      </Page>
    </Document>
  );
}

/* ---------------------------------------------------------------------------
   Helpers
--------------------------------------------------------------------------- */
function statusLabel(status: Trip["status"]): string {
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

/**
 * Crée une teinte douce (~12% opacity sur fond crème) à partir d'un hex accent.
 * Évite d'avoir à dupliquer les `*-soft` du design web — un seul accent + tint.
 */
function tint(hex: string): string {
  const v = hex.replace("#", "");
  const r = parseInt(v.substring(0, 2), 16);
  const g = parseInt(v.substring(2, 4), 16);
  const b = parseInt(v.substring(4, 6), 16);
  // mix vers le cream #FAF4EC à 86%
  const mix = (c: number, target: number) => Math.round(target * 0.86 + c * 0.14);
  const rr = mix(r, 0xfa);
  const gg = mix(g, 0xf4);
  const bb = mix(b, 0xec);
  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${toHex(rr)}${toHex(gg)}${toHex(bb)}`;
}
