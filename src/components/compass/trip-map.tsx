"use client";

import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Tooltip } from "react-leaflet";
import L from "leaflet";
import type { City, Leg } from "@/mocks/trips";

type Props = {
  startCity: City;
  legs: Leg[];
  accent?: "copper" | "sage" | "amber";
};

function makeMarker(label: string, variant: "start" | "stop" | "accent") {
  const cls = [
    "compass-marker",
    variant === "start" ? "compass-marker--start" : "",
    variant === "accent" ? "compass-marker--accent" : "",
  ]
    .filter(Boolean)
    .join(" ");
  return L.divIcon({
    className: "compass-marker-wrap",
    html: `<div class="${cls}">${label}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

export default function TripMap({ startCity, legs, accent = "copper" }: Props) {
  /** Order : start -> legs[0].to -> legs[1].to -> ... -> back to start */
  const points = useMemo(() => {
    const pts: { city: City; label: string; variant: "start" | "stop" | "accent" }[] = [
      { city: startCity, label: "A", variant: "start" },
    ];
    legs.forEach((leg, i) => {
      const isLast = i === legs.length - 1;
      if (isLast && leg.to.name === startCity.name) {
        // closing loop — don't push duplicate, already handled by start marker visually
        return;
      }
      const letter = String.fromCharCode(66 + i); // B, C, D...
      pts.push({
        city: leg.to,
        label: letter,
        variant: "stop",
      });
    });
    return pts;
  }, [startCity, legs]);

  const polylinePositions: [number, number][] = useMemo(() => {
    const all: [number, number][] = [
      [startCity.coordinates.lat, startCity.coordinates.lng],
    ];
    legs.forEach((leg) => {
      all.push([leg.to.coordinates.lat, leg.to.coordinates.lng]);
    });
    return all;
  }, [startCity, legs]);

  // Bounds center
  const center: [number, number] = useMemo(() => {
    const lats = polylinePositions.map((p) => p[0]);
    const lngs = polylinePositions.map((p) => p[1]);
    return [
      (Math.min(...lats) + Math.max(...lats)) / 2,
      (Math.min(...lngs) + Math.max(...lngs)) / 2,
    ];
  }, [polylinePositions]);

  const polylineColor =
    accent === "sage"
      ? "rgb(80 130 95)"
      : accent === "amber"
      ? "rgb(180 130 50)"
      : "rgb(170 95 55)"; /* copper */

  const bounds = L.latLngBounds(polylinePositions);

  return (
    <MapContainer
      bounds={bounds}
      boundsOptions={{ padding: [56, 56] }}
      scrollWheelZoom={false}
      className="h-full w-full"
      attributionControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />

      {/* Dashed ghost line for shadow */}
      <Polyline
        positions={polylinePositions}
        pathOptions={{
          color: "rgb(28 33 41)",
          weight: 6,
          opacity: 0.06,
        }}
      />
      {/* Main ink line */}
      <Polyline
        positions={polylinePositions}
        pathOptions={{
          color: polylineColor,
          weight: 1.8,
          opacity: 0.95,
          dashArray: "6 6",
          lineCap: "round",
        }}
      />

      {points.map((p, idx) => (
        <Marker
          key={`${p.city.name}-${idx}`}
          position={[p.city.coordinates.lat, p.city.coordinates.lng]}
          icon={makeMarker(p.label, p.variant)}
        >
          <Tooltip
            direction="top"
            offset={[0, -16]}
            opacity={1}
            className="compass-tooltip"
          >
            <span style={{ fontFamily: "var(--font-display)", fontSize: 13 }}>
              {p.city.name}
            </span>
          </Tooltip>
        </Marker>
      ))}
    </MapContainer>
  );
}
