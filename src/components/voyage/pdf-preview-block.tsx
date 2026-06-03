"use client";

/**
 * Wrapper PDFViewer + TripPdfDocument côté client uniquement.
 *
 * Tout l'import @react-pdf/renderer reste isolé dans ce fichier.
 * `<ExportView>` le charge via `dynamic(() => import(...), { ssr: false })`,
 * ce qui garantit qu'aucune dépendance @react-pdf n'atterrit dans le bundle
 * SSR de la route — sinon Next bail out client-side et le viewer ne monte pas.
 */

import { PDFViewer } from "@react-pdf/renderer";
import type { Trip } from "@/mocks/trips";
import { TripPdfDocument } from "./trip-pdf-document";

export default function PdfPreviewBlock({ trip }: { trip: Trip }) {
  return (
    <PDFViewer
      width="100%"
      height={800}
      showToolbar={false}
      style={{ border: "none", borderRadius: 8 }}
    >
      <TripPdfDocument trip={trip} />
    </PDFViewer>
  );
}
