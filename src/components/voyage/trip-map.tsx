"use client";

import { useEffect, useMemo, useRef } from "react";
import { MapContainer, Marker, Polyline, TileLayer, useMap } from "react-leaflet";
import L, { type LatLngBoundsExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Alternative, AlternativeKind, City, Trip } from "@/mocks/trips";

const KIND_COLOR: Record<AlternativeKind, string> = {
  cheapest: "oklch(0.62 0.155 38)",
  fastest: "oklch(0.55 0.115 235)",
  eco: "oklch(0.55 0.078 145)",
};

const KIND_COLOR_INK: Record<AlternativeKind, string> = {
  cheapest: "oklch(0.42 0.13 35)",
  fastest: "oklch(0.38 0.11 240)",
  eco: "oklch(0.38 0.07 150)",
};

function makeIcon(color: string, label?: string, isOrigin = false) {
  const dot = `<span class="st-marker-dot" style="background:${color};"></span>`;
  const html = label
    ? `<div class="st-marker-pin">
        <span class="pin-bubble" style="color:${color}; border-color:${color};">${label}</span>
        <span class="st-marker-dot" style="background:${color}; margin-top:-2px;"></span>
      </div>`
    : `<div class="st-marker">${dot}</div>`;

  return L.divIcon({
    className: "st-divicon",
    html,
    iconSize: label ? [80, 36] : [16, 16],
    iconAnchor: label ? [40, 30] : [8, 8],
  });
}

function FitToBounds({ cities }: { cities: City[] }) {
  const map = useMap();
  useEffect(() => {
    if (!cities.length) return;
    const bounds: LatLngBoundsExpression = cities.map((c) => [
      c.coordinates.lat,
      c.coordinates.lng,
    ]);
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 6, animate: false });
  }, [cities, map]);
  return null;
}

export function TripMap({
  trip,
  activeAlternative,
}: {
  trip: Trip;
  activeAlternative: Alternative;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const color = KIND_COLOR[activeAlternative.kind];
  const colorInk = KIND_COLOR_INK[activeAlternative.kind];

  // Ordonner les villes selon l'alternative
  const orderedCities = useMemo(() => {
    const out: { city: City; isStart: boolean; label?: string }[] = [];
    out.push({ city: trip.startCity, isStart: true, label: trip.startCity.name });
    for (const did of activeAlternative.orderedDestinationIds) {
      const d = trip.destinations.find((x) => x.id === did);
      if (d) out.push({ city: d.city, isStart: false, label: d.city.name });
    }
    return out;
  }, [trip, activeAlternative]);

  // Polyline = sequence start → dests → start
  const polyline = useMemo(() => {
    const pts: [number, number][] = orderedCities.map((c) => [
      c.city.coordinates.lat,
      c.city.coordinates.lng,
    ]);
    pts.push([trip.startCity.coordinates.lat, trip.startCity.coordinates.lng]);
    return pts;
  }, [orderedCities, trip.startCity]);

  return (
    <div
      ref={containerRef}
      className="relative isolate overflow-hidden rounded-[18px] border border-line bg-[oklch(0.95_0.012_80)]"
      style={{ height: "100%", minHeight: 360 }}
    >
      <MapContainer
        center={[trip.startCity.coordinates.lat, trip.startCity.coordinates.lng]}
        zoom={4}
        scrollWheelZoom={false}
        zoomControl={false}
        attributionControl={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
        />

        {/* Route stylisée — dashed selon le mode de l'alt */}
        <Polyline
          positions={polyline}
          pathOptions={{
            color,
            weight: 2.5,
            opacity: 0.85,
            dashArray:
              activeAlternative.legs[0]?.mode === "train" ? "4 8" : "1 6",
            lineCap: "round",
          }}
        />

        {orderedCities.map(({ city, isStart, label }, idx) => (
          <Marker
            key={`${city.name}-${idx}`}
            position={[city.coordinates.lat, city.coordinates.lng]}
            icon={makeIcon(isStart ? colorInk : color, label, isStart)}
            zIndexOffset={isStart ? 100 : idx}
          />
        ))}

        <FitToBounds cities={orderedCities.map((c) => c.city)} />
      </MapContainer>
    </div>
  );
}
