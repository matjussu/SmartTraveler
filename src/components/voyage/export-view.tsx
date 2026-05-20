"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import type { Trip } from "@/mocks/trips";

/**
 * @react-pdf/renderer accède à window/canvas. On isole TOUT l'import (PDFViewer,
 * PDFDownloadLink, ET le document TripPdfDocument) dans 2 sub-components client
 * chargés en dynamic({ ssr: false }) — sinon le bundler SSR tire react-pdf via
 * l'import statique de TripPdfDocument et la route bail-out en client rendering
 * (le viewer reste alors bloqué sur le placeholder).
 */
const PdfPreviewBlock = dynamic(
  () => import("./pdf-preview-block"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[800px] w-full items-center justify-center rounded-[12px] bg-[oklch(0.96_0.012_75)] text-[12px] text-ink-mute">
        Préparation du récapitulatif…
      </div>
    ),
  }
);

const PdfDownloadButton = dynamic(() => import("./pdf-download-button"), {
  ssr: false,
});

export function ExportView({ trip }: { trip: Trip }) {
  const fileName = `smarttraveler-${trip.id}.pdf`;

  // L'action "Imprimer" ouvre la boîte d'impression du navigateur.
  // Les @media print dans globals.css cachent la chrome (top-nav, aside actions),
  // pour ne laisser que le viewer PDF — l'utilisateur imprime depuis le PDF natif.
  const handlePrint = () => {
    if (typeof window !== "undefined") window.print();
  };

  return (
    <main className="export-page mx-auto w-full max-w-6xl px-6 pt-10 pb-24">
      {/* Breadcrumb */}
      <div className="export-chrome mb-6 flex items-center gap-3 text-[12px] text-ink-mute">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 transition-colors duration-150 hover:text-ink"
        >
          <span aria-hidden>←</span>
          <span>Vos itinéraires</span>
        </Link>
        <span aria-hidden>·</span>
        <span>{trip.name}</span>
        <span aria-hidden>·</span>
        <span
          className="text-ink"
          style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
        >
          Exporter
        </span>
      </div>

      {/* Hero */}
      <section className="export-chrome mb-10">
        <h1
          className="text-[clamp(36px,5vw,56px)] leading-[1.02] tracking-[-0.012em] text-ink"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Votre <span style={{ fontStyle: "italic" }}>récapitulatif imprimable</span>
          <span style={{ fontStyle: "italic", color: "var(--terracotta-ink)" }}>.</span>
        </h1>
        <p
          className="mt-4 max-w-xl text-[15px] leading-[1.55] text-ink-soft"
          style={{ fontStyle: "italic" }}
        >
          Téléchargez ou imprimez votre itinéraire. À glisser dans une pochette de voyage,
          ou à envoyer à qui vous accompagne.
        </p>
      </section>

      {/* Grid 12-col : viewer + actions */}
      <section className="grid grid-cols-12 gap-6">
        {/* PDF preview */}
        <div className="pdf-preview col-span-12 lg:col-span-8">
          <div
            className="rounded-[12px] border border-line bg-card p-2"
            style={{
              boxShadow:
                "0 1px 0 0 oklch(1 0 0), 0 18px 36px -22px oklch(0.215 0.028 38 / 0.18)",
            }}
          >
            <PdfPreviewBlock trip={trip} />
          </div>
          <p className="export-chrome mt-3 text-[11.5px] text-ink-mute">
            Aperçu généré localement. Aucun envoi serveur — votre voyage reste sur votre
            appareil.
          </p>
        </div>

        {/* Actions sticky */}
        <aside className="export-chrome col-span-12 lg:col-span-4">
          <div className="lg:sticky lg:top-24">
            <div className="rounded-[18px] border border-line bg-surface p-6">
              <div className="text-[10px] uppercase tracking-[0.14em] text-ink-mute">
                Trois actions
              </div>
              <h2
                className="mt-1 text-[24px] leading-[1.1] tracking-tight text-ink"
                style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
              >
                Que souhaitez-vous ?
              </h2>
              <p
                className="mt-2 text-[13px] text-ink-soft"
                style={{ fontStyle: "italic" }}
              >
                Trois actions, à votre rythme.
              </p>

              <div className="mt-6 flex flex-col gap-3">
                {/* Télécharger */}
                <PdfDownloadButton trip={trip} fileName={fileName}>
                  {({ loading }) => (
                    <span
                      className="group inline-flex w-full items-center justify-between gap-2 rounded-full bg-[var(--terracotta)] px-5 py-3 text-[13.5px] font-medium text-[oklch(0.99_0.005_80)] transition-transform duration-200 ease-out hover:scale-[1.01] active:scale-[0.98]"
                      style={{
                        boxShadow:
                          "0 8px 22px -14px oklch(0.62 0.155 38 / 0.55)",
                      }}
                    >
                      <span>
                        {loading ? "Composition du PDF…" : "Télécharger le PDF"}
                      </span>
                      <span
                        aria-hidden
                        className="text-base leading-none"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        ↓
                      </span>
                    </span>
                  )}
                </PdfDownloadButton>

                {/* Imprimer */}
                <button
                  type="button"
                  onClick={handlePrint}
                  className="group inline-flex w-full items-center justify-between gap-2 rounded-full border border-[var(--ocean)] bg-[var(--ocean-soft)] px-5 py-3 text-[13.5px] font-medium text-[var(--ocean-ink)] transition-transform duration-200 ease-out hover:scale-[1.01] active:scale-[0.98]"
                >
                  <span>Imprimer maintenant</span>
                  <span
                    aria-hidden
                    className="text-[15px] leading-none"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    ⎙
                  </span>
                </button>

                {/* Retour */}
                <Link
                  href={`/trip/${trip.id}/result`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-line bg-surface px-5 py-3 text-[13px] text-ink-soft transition-colors duration-150 hover:border-line-strong hover:text-ink"
                >
                  <span aria-hidden>←</span>
                  <span>Retour à l&apos;itinéraire</span>
                </Link>
              </div>

              <div className="mt-6 border-t border-line pt-4">
                <p
                  className="text-[12.5px] text-ink-mute"
                  style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
                >
                  Le voyage commence sur papier.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </section>

      {/* Print CSS — cache la chrome, garde uniquement le PDF viewer */}
      <style jsx global>{`
        @media print {
          header,
          footer,
          .export-chrome {
            display: none !important;
          }
          .pdf-preview {
            grid-column: 1 / -1 !important;
            width: 100% !important;
          }
          body {
            background: white !important;
          }
        }
        .dl-link {
          text-decoration: none;
        }
      `}</style>
    </main>
  );
}
