# /trip/[id]/compare — Notes design engineering

## Intention
3 colonnes parallèles, même séquence villes, 3 philosophies. Pas de switcher dynamique : tout est lisible d'un coup.

## Architecture
- `page.tsx` (server) : `getTripById(id)` + `notFound()` strict (pas de fallback), passe `<TopNav />` + `<CompareView trip={trip} />`.
- `compare-view.tsx` (client) : `'use client'` car 3 `<TripMap />` via `dynamic({ ssr: false })`.
- `max-w-7xl` (vs 6xl du result) pour respirer les 3 colonnes desktop.

## Voice (zéro hit banned)
- H1 : "Trois façons d'*arriver là-bas*." — italique sur "arriver là-bas".
- Sub italique : "La même séquence de villes, trois philosophies de voyage. Choisissez celle qui vous ressemble."
- CTA card : "Choisir cette version" (aria-label dérivé : "Choisir la version {label} pour {trip.name}").
- Section tableau : "Différences clés" — display italique sur "clés".
- Tagline footer : "SmartTraveler optimise pour vous — vous, vous choisissez."

## Pattern card (boarding-ticket)
Header soft accent → perforation → mini-carte → stats trio (mono+tabular-nums) → segments condensés → CTA plein accent. Hauteur égalisée via `flex flex-col` + `flex-1` sur la liste segments.

## Caveat Leaflet 3x
3 instances `<TripMap />` simultanées = 3x runtime react-leaflet + 3 fitBounds. Mesuré OK en dev local (build mocks). À surveiller si dataset > 6 legs/alt ou sur mobile bas de gamme. Fallback prévu (polyline SVG simple) noté dans la spec si dégradation perçue.

Note : TripMap force `minHeight: 360px` en interne (besoin du result fullsize). Sur compare, on aligne la zone hôte à `height: 300px` et on accepte la min-height effective pour éviter layout-shift. Touche pas à `trip-map.tsx` (utilisé aussi par result-view).

## A11y
- `aria-label` descriptif sur chaque mini-carte et chaque CTA "Choisir cette version" (sinon les 3 sont indistinguables au lecteur d'écran).
- `motion-reduce:transition-none` + `hover:scale-100` sur le CTA pour respecter `prefers-reduced-motion`.
- Tableau "Différences clés" : labels critères répétés en `md:hidden` côté mobile (chaque cellule devient lisible isolément quand grille collapse).

## Choix Emil
- Hover card : `boarding-ticket:hover` global → `translateY(-2px)` + border-color shift. Pas de scale (boarding pass = objet physique, pas un bouton).
- CTA : `scale-[1.01]` hover + `scale-[0.99]` active — instant feedback, pas de drama.
- Couleurs accent depuis tokens (`--terracotta`, `--ocean`, `--sage`) — pas de hex inline. ALT_META aligné avec result-view pour cohérence cross-écran.
