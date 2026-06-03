## /trip/[id]/export

**Aperçu PDF + actions** sur un voyage calculé. Server lit `getTripById`, délègue à `ExportView` client qui monte `PDFViewer` + `PDFDownloadLink` (@react-pdf/renderer) en dynamic SSR-false.

### Décisions design notables
- **Fonts built-in only** (Helvetica/Helvetica-Oblique/Courier). Register Instrument Serif ajouterait ~250kB pour 1 page A4 — pas rentable. L'italique d'Helvetica-Oblique garde le caractère du design web.
- **Palette transcrite en hex** — `@react-pdf` ne parse pas oklch. Helper `tint(hex)` mix 86% cream pour les variantes -soft sans dupliquer chaque token.
- **`window.print()` + `@media print` CSS** masque TopNav/breadcrumb/aside (`.export-chrome`). Le viewer PDF reste seul à l'impression — pas d'iframe-print fragile.
- **CTA hiérarchie 3-tiers** : terracotta solid (download) → ocean-soft outlined (print) → ghost link (retour).

### Voice spec (zero hit banned : midnight | aurora | cyan | cockpit | console | trajectoire | plan de vol | ETD | ETA | boarding gate | backdrop-blur | download trip)
- [x] "Votre *récapitulatif imprimable*." · "Que souhaitez-vous ?" · "Trois actions, à votre rythme."
- [x] "Télécharger le PDF" · "Imprimer maintenant" · "Retour à l'itinéraire"
- [x] "Le voyage commence sur papier." · "Édité le {date}" · "Composé avec SmartTraveler"

### Files
- `src/app/trip/[id]/export/page.tsx` — server, `PageProps<"/trip/[id]/export">`, `notFound()` fallback.
- `src/components/voyage/export-view.tsx` — client, dynamic PDFViewer/Link, layout 12-col, sticky aside, CSS print scoped.
- `src/components/voyage/trip-pdf-document.tsx` — Document A4, header brandé, 3 sections (Le voyage / Itinéraire choisi / Comparatif), footer fixed.

### Caveats
- `pickPrimaryAlternative()` = `cheapest` par défaut. Pour refléter le choix `/result` : `?alt=...` ou Zustand.
- `window.print()` imprime le viewer iframe — Chrome OK, Safari < 16 peut imprimer blanc. Fallback : download + print natif système.
- `showToolbar={false}` → l'UX est portée par les 3 CTAs de l'aside. Si toolbar réactivée, retirer "Imprimer maintenant" (redondance).
