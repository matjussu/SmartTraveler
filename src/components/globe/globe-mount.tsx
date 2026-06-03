"use client";

import dynamic from "next/dynamic";

/**
 * Wrapper client pour <DottedGlobe>.
 *
 * `dynamic(ssr:false)` est interdit dans un Server Component (page.tsx est server),
 * donc on isole l'import dynamique ici, dans un composant `"use client"`, comme le
 * projet le fait déjà pour TripMap (shared-view) et le viewer PDF (export-view).
 * Le globe touche window/WebGL → ssr:false évite tout rendu serveur.
 */
const DottedGlobe = dynamic(
  () => import("./dotted-globe").then((m) => m.DottedGlobe),
  {
    ssr: false,
    loading: () => (
      <div
        aria-hidden
        className="aspect-square rounded-full border border-[#ff7a1a]/15"
        style={{ width: "clamp(240px, 36vh, 440px)" }}
      />
    ),
  }
);

export function GlobeMount() {
  return <DottedGlobe />;
}
