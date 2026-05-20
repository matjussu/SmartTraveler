"use client";

import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Tooltip } from "react-leaflet";
import L from "leaflet";
import type { City, Leg } from "@/mocks/trips";

type Props = {
  startCity: City;
  legs: Leg[];
  accent?: "ember" | "helios" | "lichen" | "aurora";
};

function makeMarker(label: string, variant: "start" | "stop") {
  const cls = ["concorde-marker", variant === "start" ? "concorde-marker--start" : ""]
    .filter(Boolean)
    .join(" ");
  return L.divIcon({
    className: "concorde-marker-wrap",
    html: `<div class="${cls}">${label}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

export default function TripMap({ startCity, legs, accent = "aurora" }: Props) {
  const points = useMemo(() => {
    const pts: { city: City; label: string; variant: "start" | "stop" }[] = [
      { city: startCity, label: "1", variant: "start" },
    ];
    legs.forEach((leg, i) => {
      if (i === legs.length - 1 && leg.to.name === startCity.name) return;
      pts.push({
        city: leg.to,
        label: `${i + 2}`,
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
    accent === "ember"
      ? "rgb(225 110 80)"
      : accent === "helios"
      ? "rgb(235 165 80)"
      : accent === "lichen"
      ? "rgb(140 220 165)"
      : "rgb(110 195 240)"; /* aurora */

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
        url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
      />
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png"
        opacity={0.7}
      />

      {/* Glow halo line */}
      <Polyline
        positions={polylinePositions}
        pathOptions={{
          color: lineColor,
          weight: 14,
          opacity: 0.12,
        }}
      />
      {/* Mid glow */}
      <Polyline
        positions={polylinePositions}
        pathOptions={{
          color: lineColor,
          weight: 6,
          opacity: 0.25,
        }}
      />
      {/* Main line */}
      <Polyline
        positions={polylinePositions}
        pathOptions={{
          color: lineColor,
          weight: 2.5,
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
            offset={[0, -14]}
            opacity={1}
          >
            <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600 }}>
              {p.city.name}
            </span>
          </Tooltip>
        </Marker>
      ))}
    </MapContainer>
  );
}
