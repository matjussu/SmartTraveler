"use client";

import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Tooltip } from "react-leaflet";
import L from "leaflet";
import type { City, Leg } from "@/mocks/trips";

type Props = {
  startCity: City;
  legs: Leg[];
  accent?: "ice" | "lime" | "coral" | "amber";
};

function makeMarker(label: string, variant: "start" | "stop") {
  const cls = ["atlas-marker", variant === "start" ? "atlas-marker--start" : ""]
    .filter(Boolean)
    .join(" ");
  return L.divIcon({
    className: "atlas-marker-wrap",
    html: `<div class="${cls}">${label}</div>`,
    iconSize: [28, 22],
    iconAnchor: [14, 11],
  });
}

export default function TripMap({ startCity, legs, accent = "ice" }: Props) {
  const points = useMemo(() => {
    const pts: { city: City; label: string; variant: "start" | "stop" }[] = [
      { city: startCity, label: "0", variant: "start" },
    ];
    legs.forEach((leg, i) => {
      if (i === legs.length - 1 && leg.to.name === startCity.name) return;
      pts.push({
        city: leg.to,
        label: `${i + 1}`,
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

  const lineColor =
    accent === "lime"
      ? "rgb(176 226 110)"
      : accent === "coral"
      ? "rgb(230 130 95)"
      : accent === "amber"
      ? "rgb(228 184 100)"
      : "rgb(150 220 240)"; /* ice */

  const bounds = L.latLngBounds(polylinePositions);

  return (
    <MapContainer
      bounds={bounds}
      boundsOptions={{ padding: [60, 60] }}
      scrollWheelZoom={false}
      className="h-full w-full"
      attributionControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      {/* Outer glow line */}
      <Polyline
        positions={polylinePositions}
        pathOptions={{
          color: lineColor,
          weight: 8,
          opacity: 0.15,
        }}
      />
      {/* Inner main line */}
      <Polyline
        positions={polylinePositions}
        pathOptions={{
          color: lineColor,
          weight: 2,
          opacity: 1,
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
            offset={[0, -12]}
            opacity={1}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              {p.city.name}
            </span>
          </Tooltip>
        </Marker>
      ))}
    </MapContainer>
  );
}
