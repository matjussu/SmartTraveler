"use client";

/**
 * Wrapper PDFDownloadLink + TripPdfDocument côté client uniquement.
 *
 * Cf. `pdf-preview-block.tsx` — même raison : isoler @react-pdf hors du bundle SSR.
 */

import { PDFDownloadLink } from "@react-pdf/renderer";
import type { Trip } from "@/mocks/trips";
import { TripPdfDocument } from "./trip-pdf-document";

type ChildrenRender = (state: { loading: boolean }) => React.ReactNode;

export default function PdfDownloadButton({
  trip,
  fileName,
  children,
}: {
  trip: Trip;
  fileName: string;
  children: ChildrenRender;
}) {
  return (
    <PDFDownloadLink
      document={<TripPdfDocument trip={trip} />}
      fileName={fileName}
      className="dl-link"
    >
      {(state) => children({ loading: state.loading })}
    </PDFDownloadLink>
  );
}
